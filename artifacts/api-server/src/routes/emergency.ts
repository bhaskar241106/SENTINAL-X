import { Router, type IRouter } from "express";
import { EMERGENCY_DATA, COUNTRIES } from "../data/bimstec";
import { GetEmergencyContactsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/emergency/:countryCode", async (req, res): Promise<void> => {
  const parsed = GetEmergencyContactsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = parsed.data.countryCode.toUpperCase();
  const emergency = EMERGENCY_DATA[code];
  const country = COUNTRIES.find((c) => c.code === code);

  if (!emergency || !country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.json({
    country: code,
    countryName: country.name,
    ...emergency,
  });
});

export default router;
