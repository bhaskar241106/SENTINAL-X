import { Router, type IRouter } from "express";
import { COUNTRIES, TRAFFIC_LAWS } from "../data/bimstec";
import { SearchLawsQueryParams, CompareLawsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/laws/search", async (req, res): Promise<void> => {
  const parsed = SearchLawsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, country } = parsed.data;
  const query = q.toLowerCase();
  const countryFilter = country ? country.toUpperCase() : null;

  const results = TRAFFIC_LAWS.filter((law) => {
    const matchesCountry = !countryFilter || law.country === countryFilter;
    const matchesQuery =
      law.title.toLowerCase().includes(query) ||
      law.description.toLowerCase().includes(query) ||
      law.category.toLowerCase().includes(query) ||
      law.act.toLowerCase().includes(query) ||
      law.section.toLowerCase().includes(query);
    return matchesCountry && matchesQuery;
  });

  res.json(results);
});

router.get("/laws/compare", async (req, res): Promise<void> => {
  const parsed = CompareLawsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category } = parsed.data;
  const categoryFilter = category.toLowerCase();

  const comparison = COUNTRIES.map((c) => {
    const laws = TRAFFIC_LAWS.filter(
      (l) => l.country === c.code && l.category.toLowerCase() === categoryFilter
    );
    return {
      country: c.code,
      countryName: c.name,
      flag: c.flag,
      laws,
    };
  }).filter((entry) => entry.laws.length > 0);

  res.json(comparison);
});

export default router;
