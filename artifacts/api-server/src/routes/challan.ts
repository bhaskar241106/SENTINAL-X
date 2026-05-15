import { Router, type IRouter } from "express";
import { VIOLATIONS, COUNTRIES } from "../data/bimstec";
import { ListViolationsQueryParams, CalculateChallanBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/challan/violations", async (req, res): Promise<void> => {
  const parsed = ListViolationsQueryParams.safeParse(req.query);
  const countryFilter = parsed.success && parsed.data.country
    ? parsed.data.country.toUpperCase()
    : null;

  const violations = VIOLATIONS
    .filter((v) => !countryFilter || v.country === countryFilter)
    .map((v) => ({ id: v.id, name: v.name, category: v.category, country: v.country }));

  res.json(violations);
});

router.post("/challan/calculate", async (req, res): Promise<void> => {
  const parsed = CalculateChallanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { country, violationId, vehicleClass } = parsed.data;
  const violation = VIOLATIONS.find((v) => v.id === violationId && v.country === country.toUpperCase());
  if (!violation) {
    res.status(400).json({ error: "Violation not found for this country" });
    return;
  }

  const countryData = COUNTRIES.find((c) => c.code === country.toUpperCase());
  if (!countryData) {
    res.status(400).json({ error: "Country not found" });
    return;
  }

  const vehicleKey = vehicleClass as keyof typeof violation.baseFineMap;
  const baseFine = violation.baseFineMap[vehicleKey] ?? violation.baseFineMap["car"] ?? 0;
  const surcharge = Math.round(baseFine * violation.surchargeRate);
  const courtFee = violation.courtFee;
  const total = baseFine + surcharge + courtFee;
  const usdEquivalent = parseFloat((total * countryData.usdRate).toFixed(2));

  res.json({
    violation: violation.name,
    country: countryData.code,
    vehicleClass,
    baseFine,
    surcharge,
    courtFee,
    total,
    currency: countryData.currency,
    currencySymbol: countryData.currencySymbol,
    usdEquivalent,
    legalSection: violation.legalSection,
    paymentMethods: violation.paymentMethods,
    severity: violation.severity,
  });
});

export default router;
