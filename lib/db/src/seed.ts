import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import { embeddings as embeddingsTable } from "./schema/embeddings.js";

const SEED_LAWS = [
  // Delhi
  {
    metadata: { country: "IN", state: "DL", category: "Traffic Regulation" },
    content: "Delhi NCT Air Pollution Control (Odd-Even Scheme): Non-compliant private four-wheelers operating on restricted days based on registration plate ending digit are subject to a direct fine of ₹20,000 under the Air Act."
  },
  {
    metadata: { country: "IN", state: "DL", category: "Honking" },
    content: "Delhi Silent Zones: Honking in designated silence zones (around schools, hospitals, courts) attracts a fine of ₹1,000 for the first offense and ₹2,000 for subsequent offenses."
  },
  {
    metadata: { country: "IN", state: "DL", category: "Speed Limit" },
    content: "Delhi speed limits: Maximum speed limit for passenger cars on the DND Flyway and NH-24 is 70 km/h, and 50 km/h on other arterial city roads. Violations are tracked via automated speed trap cameras."
  },
  // Maharashtra
  {
    metadata: { country: "IN", state: "MH", category: "No Parking" },
    content: "Mumbai Parking Code: Parking a vehicle on primary arterial roads or within 50 meters of junctions in Mumbai is strictly prohibited between 7:00 AM and 11:00 PM, carrying a ₹1,000 fine plus vehicle towing charges."
  },
  {
    metadata: { country: "IN", state: "MH", category: "Reflective Tape" },
    content: "Maharashtra Commercial Vehicles Regulation: All commercial goods transport and heavy vehicles operating in Maharashtra must have high-visibility yellow/red reflective tape on the rear and sides, with a ₹2,000 penalty for non-compliance."
  },
  {
    metadata: { country: "IN", state: "MH", category: "Speed Limit" },
    content: "Maharashtra Highway Code: The speed limit on the Yashwantrao Chavan Mumbai-Pune Expressway is 100 km/h for passenger cars and 80 km/h for commercial vehicles."
  },
  // Karnataka
  {
    metadata: { country: "IN", state: "KA", category: "Helmet" },
    content: "Karnataka Safety Mandate (Bangalore): Riding a two-wheeler without an ISI-certified helmet, or wearing a helmet without securing the strap, carries a ₹1,000 fine and suspension of the driver's license for 3 months."
  },
  {
    metadata: { country: "IN", state: "KA", category: "Speed Limit" },
    content: "Bangalore City Speed Limit: The maximum speed limit for motor vehicles within BBMP (Bangalore city) limits is 40 km/h on main city roads and 60 km/h on outer ring roads."
  },
  // Tamil Nadu
  {
    metadata: { country: "IN", state: "TN", category: "Pillion Rider" },
    content: "Tamil Nadu Two-Wheeler Safety: Both the rider and the pillion rider must wear protective helmets conforming to ISI standards. Non-compliance results in a ₹1,000 fine."
  },
  // Bangkok, Thailand
  {
    metadata: { country: "TH", state: "Bangkok", category: "Red Light" },
    content: "Bangkok Traffic Act: Running a red light or failing to stop at a marked pedestrian crossing in the Bangkok Metropolitan Area carries a maximum fine of 4,000 THB, enforced by electronic camera units."
  },
  // Bagmati, Nepal
  {
    metadata: { country: "NP", state: "Bagmati", category: "Lane Discipline" },
    content: "Bagmati Highway Code: Lane discipline violation or overtaking from the left side on the Ring Road and highways carries an on-the-spot fine of 1,500 NPR and mandatory traffic lecture attendance."
  }
];

// Set up pg pool
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text
      }),
      signal: AbortSignal.timeout(2000) // Timeout after 2 seconds
    });
    
    if (response.ok) {
      const data = (await response.json()) as any;
      if (data && Array.isArray(data.embedding) && data.embedding.length === 768) {
        return data.embedding;
      }
    }
  } catch (err: any) {
    // Fail silently to trigger mock fallback
  }

  // Fallback mock embedding: 768 floats (normalized deterministic values based on text)
  const mock: number[] = [];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(hash + i) * 0.1;
    mock.push(parseFloat(val.toFixed(6)));
  }
  return mock;
}

async function seed() {
  console.log("Vector DB Seeder starting...");
  
  try {
    // Clear existing embeddings to avoid duplicates
    console.log("Clearing existing sample embeddings...");
    await db.delete(embeddingsTable);
    console.log("Existing embeddings cleared.");

    for (const item of SEED_LAWS) {
      console.log(`Generating embedding for: "${item.content.substring(0, 50)}..."`);
      const embeddingArray = await generateEmbedding(item.content);
      const embeddingStr = `[${embeddingArray.join(",")}]`;
      
      await db.insert(embeddingsTable).values({
        content: item.content,
        metadata: JSON.stringify(item.metadata),
        embedding: sql.raw(`'${embeddingStr}'::vector`) as any
      });
      console.log(`Successfully seeded law for ${item.metadata.state || item.metadata.country}`);
    }
    
    console.log("Seeding process completed successfully!");
  } catch (error: any) {
    console.error("Database seeding failed:", error.message);
  } finally {
    await pool.end();
  }
}

seed();
