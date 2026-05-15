import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { AnalyzeSentinelRiskBody } from "@workspace/api-zod";
import { COUNTRIES } from "../data/bimstec";

const router: IRouter = Router();

const BLACKSPOT_DB: Record<string, Array<{ name: string; type: string; riskLevel: string; description: string }>> = {
  IN: [
    { name: "Delhi-Meerut Expressway KM 14-18", type: "Expressway", riskLevel: "critical", description: "High-speed merge zone; 47 fatalities in 2024. Frequent overtaking accidents at dawn." },
    { name: "Mumbai-Pune Expressway Khopoli Ghat", type: "Highway Ghat", riskLevel: "critical", description: "Sharp descents with fog pockets. Brake failure incidents common in heavy vehicles." },
    { name: "Bangalore Outer Ring Road (Marathahalli Junction)", type: "Urban Intersection", riskLevel: "high", description: "Highest challan-density zone in Karnataka. 24/7 CCTV enforcement." },
    { name: "NH-44 Karnal Bypass", type: "National Highway", riskLevel: "high", description: "Night driving blackspot. Unlit stretches with stray cattle crossing." },
  ],
  TH: [
    { name: "Chatuchak Junction, Bangkok", type: "Urban Intersection", riskLevel: "critical", description: "Highest accident density in Bangkok. Peak hours: 7-9AM, 5-7PM." },
    { name: "Pattaya-Bangkok Highway (Route 7)", type: "Highway", riskLevel: "high", description: "Drunk driving hotspot, especially Friday-Sunday nights after 22:00." },
    { name: "Chiang Mai Ring Road North", type: "Urban Ring Road", riskLevel: "high", description: "Fog during winter months. Motorcycle fatality hotspot." },
  ],
  NP: [
    { name: "Prithvi Highway Malekhu-Mugling", type: "Mountain Highway", riskLevel: "critical", description: "Landslide-prone. Narrow single-lane stretches with river gorge drops." },
    { name: "Kathmandu Ring Road Balkhu Junction", type: "Urban Junction", riskLevel: "high", description: "Top challan zone. Speed camera active. Pedestrian crossing blind spots." },
  ],
  BD: [
    { name: "Dhaka-Chittagong Highway (Comilla Bypass)", type: "National Highway", riskLevel: "critical", description: "Highest road fatality rate per km in Bangladesh. Night bus accidents common." },
    { name: "Dhaka-Mymensingh Road Tongi Bridge", type: "Bridge Approach", riskLevel: "high", description: "Sudden lane merges. Heavy truck traffic 2-6AM." },
  ],
  LK: [
    { name: "Southern Expressway E01 (Pinnaduwa Exit)", type: "Expressway", riskLevel: "high", description: "High-speed accident zone. Sudden deceleration from 110 to 40 km/h." },
    { name: "Kandy Road Ambepussa Junction", type: "National Road", riskLevel: "critical", description: "Blind curve before junction. Multiple bus collision history." },
  ],
  BT: [
    { name: "Paro-Thimphu Highway (Dochu La Pass)", type: "Mountain Pass", riskLevel: "critical", description: "3,116m altitude. Ice on road October-March. Zero visibility fog common." },
    { name: "Phuentsholing-Thimphu National Highway KM 80-95", type: "Mountain Highway", riskLevel: "high", description: "Rockfall-prone zone. Single lane with no guardrails in sections." },
  ],
  MM: [
    { name: "Yangon-Mandalay Expressway KM 150-180", type: "Expressway", riskLevel: "high", description: "Poor lighting, frequent animal crossings. Remember: Myanmar drives RIGHT." },
    { name: "Yangon Ring Road Hlaing Bridge", type: "Urban Bridge", riskLevel: "high", description: "Structural stress zones. Heavy vehicle weight limit strictly enforced." },
  ],
};

function computeRisks(speedKmh: number, hourOfDay: number, fatigueMinutes: number, weatherCondition: string, country: string) {
  const countryData = COUNTRIES.find((c) => c.code === country);
  const speedLimit = country === "TH" ? 90 : 60;
  const speedExcess = Math.max(0, speedKmh - speedLimit);

  const speedRisk = Math.min(100, Math.round((speedExcess / 40) * 100));
  const fatigueRisk = Math.min(100, Math.round((fatigueMinutes / 240) * 100));
  const weatherRisk =
    weatherCondition === "clear" ? 5 :
    weatherCondition === "cloudy" ? 15 :
    weatherCondition === "rain" ? 55 :
    weatherCondition === "heavy_rain" ? 80 :
    weatherCondition === "fog" ? 85 :
    weatherCondition === "storm" ? 95 : 20;
  const nightBonus = (hourOfDay >= 22 || hourOfDay <= 5) ? 20 : hourOfDay >= 6 && hourOfDay <= 8 ? 10 : 0;
  const distractionRisk = Math.min(100, Math.round(20 + nightBonus + (fatigueMinutes > 60 ? 15 : 0)));

  const avgRisk = (speedRisk * 0.35 + fatigueRisk * 0.25 + weatherRisk * 0.25 + distractionRisk * 0.15);
  const survivabilityScore = Math.max(0, Math.min(100, Math.round(100 - avgRisk)));

  const challanProbability = Math.min(100, Math.round(
    (speedExcess > 0 ? 40 + speedExcess : 5) +
    (hourOfDay >= 8 && hourOfDay <= 20 ? 20 : 5)
  ));

  const overallRisk: "critical" | "high" | "medium" | "low" =
    survivabilityScore < 30 ? "critical" :
    survivabilityScore < 55 ? "high" :
    survivabilityScore < 75 ? "medium" : "low";

  return { speedRisk, fatigueRisk, weatherRisk, distractionRisk, survivabilityScore, challanProbability, overallRisk };
}

router.post("/sentinel/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeSentinelRiskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { speedKmh, country, lat, lng, hourOfDay, weatherCondition, fatigueMinutes, vehicleClass } = parsed.data;
  const risks = computeRisks(speedKmh, hourOfDay, fatigueMinutes, weatherCondition, country);

  const countryData = COUNTRIES.find((c) => c.code === country.toUpperCase());
  const blackspots = BLACKSPOT_DB[country.toUpperCase()] ?? [];

  const prompt = `You are Sentinel-X, an AI road safety guardian for ${countryData?.name ?? country}.

Current driving context:
- Speed: ${speedKmh} km/h
- Hour of day: ${hourOfDay}:00
- Weather: ${weatherCondition}
- Fatigue driving time: ${fatigueMinutes} minutes
- Vehicle class: ${vehicleClass}
- Survivability score: ${risks.survivabilityScore}/100
- Overall risk: ${risks.overallRisk}
- Speed risk: ${risks.speedRisk}/100
- Fatigue risk: ${risks.fatigueRisk}/100
- Weather risk: ${risks.weatherRisk}/100
- Challan probability: ${risks.challanProbability}%

Provide a concise, urgent 2-3 sentence AI analysis of this driver's current risk state. Be direct, specific, and actionable. Cite relevant ${countryData?.name ?? country} traffic law if the speed is excessive. Do NOT use markdown.`;

  let aiAnalysis = "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 256 },
    });
    aiAnalysis = response.text ?? "";
  } catch {
    aiAnalysis = `Sentinel-X analysis: Risk level is ${risks.overallRisk.toUpperCase()}. Survivability score ${risks.survivabilityScore}/100. ${risks.speedRisk > 50 ? "Reduce speed immediately." : ""} ${risks.fatigueRisk > 50 ? "Rest break required." : ""}`.trim();
  }

  const warnings: string[] = [];
  if (risks.speedRisk > 40) warnings.push(`Speed ${speedKmh} km/h exceeds safe threshold — challan risk ${risks.challanProbability}%`);
  if (risks.fatigueRisk > 40) warnings.push(`Fatigue detected after ${fatigueMinutes} min driving — mandatory 15 min break recommended`);
  if (risks.weatherRisk > 50) warnings.push(`${weatherCondition.replace("_", " ")} conditions — reduce speed by 20-30%, increase following distance`);
  if (hourOfDay >= 22 || hourOfDay <= 5) warnings.push("Night driving detected — fatality risk 3x higher. High beam responsibly.");
  if (risks.distractionRisk > 50) warnings.push("Distraction probability elevated — phone use, passenger interaction risk detected");

  const recommendations: string[] = [];
  if (risks.speedRisk > 30) recommendations.push(`Reduce to ${Math.max(40, Math.round(speedKmh * 0.8))} km/h`);
  if (fatigueMinutes > 90) recommendations.push("Take a 15-minute break immediately");
  if (risks.weatherRisk > 40) recommendations.push("Switch to low beam, increase gap to 3 seconds");
  recommendations.push("Keep emergency contacts accessible: " + (countryData?.emergencyPolice ?? "911"));
  if (risks.survivabilityScore < 60) recommendations.push("Share live location with trusted contact now");

  res.json({
    ...risks,
    aiAnalysis,
    warnings,
    recommendations,
    nearbyBlackspots: blackspots.slice(0, 3),
  });
});

export default router;
