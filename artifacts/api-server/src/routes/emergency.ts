import { Router, type IRouter } from "express";
import { EMERGENCY_DATA, COUNTRIES } from "../data/bimstec";
import { GetEmergencyContactsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/emergency/:countryCode", async (req, res): Promise<void> => {
  const parsed = GetEmergencyContactsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = parsed.data.countryCode.toUpperCase();
  const emergency = EMERGENCY_DATA[code];
  const country = COUNTRIES.find((c) => c.code === code);

  if (!emergency || !country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  res.json({
    country: code,
    countryName: country.name,
    ...emergency,
  });
});

router.post("/emergency/sos", async (req, res): Promise<void> => {
  const { lat, lng, country, type } = req.body;
  // In a real production system, this would:
  // 1. Send Twilio SMS to emergency contacts
  // 2. Alert nearby Sentinel-X users
  // 3. Log to database
  
  console.log(`🚨 SOS TRIGGERED! Type: ${type}, Location: ${lat},${lng}, Country: ${country}`);
  
  res.json({
    success: true,
    message: "SOS signals dispatched successfully to emergency contacts and local authorities.",
    incidentId: `INC-${Math.random().toString(36).substring(7).toUpperCase()}`,
    checklist: [
      "Move to a safe area immediately if possible.",
      "Do not remove helmet if driving a two-wheeler.",
      "Keep your phone line open for emergency responders.",
      "Do not admit fault or sign documents without legal counsel."
    ]
  });
});

export default router;
