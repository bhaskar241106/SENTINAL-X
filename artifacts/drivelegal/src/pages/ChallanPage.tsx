import { useState, useRef } from "react";
import { useCountry, useApi } from "@/App";
import { useListViolations, useListCountries, useListStates } from "@workspace/api-client-react";
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
import { Calculator, AlertTriangle, CheckCircle2, Receipt, CreditCard, Camera, ScanText, RefreshCw, Layers, Shield, Activity, Target, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const VEHICLE_CLASSES = [
  { value: "two_wheeler", label: "Motorcycle" },
  { value: "car", label: "Private Vehicle" },
  { value: "heavy_vehicle", label: "Heavy Vehicle" },
];

const INDIA_STATES = [
  { code: "DL", name: "Delhi" },
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "GJ", name: "Gujarat" },
  { code: "RJ", name: "Rajasthan" },
  { code: "WB", name: "West Bengal" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "HR", name: "Haryana" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "CRITICAL", color: "bg-red-500/20 text-red-400 border-red-500/50" },
  high: { label: "HIGH", color: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  medium: { label: "MEDIUM", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
  low: { label: "LOW", color: "bg-green-500/20 text-green-400 border-green-500/50" },
};

const COUNTRY_LANGUAGES: Record<string, string> = {
  IN: "en-IN", // India: Indian English
  TH: "th-TH", // Thailand: Thai
  BD: "bn-BD", // Bangladesh: Bengali
  NP: "ne-NP", // Nepal: Nepali
  LK: "si-LK", // Sri Lanka: Sinhala
  BT: "en-US", // Bhutan: English fallback
  MM: "en-US", // Myanmar: English fallback
};

export default function ChallanPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { baseUrl } = useApi();
  const [violationId, setViolationId] = useState("");
  const [vehicleClass, setVehicleClass] = useState("car");
  const [selectedState, setSelectedState] = useState("");
  const [result, setResult] = useState<null | {
    violation: string; country: string; vehicleClass: string; baseFine: number; surcharge: number;
    courtFee: number; total: number; currency: string; currencySymbol: string; usdEquivalent: number;
    legalSection: string; paymentMethods: string[]; severity: string;
    state?: string | null; stateMultiplier?: number | null;
  }>(null);

  const { data: dbStates } = useListStates();
  const statesList = dbStates || INDIA_STATES;

  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionData, setVisionData] = useState<any | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const { toast } = useToast();

  const { data: countries } = useListCountries();
  const { data: violations, isLoading: violationsLoading } = useListViolations({
    country: selectedCountry,
  });

  const calculate = useCalculateChallan();

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice language matching the active country
    const lang = COUNTRY_LANGUAGES[selectedCountry] || "en-US";
    utterance.lang = lang;

    // Search local browser speech voices matching target country language
    if (synthRef.current.getVoices) {
      const voices = synthRef.current.getVoices();
      const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  }

  async function handleCalculate() {
    if (!violationId || !vehicleClass) return;
    const res = await calculate.mutateAsync({
      data: { 
        country: selectedCountry, 
        violationId, 
        vehicleClass,
        state: selectedCountry === "IN" && selectedState ? selectedState : undefined 
      },
    });
    setResult(res);
  }

  async function handleVisionUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setVisionImage(base64);
      setVisionLoading(true);
      setVisionData(null);

      try {
        let cleanBaseUrl = baseUrl.trim();
        if (cleanBaseUrl && !cleanBaseUrl.startsWith("http")) {
          cleanBaseUrl = `http://${cleanBaseUrl}`;
        }
        const apiUrl = cleanBaseUrl ? `${cleanBaseUrl.replace(/\/$/, "")}/api/vision/analyze` : "/api/vision/analyze";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const data = await response.json();
        if (data.success) {
          try {
            const parsed = typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis;
            setVisionData(parsed);
            if (parsed.violation && parsed.violation !== "NOT_FOUND") {
              const voiceMsg = `Analysis complete. Violation detected: ${parsed.violation}. Fine amount is ${parsed.fine_amount || "not specified"}.`;
              speak(voiceMsg);
            }
          } catch (e) {
            setVisionData({ raw: data.analysis });
          }
        } else {
          toast({ title: "Vision Error", description: data.error || "Failed to analyze image.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Network Error", description: "Failed to connect to Vision Engine.", variant: "destructive" });
      } finally {
        setVisionLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const grouped: Record<string, typeof violations> = {};
  (Array.isArray(violations) ? violations : [])?.forEach((v) => {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category]?.push(v);
  });

  const severity = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 relative">
      {/* HUD Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-grid-white" />
      </div>

      {/* Header */}
      <div className="flex items-end justify-between relative z-10 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <Calculator className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="text-[10px] font-black tracking-[0.4em] uppercase border-primary/20 text-primary bg-primary/5 px-3 py-1 mb-2">
              Module: Financial Enforcement
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent uppercase">
              Fine Calculator
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200">
           <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl h-12 font-black text-xs tracking-widest uppercase text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              {(Array.isArray(countries) ? countries : [])?.map((c) => (
                <SelectItem key={c.code} value={c.code} className="font-bold text-xs">{c.flag} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* LEFT: Vision Engine HUD */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                <Camera className="w-4 h-4 text-primary" />
                Vision Intelligence Core
              </CardTitle>
              <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary font-black text-[9px] tracking-widest">SENTINEL-VISION v2.0</Badge>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <label className={cn(
                  "relative h-64 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-black/20 group overflow-hidden",
                  visionLoading && "scan-effect"
                )}>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ScanText className="w-12 h-12 text-primary/40 mb-4 group-hover:scale-110 group-hover:text-primary transition-all" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white">Ingest Document</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleVisionUpload} />
                </label>

                {visionImage ? (
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 h-64 bg-black/40 group">
                    <img src={visionImage} alt="Uploaded" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-6">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Asset Captured</p>
                       <p className="text-xs font-bold text-white/90">Ready for neural analysis</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Awaiting Visual Input</p>
                  </div>
                )}
              </div>

              {visionLoading && (
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 flex items-center gap-6 animate-pulse">
                   <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                   <div>
                     <p className="text-sm font-black text-primary uppercase tracking-widest">Analyzing Telemetry...</p>
                     <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">Neural Indices: Cross-Referencing</p>
                   </div>
                </div>
              )}

              {visionData && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <VisionMetric label="Violation Node" value={visionData.violation} isPriority={true} />
                    <VisionMetric label="Penalty Index" value={visionData.fine_amount} isHighlight={true} />
                    <VisionMetric label="Asset ID (Plate)" value={visionData.vehicle_plate} isMono={true} />
                    <VisionMetric label="Temporal Node" value={visionData.date_time} />
                  </div>
                  
                  {visionData.raw_transcription && (
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Raw OCR Buffer</p>
                       <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-[10px] leading-relaxed text-green-400 shadow-inner max-h-32 overflow-y-auto">
                         {visionData.raw_transcription}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Manual Calculation Matrix */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                <Target className="w-4 h-4 text-primary" />
                Parameter Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Violation Vector</label>
                  {violationsLoading ? (
                    <Skeleton className="h-12 rounded-xl bg-slate-100" />
                  ) : (
                    <Select value={violationId} onValueChange={(v) => { setViolationId(v); setResult(null); }}>
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs text-slate-700">
                        <SelectValue placeholder="SELECT VIOLATION TYPE..." />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {Object.entries(grouped).map(([category, vios]) => (
                          <div key={category}>
                            <div className="px-3 py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5">{category}</div>
                            {vios?.map((v) => (
                              <SelectItem key={v.id} value={v.id} className="text-xs font-bold">{v.name}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Classification</label>
                  <Select value={vehicleClass} onValueChange={(v) => { setVehicleClass(v); setResult(null); }}>
                    <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel">
                      {VEHICLE_CLASSES.map((v) => (
                        <SelectItem key={v.value} value={v.value} className="font-bold text-xs">{v.label.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry === "IN" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-primary" />
                      State / UT (India)
                    </label>
                    <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setResult(null); }}>
                      <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl font-bold text-xs text-slate-700">
                        <SelectValue placeholder="SELECT STATE (OPTIONAL)..." />
                      </SelectTrigger>
                      <SelectContent className="glass-panel max-h-64">
                        <SelectItem value="" className="font-bold text-xs text-muted-foreground">NATIONAL (DEFAULT)</SelectItem>
                        {statesList.map((s) => (
                          <SelectItem key={s.code} value={s.code} className="font-bold text-xs">{s.name.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  className="w-full h-14 bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase shadow-lg shadow-primary/30 mt-4"
                  onClick={handleCalculate}
                  disabled={!violationId || !vehicleClass || calculate.isPending}
                >
                  <RefreshCw className={cn("w-5 h-5 mr-3", calculate.isPending && "animate-spin")} />
                  {calculate.isPending ? "PROCESSING..." : "CALCULATE PENALTY"}
                </Button>
              </div>

              {result && (
                <div className="space-y-6 animate-in zoom-in-95 duration-500 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight uppercase">{result.violation}</h3>
                      <p className="text-[10px] font-bold text-primary/60 tracking-widest uppercase">{result.legalSection}</p>
                      {result.state && (
                        <Badge variant="outline" className="mt-2 text-[9px] font-black px-2 py-0.5 bg-blue-500/10 border-blue-500/30 text-blue-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {result.state} (×{result.stateMultiplier})
                        </Badge>
                      )}
                    </div>
                    {severity && (
                       <Badge variant="outline" className={cn("text-[9px] font-black px-3 py-1 tracking-widest uppercase", severity.color)}>
                         {severity.label}
                       </Badge>
                    )}
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-inner">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Base Fine</span>
                      <span>{result.currencySymbol}{result.baseFine.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Surcharge</span>
                      <span>{result.currencySymbol}{result.surcharge.toLocaleString()}</span>
                    </div>
                    {result.courtFee > 0 && (
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span>Court Fee</span>
                        <span>{result.currencySymbol}{result.courtFee.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Total Penalty</span>
                      <div className="text-right">
                        <div className="text-3xl font-black font-mono tracking-tighter text-foreground">
                          {result.currencySymbol}{result.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground/50 mt-1 uppercase">≈ USD ${result.usdEquivalent} (EST.)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Uplinks</p>
                     <div className="grid grid-cols-2 gap-3">
                        {result.paymentMethods.map((method) => (
                          <div key={method} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                             <CreditCard className="w-4 h-4 text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-tight">{method}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-tight">
                      System alert: Local enforcement may vary based on sector officer discretion. Always request official digital summons.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VisionMetric({ label, value, isPriority = false, isHighlight = false, isMono = false }: { label: string; value: string; isPriority?: boolean; isHighlight?: boolean; isMono?: boolean; }) {
  const displayValue = value && value !== "NOT_FOUND" ? value : "DATA NULL";
  const isEmpty = !value || value === "NOT_FOUND";

  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all duration-300",
      isPriority ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/10",
      isHighlight && !isEmpty ? "bg-red-500/10 border-red-500/30" : ""
    )}>
      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">{label}</p>
      <p className={cn(
        "text-sm font-black truncate uppercase tracking-tight",
        isEmpty ? "text-white/20 italic" : "text-foreground",
        isHighlight && !isEmpty ? "text-red-500" : "",
        isMono ? "font-mono" : ""
      )}>
        {displayValue}
      </p>
    </div>
  );
}
