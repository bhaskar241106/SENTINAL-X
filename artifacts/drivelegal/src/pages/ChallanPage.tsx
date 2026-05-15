import { useState } from "react";
import { useCountry } from "@/App";
import { useListViolations, useListCountries } from "@workspace/api-client-react";
import { useCalculateChallan } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, AlertTriangle, CheckCircle2, Receipt, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const VEHICLE_CLASSES = [
  { value: "two_wheeler", label: "Two-wheeler / Motorcycle" },
  { value: "car", label: "Car / Private Vehicle" },
  { value: "heavy_vehicle", label: "Truck / Heavy Vehicle" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700 border-red-200" },
  high: { label: "High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low: { label: "Low", color: "bg-green-100 text-green-700 border-green-200" },
};

export default function ChallanPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [violationId, setViolationId] = useState("");
  const [vehicleClass, setVehicleClass] = useState("car");
  const [result, setResult] = useState<null | {
    violation: string; country: string; vehicleClass: string; baseFine: number; surcharge: number;
    courtFee: number; total: number; currency: string; currencySymbol: string; usdEquivalent: number;
    legalSection: string; paymentMethods: string[]; severity: string;
  }>(null);

  const { data: countries } = useListCountries();
  const { data: violations, isLoading: violationsLoading } = useListViolations({
    country: selectedCountry,
  });

  const calculate = useCalculateChallan();

  async function handleCalculate() {
    if (!violationId || !vehicleClass) return;
    const res = await calculate.mutateAsync({
      data: { country: selectedCountry, violationId, vehicleClass },
    });
    setResult(res);
  }

  const grouped: Record<string, typeof violations> = {};
  violations?.forEach((v) => {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category]?.push(v);
  });

  const severity = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Fine Calculator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Calculate exact traffic violation fines with legal citations</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Calculate Fine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Country</label>
              <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setViolationId(""); setResult(null); }}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c.code} value={c.code} data-testid={`option-country-${c.code}`}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Violation Type</label>
              {violationsLoading ? (
                <Skeleton className="h-10 rounded-md" />
              ) : (
                <Select value={violationId} onValueChange={(v) => { setViolationId(v); setResult(null); }}>
                  <SelectTrigger data-testid="select-violation">
                    <SelectValue placeholder="Select violation..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(grouped).map(([category, vios]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">{category}</div>
                        {vios?.map((v) => (
                          <SelectItem key={v.id} value={v.id} data-testid={`option-violation-${v.id}`}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Vehicle Class</label>
              <Select value={vehicleClass} onValueChange={(v) => { setVehicleClass(v); setResult(null); }}>
                <SelectTrigger data-testid="select-vehicle-class">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_CLASSES.map((v) => (
                    <SelectItem key={v.value} value={v.value} data-testid={`option-vehicle-${v.value}`}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleCalculate}
              disabled={!violationId || !vehicleClass || calculate.isPending}
              data-testid="button-calculate"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Fine
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <div>
          {!result && !calculate.isPending && (
            <Card className="border h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a violation and click Calculate</p>
              </CardContent>
            </Card>
          )}

          {calculate.isPending && (
            <Card className="border h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border" data-testid="challan-result">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{result.violation}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{result.legalSection}</p>
                  </div>
                  {severity && (
                    <Badge className={cn("text-xs border", severity.color)}>{severity.label}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fine Breakdown */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Fine</span>
                    <span className="font-medium">{result.currencySymbol}{result.baseFine.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Surcharge</span>
                    <span className="font-medium">{result.currencySymbol}{result.surcharge.toLocaleString()}</span>
                  </div>
                  {result.courtFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Court Fee</span>
                      <span className="font-medium">{result.currencySymbol}{result.courtFee.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <div className="text-right">
                      <div className="text-lg">{result.currencySymbol}{result.total.toLocaleString()} {result.currency}</div>
                      <div className="text-xs text-muted-foreground font-normal">≈ USD ${result.usdEquivalent}</div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment Options</p>
                  <div className="space-y-1.5">
                    {result.paymentMethods.map((method) => (
                      <div key={method} className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Fines may vary based on officer discretion. Verify with local traffic authority.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
