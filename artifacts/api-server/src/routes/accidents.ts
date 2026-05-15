import { Router, type IRouter } from "express";
import { db, accidents } from "@workspace/db";
import { ListAccidentsQueryParams, ReportAccidentBody } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/accidents", async (req, res): Promise<void> => {
  const parsed = ListAccidentsQueryParams.safeParse(req.query);
  const countryFilter = parsed.success && parsed.data.country
    ? parsed.data.country.toUpperCase()
    : null;

  const query = countryFilter
    ? db.select().from(accidents).where(eq(accidents.country, countryFilter)).orderBy(desc(accidents.createdAt))
    : db.select().from(accidents).orderBy(desc(accidents.createdAt));

  const records = await query;
  res.json(records);
});

router.post("/accidents", async (req, res): Promise<void> => {
  const parsed = ReportAccidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [record] = await db
    .insert(accidents)
    .values({
      country: parsed.data.country.toUpperCase(),
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      speedKmh: parsed.data.speedKmh ?? null,
      weather: parsed.data.weather ?? null,
      timeOfDay: parsed.data.timeOfDay ?? null,
      roadType: parsed.data.roadType ?? null,
      cause: parsed.data.cause ?? null,
      severity: parsed.data.severity,
      description: parsed.data.description ?? null,
    })
    .returning();

  res.status(201).json(record);
});

export default router;
