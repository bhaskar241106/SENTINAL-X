import { pgTable, text, uuid, timestamp, varchar, customType } from "drizzle-orm/pg-core";

// Define a custom vector type if standard vector isn't fully supported in this version
const vectorType = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)'; // Gemini 1.5 flash uses 768 dimensions for text-embedding-004
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    // value is "[0.1, 0.2, ...]"
    return JSON.parse(value);
  },
});

export const embeddings = pgTable("embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON stringified metadata (e.g. { source: 'law_book_1', section: 'A' })
  embedding: vectorType("embedding").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
