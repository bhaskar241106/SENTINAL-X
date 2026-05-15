import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accidents = pgTable("accidents", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  speedKmh: real("speed_kmh"),
  weather: text("weather"),
  timeOfDay: text("time_of_day"),
  roadType: text("road_type"),
  cause: text("cause"),
  severity: text("severity").notNull().default("medium"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAccidentSchema = createInsertSchema(accidents).omit({
  id: true,
  createdAt: true,
});

export type Accident = typeof accidents.$inferSelect;
export type InsertAccident = z.infer<typeof insertAccidentSchema>;
