import { db, embeddings as embeddingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const LAWS = [
  {
    metadata: JSON.stringify({ country: "IN", state: "Telangana", category: "Traffic Fine" }),
    content: "Telangana State Traffic Rules 2024: Riding a two-wheeler without a helmet carries a fine of ₹1000. Subsequent offenses may lead to a 3-month license suspension."
  },
  {
    metadata: JSON.stringify({ country: "IN", state: "Telangana", category: "Traffic Fine" }),
    content: "Telangana State Traffic Rules 2024: Drunk driving (BAC > 30mg/100ml) carries a fine of ₹10,000 and/or 6 months imprisonment. The vehicle will be seized immediately."
  },
  {
    metadata: JSON.stringify({ country: "IN", state: "Karnataka", category: "Traffic Fine" }),
    content: "Karnataka Traffic Code 2023: Using a mobile phone while driving a car or riding a bike attracts a fine of ₹1000 for the first offense, and ₹2000 for repeated offenses."
  },
  {
    metadata: JSON.stringify({ country: "TH", state: "Bangkok", category: "Traffic Fine" }),
    content: "Bangkok Metropolitan Traffic Act: Failure to stop at a red light or pedestrian crossing incurs a maximum penalty of 4,000 THB. E-ticketing cameras are active."
  },
  {
    metadata: JSON.stringify({ country: "NP", state: "Bagmati", category: "Traffic Fine" }),
    content: "Bagmati Province Transport Act: Lane discipline violation on highways carries a spot fine of NPR 1500. Attending mandatory traffic awareness classes is required for repeated offenses."
  }
];

async function generateEmbedding(text: string) {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text
    })
  });
  const data = await response.json();
  return data.embedding;
}

async function ingest() {
  console.log("Starting Data Ingestion...");
  for (const law of LAWS) {
    console.log(`Generating embedding for: ${law.content.substring(0, 50)}...`);
    try {
      const embeddingArray = await generateEmbedding(law.content);
      if (!embeddingArray || embeddingArray.length !== 768) {
         console.warn("Invalid embedding received. Ensure 'nomic-embed-text' is pulled.");
         continue;
      }
      
      const embeddingStr = `[${embeddingArray.join(',')}]`;
      
      await db.insert(embeddingsTable).values({
        content: law.content,
        metadata: law.metadata,
        embedding: sql.raw(`'${embeddingStr}'::vector`) as any
      });
      console.log("-> Inserted successfully.");
    } catch (e: any) {
      console.error("Error inserting:", e.message);
    }
  }
  console.log("Ingestion Complete.");
}

ingest();
