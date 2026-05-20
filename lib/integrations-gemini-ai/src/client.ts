import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "mock_key";

export const ai = new GoogleGenAI({
  apiKey: apiKey,
});
