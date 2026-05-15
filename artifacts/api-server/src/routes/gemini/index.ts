import { Router, type IRouter } from "express";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";
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

  const contextHeader =
    country || mode
      ? `[Context: Country=${country ?? "unspecified"}, Mode=${mode ?? "normal"}]\n\n`
      : "";

  const chatMessages = prevMessages.map((m, idx) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: idx === 0 && m.role === "user" ? contextHeader + m.content : m.content }],
  })) as Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: chatMessages,
    config: {
      maxOutputTokens: 8192,
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    }
  }

  await db.insert(messagesTable).values({
    conversationId,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
