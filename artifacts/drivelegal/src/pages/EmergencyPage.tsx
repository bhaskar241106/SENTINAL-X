import { useState } from "react";
import { useGetEmergencyContacts, useListCountries, getGetEmergencyContactsQueryKey } from "@workspace/api-client-react";
import { useCountry } from "@/App";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Phone, CheckSquare, Shield, FileText, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmergencyPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [sosActive, setSosActive] = useState(false);
  const { data: countries } = useListCountries();
  const { data: emergency, isLoading } = useGetEmergencyContacts(selectedCountry, {
    query: {
      enabled: !!selectedCountry,
      queryKey: getGetEmergencyContactsQueryKey(selectedCountry),
    },
  });

  const country = countries?.find((c) => c.code === selectedCountry);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h1 className="text-2xl font-bold tracking-tight">SOS & Emergency</h1>
        </div>
        <p className="text-muted-foreground text-sm">Emergency contacts, accident checklist, and first-response guidance</p>
      </div>

      {/* Country Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Country:</label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48" data-testid="select-emergency-country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c) => (
              <SelectItem key={c.code} value={c.code} data-testid={`option-emergency-country-${c.code}`}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {country && <span className="text-sm text-muted-foreground">Drive {country.drivingSide === "left" ? "LEFT" : "RIGHT"}</span>}
      </div>

      {/* SOS Button */}
      <div className="flex justify-center py-4">
        <button
          onClick={() => setSosActive((v) => !v)}
          data-testid="button-sos"
          className={cn(
            "w-48 h-48 rounded-full border-8 font-black text-3xl tracking-widest transition-all duration-300 shadow-2xl select-none",
            sosActive
              ? "bg-red-600 border-red-400 text-white scale-110 animate-pulse shadow-red-500/50"
              : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:scale-105 hover:shadow-red-300/50 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
          )}
        >
          SOS
        </button>
      </div>

      {sosActive && emergency && (
        <div className="bg-red-600 text-white rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-300" data-testid="sos-panel">
          <p className="text-xl font-bold">EMERGENCY ACTIVATED</p>
          <p className="text-sm opacity-90">{emergency.countryName} — Call immediately:</p>
          <div className="grid grid-cols-3 gap-4">
            <a href={`tel:${emergency.police}`} className="bg-white/20 rounded-xl p-3 hover:bg-white/30 transition-colors">
              <p className="text-xs opacity-75">Police</p>
              <p className="text-2xl font-black">{emergency.police}</p>
            </a>
            <a href={`tel:${emergency.ambulance}`} className="bg-white/20 rounded-xl p-3 hover:bg-white/30 transition-colors">
              <p className="text-xs opacity-75">Ambulance</p>
              <p className="text-2xl font-black">{emergency.ambulance}</p>
            </a>
            <a href={`tel:${emergency.fire}`} className="bg-white/20 rounded-xl p-3 hover:bg-white/30 transition-colors">
              <p className="text-xs opacity-75">Fire</p>
              <p className="text-2xl font-black">{emergency.fire}</p>
            </a>
          </div>
        </div>
      )}

      {/* Emergency Numbers */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : emergency ? (
        <>
          <Card className="border border-red-200/50 bg-red-50/30 dark:bg-red-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                <Phone className="w-4 h-4" />
                Emergency Numbers — {emergency.countryName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <EmergencyNumber label="Police" number={emergency.police} color="text-blue-600 dark:text-blue-400" />
                <EmergencyNumber label="Ambulance" number={emergency.ambulance} color="text-red-600 dark:text-red-400" />
                <EmergencyNumber label="Fire" number={emergency.fire} color="text-orange-600 dark:text-orange-400" />
                {emergency.trafficPolice && (
                  <EmergencyNumber label="Traffic Police" number={emergency.trafficPolice} color="text-green-600 dark:text-green-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* FIR Checklist */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Accident FIR Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {emergency.firChecklist.map((item, idx) => (
                  <ChecklistItem key={idx} index={idx + 1} text={item} />
                ))}
              </CardContent>
            </Card>

            {/* Insurance Tips */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Insurance Claim Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergency.insuranceTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-2.5 text-sm">
                    <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tourist Warning */}
          <Card className="border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <span className="font-semibold">Tourist Tip:</span> Always carry your passport, international driving permit, and vehicle insurance documents. Keep emergency numbers saved in your phone before crossing borders.
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function EmergencyNumber({ label, number, color }: { label: string; number: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-background border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <a href={`tel:${number}`} data-testid={`emergency-number-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        <p className={cn("text-2xl font-black font-mono hover:underline cursor-pointer", color)}>{number}</p>
      </a>
    </div>
  );
}

function ChecklistItem({ index, text }: { index: number; text: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      onClick={() => setChecked((v) => !v)}
      className="flex items-start gap-2.5 w-full text-left group"
      data-testid={`checklist-item-${index}`}
    >
      <div className={cn(
        "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
        checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
      )}>
        {checked && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3L9 1"/></svg>}
      </div>
      <span className={cn("text-xs leading-relaxed", checked && "line-through text-muted-foreground")}>
        <span className="font-semibold text-foreground mr-1.5">{index}.</span>
        {text}
      </span>
    </button>
  );
}
