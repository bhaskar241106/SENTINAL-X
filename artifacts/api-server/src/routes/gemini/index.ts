import { Router, type IRouter } from "express";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import {
  CreateGeminiConversationBody,
  GetGeminiConversationParams,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  SendGeminiMessageParams,
  SendGeminiMessageBody,
} from "@workspace/api-zod";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are DriveLegal AI — the authoritative traffic law assistant for BIMSTEC nations (Bangladesh, Bhutan, India, Myanmar, Nepal, Sri Lanka, Thailand).

IDENTITY
- Expert on traffic laws for all 7 BIMSTEC countries
- Always cite the specific Act / Section when giving legal info
- Never fabricate laws. If unsure, say: "Please verify with local traffic authority."

RESPONSE FORMAT
- Lead with the direct answer in one sentence
- Follow with legal citation (Act, Section, Penalty amount)
- Currency in local denomination + USD equivalent
- End with a safety tip when relevant
- Keep responses concise and actionable

TOURIST MODE: If user mentions being a tourist or crossing borders:
- Explain in simple English
- Flag left/right-drive transitions explicitly (Myanmar drives RIGHT, all others LEFT)
- Highlight cross-border law changes proactively

VIOLATION MODE: If asked about fines/violations:
- State violation clearly
- Show fine breakdown: base + surcharge + court fee
- Suggest payment options available in that country

EMERGENCY MODE: If user mentions accident/emergency/SOS:
- Provide exact emergency numbers for the relevant country
- Output structured checklist immediately`;

router.get("/gemini/conversations", async (_req, res): Promise<void> => {
  const convos = await db
    .select()
    .from(conversationsTable)
    .orderBy(asc(conversationsTable.createdAt));
  res.json(convos);
});

router.post("/gemini/conversations", async (req, res): Promise<void> => {
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
    .returning();
  res.status(201).json(convo);
});

router.get("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const parsed = GetGeminiConversationParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, parsed.data.id));
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, parsed.data.id))
    .orderBy(asc(messagesTable.createdAt));
  res.json({ ...convo, messages });
});

router.delete("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const parsed = DeleteGeminiConversationParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, parsed.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/gemini/conversations/:id/messages", async (req, res): Promise<void> => {
  const parsed = ListGeminiMessagesParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, parsed.data.id))
    .orderBy(asc(messagesTable.createdAt));
  res.json(messages);
});

import { sql } from "drizzle-orm";

async function generateEmbedding(text: string) {
  try {
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
  } catch (e) {
    console.error("Embedding generation failed:", e);
    return null;
  }
}

router.post("/gemini/conversations/:id/messages", async (req, res): Promise<void> => {
  const paramsParsed = SendGeminiMessageParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }
  const bodyParsed = SendGeminiMessageBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const conversationId = paramsParsed.data.id;
  const { content, country, mode } = bodyParsed.data;

  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId));
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId,
    role: "user",
    content,
  });

  const prevMessages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(asc(messagesTable.createdAt));

  // RAG: Retrieve context from Vector DB
  let ragContext = "";
  const embeddingArray = await generateEmbedding(content);
  
  if (embeddingArray && embeddingArray.length === 768) {
    const embeddingStr = `[${embeddingArray.join(',')}]`;
    try {
      const relevantDocs = await db.execute(
        sql`SELECT content FROM embeddings ORDER BY embedding <=> ${sql.raw(`'${embeddingStr}'::vector`)} LIMIT 3`
      );
      if (relevantDocs.rows && relevantDocs.rows.length > 0) {
        ragContext = "\n\n### VERIFIED LOCAL LAWS FROM KNOWLEDGE BASE ###\n" + 
                     "Use the following laws to answer the user accurately. DO NOT guess if the answer is here.\n" +
                     relevantDocs.rows.map(r => r.content).join("\n\n");
      }
    } catch (e) {
      console.error("RAG Search Error:", e);
    }
  }

  const contextHeader =
    country || mode || ragContext
      ? `[Context: Country=${country ?? "unspecified"}, Mode=${mode ?? "normal"}]\n${ragContext}\n\n`
      : "";

  const chatMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...prevMessages.map((m, idx) => ({
      role: m.role,
      content: idx === prevMessages.length - 1 && m.role === "user" ? contextHeader + m.content : m.content,
    }))
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            fullResponse += parsed.message.content;
            res.write(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`);
          }
        } catch(e) {}
      }
    }

    await db.insert(messagesTable).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Local Ollama Chat Error:", error);
    if (!res.headersSent) {
      res.status(503).json({ error: "Local AI Node (Ollama) is not running. Please run 'ollama run llama3'." });
    } else {
      res.write(`data: ${JSON.stringify({ content: "\n\n[Error: Disconnected from local AI node. Please restart Ollama.]" })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  }
});

router.post("/gemini/voice", async (req, res): Promise<void> => {
  try {
    const { text, country } = req.body;
    if (!text) {
      res.status(400).json({ error: "Missing text input" });
      return;
    }

    const voicePrompt = `You are the Sentinel-X Autonomous Voice Co-Pilot. Your job is to analyze the user's voice command and return a JSON response that the app can execute.

AVAILABLE ACTIONS:
- "NAVIGATE": Path must be one of ["/", "/chat", "/challan", "/sentinel", "/geofence", "/emergency", "/profile"]
- "SET_COUNTRY": Value must be a 2-letter ISO code: ["IN", "NP", "BD", "LK", "BT", "MM", "TH"]
- "NONE": No app action needed, just chat.

OUTPUT FORMAT (JSON ONLY):
{
  "text": "The short, friendly sentence to speak to the driver",
  "action": { "type": "NAVIGATE" | "SET_COUNTRY" | "NONE", "value": "the path or country code" }
}

[DRIVER COMMAND]: ${text}
[CURRENT COUNTRY]: ${country || "IN"}

Return ONLY the JSON. No extra text.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:latest",
        prompt: voicePrompt,
        format: "json",
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const result = await response.json();
    let parsed;
    try {
      parsed = JSON.parse(result.response);
    } catch (e) {
      parsed = { text: result.response, action: { type: "NONE" } };
    }

    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Voice Assistant Error:", error);
    res.status(503).json({ error: "Failed to generate voice response. Is Ollama running?" });
  }
});

export default router;
