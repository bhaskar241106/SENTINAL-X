import { Router, type IRouter } from "express";
import { COUNTRIES, TRAFFIC_LAWS } from "../data/bimstec";
import { GetCountryLawsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/countries", async (_req, res): Promise<void> => {
  const result = COUNTRIES.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    currency: c.currency,
    currencySymbol: c.currencySymbol,
    drivingSide: c.drivingSide,
    emergencyPolice: c.emergencyPolice,
    emergencyAmbulance: c.emergencyAmbulance,
    emergencyFire: c.emergencyFire,
    lawsCount: c.lawsCount,
    languages: c.languages,
  }));
  res.json(result);
});

router.get("/countries/:code/laws", async (req, res): Promise<void> => {
  const parsed = GetCountryLawsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const code = parsed.data.code.toUpperCase();
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  const laws = TRAFFIC_LAWS.filter((l) => l.country === code);
  res.json(laws);
});

export default router;
