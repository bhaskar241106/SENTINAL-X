import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/vision/analyze", async (req, res): Promise<void> => {
  try {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "Missing imageBase64" });
      return;
    }

    // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Request Ollama locally
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2-vision",
        format: "json",
        prompt: prompt || `Analyze this traffic document. Output ONLY a JSON object.
Target: Identify 'fine_amount' (search for 'Total' or 'Amount') and 'vehicle_plate' (e.g., TS09PA1234).
Schema:
{
  "document_type": "challan | sign | scene",
  "violation": "Specific violation",
  "fine_amount": "Numeric total amount found",
  "vehicle_plate": "Vehicle registration plate",
  "date_time": "Transaction timestamp",
  "confidence_score": 0-100,
  "raw_transcription": "Full OCR text"
}
Be literal. Use "NOT_FOUND" for missing values.`,
        images: [base64Data],
        stream: false,
        options: {
          temperature: 0,
          num_ctx: 8192
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const result = (await response.json()) as any;

    res.json({
      success: true,
      analysis: result.response,
    });
  } catch (error: any) {
    console.error("Vision Analysis Error:", error);
    if (error?.message?.includes("fetch failed") || error?.cause?.code === "ECONNREFUSED") {
      res.status(503).json({ error: "Local AI Node (Ollama) is not running on port 11434. Please start Ollama with 'ollama run llama3.2-vision'." });
    } else {
      res.status(500).json({ error: "Failed to analyze image with Local Vision Engine." });
    }
  }
});

export default router;
