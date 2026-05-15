import { Router, type IRouter } from "express";
import { COUNTRIES, TRAFFIC_LAWS, VIOLATIONS } from "../data/bimstec";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const allLanguages = new Set<string>();
  COUNTRIES.forEach((c) => c.languages.forEach((l) => allLanguages.add(l)));

  const countriesData = COUNTRIES.map((c) => ({
    code: c.code,
    name: c.name,
    flag: c.flag,
    lawsCount: TRAFFIC_LAWS.filter((l) => l.country === c.code).length,
    violationsCount: VIOLATIONS.filter((v) => v.country === c.code).length,
  }));

  res.json({
    totalCountries: COUNTRIES.length,
    totalLaws: TRAFFIC_LAWS.length,
    totalViolationTypes: VIOLATIONS.length,
    totalLanguages: allLanguages.size,
    countriesData,
  });
});

export default router;
