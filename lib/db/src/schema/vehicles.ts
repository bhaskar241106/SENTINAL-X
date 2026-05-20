import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  licensePlate: text("license_plate").notNull(),
  vehicleClass: text("vehicle_class").notNull(), // 'two_wheeler', 'car', 'heavy_vehicle'
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
