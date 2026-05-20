import { useState, useEffect, useRef, useCallback } from "react";
import { useCountry, useApi } from "@/App";
import { STATIC_COUNTRIES } from "@/lib/static-data";
import { OfflineMapFallback } from "@/components/OfflineMapFallback";
import { useListCountries, useListAccidents, useReportAccident, getListAccidentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Zap,
  Clock,
  Wind,
  AlertTriangle,
  MapPin,
  Activity,
  RefreshCw,
  Car,
  TrendingDown,
  Navigation,
  Radio,
  Cpu,
  Target,
  Layers
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const WEATHER_OPTIONS = [
  { value: "clear", label: "Clear", icon: "☀️" },
  { value: "cloudy", label: "Cloudy", icon: "☁️" },
  { value: "rain", label: "Rain", icon: "🌧️" },
  { value: "heavy_rain", label: "Heavy Rain", icon: "⛈️" },
  { value: "fog", label: "Fog", icon: "🌫️" },
  { value: "storm", label: "Storm", icon: "🌪️" },
];

const VEHICLE_CLASSES = [
  { value: "two_wheeler", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "heavy_vehicle", label: "Truck / HV" },
];

const RISK_COLORS = {
  critical: { ring: "ring-red-500", bg: "bg-red-500", text: "text-red-500", badge: "bg-red-500/20 text-red-400 border-red-500/50" },
  high: { ring: "ring-orange-500", bg: "bg-orange-500", text: "text-orange-500", badge: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
  medium: { ring: "ring-yellow-500", bg: "bg-yellow-500", text: "text-yellow-500", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
  low: { ring: "ring-green-500", bg: "bg-green-500", text: "text-green-500", badge: "bg-green-500/20 text-green-400 border-green-500/50" },
};

interface RiskAnalysis {
  survivabilityScore: number;
  overallRisk: "critical" | "high" | "medium" | "low";
  speedRisk: number;
  fatigueRisk: number;
  weatherRisk: number;
  distractionRisk: number;
  challanProbability: number;
  aiAnalysis: string;
  warnings: string[];
  recommendations: string[];
  nearbyBlackspots: Array<{ name: string; type: string; riskLevel: string; description: string }>;
}

export default function SentinelPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { baseUrl, isOffline } = useApi();
  const { data: countriesData } = useListCountries();
  const countries = countriesData || STATIC_COUNTRIES;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [speed, setSpeed] = useState(60);
  const [weather, setWeather] = useState("clear");
  const [vehicle, setVehicle] = useState("car");
  const [fatigueMinutes, setFatigueMinutes] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [fatigueTimer, setFatigueTimer] = useState(0);
  const [reportingAccident, setReportingAccident] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const lastSpokenRef = useRef<string>("");

  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fatigueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const reportAccident = useReportAccident();
  const { data: accidents } = useListAccidents({ country: selectedCountry }, {
    query: { queryKey: getListAccidentsQueryKey({ country: selectedCountry }) },
  });

  const hourOfDay = new Date().getHours();

  function speak(text: string) {
    if (!synthRef.current || !text || text === lastSpokenRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
    lastSpokenRef.current = text;
  }

  const analyze = useCallback(async (overrideSpeed?: number) => {
    setLoading(true);
    try {
      let cleanBaseUrl = baseUrl.trim();
      if (cleanBaseUrl && !cleanBaseUrl.startsWith("http")) {
        cleanBaseUrl = `http://${cleanBaseUrl}`;
      }
      const apiUrl = cleanBaseUrl ? `${cleanBaseUrl.replace(/\/$/, "")}/api/sentinel/analyze` : "/api/sentinel/analyze";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speedKmh: overrideSpeed ?? speed,
          country: selectedCountry,
          lat: null,
          lng: null,
          hourOfDay,
          weatherCondition: weather,
          fatigueMinutes: fatigueTimer > 0 ? fatigueTimer : fatigueMinutes,
          vehicleClass: vehicle,
        }),
      });
      const data = await response.json();
      setAnalysis(data);
      if (data.aiAnalysis) {
        speak(data.aiAnalysis);
      }
    } catch {
      toast({ title: "Sentinel Error", description: "Could not reach risk analysis server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [speed, selectedCountry, hourOfDay, weather, fatigueTimer, fatigueMinutes, vehicle, toast]);

  useEffect(() => {
    analyze();
  }, []);

  function startGPS() {
    if (!navigator.geolocation) {
      toast({ title: "GPS unavailable", description: "Geolocation not supported in this browser.", variant: "destructive" });
      return;
    }
    setGpsActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const kmh = pos.coords.speed != null ? Math.round(pos.coords.speed * 3.6) : null;
        if (kmh != null) {
          setGpsSpeed(kmh);
          setSpeed(kmh);
        }
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true }
    );
  }

  function stopGPS() {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    setGpsActive(false);
    setGpsSpeed(null);
  }

  function toggleLive() {
    if (isLive) {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      if (fatigueIntervalRef.current) clearInterval(fatigueIntervalRef.current);
      setIsLive(false);
    } else {
      setIsLive(true);
      setFatigueTimer(0);
      fatigueIntervalRef.current = setInterval(() => setFatigueTimer((t) => t + 1), 60000);
      liveIntervalRef.current = setInterval(() => analyze(), 30000);
      analyze();
    }
  }

  useEffect(() => () => {
    if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    if (fatigueIntervalRef.current) clearInterval(fatigueIntervalRef.current);
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  async function handleReportAccident() {
    setReportingAccident(true);
    await reportAccident.mutateAsync({
      data: {
        country: selectedCountry,
        speedKmh: speed,
        weather,
        timeOfDay: `${hourOfDay}:00`,
        severity: analysis?.overallRisk ?? "medium",
        description: `Sentinel-X incident. Vehicle: ${vehicle}, Speed: ${speed} km/h, Weather: ${weather}`,
      },
    });
    qc.invalidateQueries({ queryKey: getListAccidentsQueryKey({ country: selectedCountry }) });
    toast({ title: "Reported", description: "Accident added to Memory Engine." });
    setReportingAccident(false);
  }

  const colors = analysis ? RISK_COLORS[analysis.overallRisk] : RISK_COLORS.low;
  const score = analysis?.survivabilityScore ?? 100;

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("max-w-[1600px] mx-auto space-y-10 relative")}>
      {/* HUD Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-10">
        <div className="absolute inset-0 scan-effect opacity-10" />
        <div className="absolute inset-0 bg-grid-white opacity-10" />
      </div>

      {/* Critical Danger HUD Frame */}
      {analysis?.overallRisk === "critical" && (
        <div className="fixed inset-0 pointer-events-none border-[16px] border-red-500/20 animate-pulse z-[60]">
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600 text-white font-black text-xs tracking-[0.5em] uppercase shadow-[0_0_20px_rgba(239,68,68,0.5)]">
             CRITICAL THREAT DETECTED
           </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex items-end justify-between relative z-10 border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] font-black tracking-[0.4em] uppercase border-primary/30 text-primary bg-primary/5 px-3 py-1">
                Sentinel-X v4.8 // Neural Defense
              </Badge>
              {isLive && (
                <Badge className="bg-green-500 text-white font-black text-[10px] tracking-widest animate-pulse border-none px-3 py-1">
                  LIVE TELEMETRY
                </Badge>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent uppercase">
              Mission Control
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
           <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48 bg-black/40 border-white/10 rounded-xl h-12 font-black text-xs tracking-widest uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              {(Array.isArray(countries) ? countries : [])?.map((c) => (
                <SelectItem key={c.code} value={c.code} className="font-bold text-xs">{c.flag} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="lg"
            variant={isLive ? "destructive" : "default"}
            onClick={toggleLive}
            className="h-12 px-8 font-black tracking-widest uppercase rounded-xl shadow-lg shadow-primary/20"
          >
            {isLive ? <Radio className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
            {isLive ? "ABORT LINK" : "ESTABLISH UPLINK"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* LEFT: Parameters HUD */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-2">
                <Cpu className="w-3 h-3 text-primary" />
                Telemetry Ingest
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Speed HUD */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Velocity Vector</label>
                  <div className="text-right">
                    <div className="text-4xl font-black tabular-nums tracking-tighter text-primary leading-none">
                      {gpsSpeed ?? speed}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">KM/H</div>
                  </div>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => { setSpeed(v); setGpsSpeed(null); }}
                  min={0} max={180} step={5}
                  className="w-full"
                  disabled={gpsActive}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className={cn("w-full h-10 font-black tracking-widest uppercase text-[10px] border-white/10", gpsActive ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5")}
                  onClick={gpsActive ? stopGPS : startGPS}
                >
                  <Navigation className={cn("w-3 h-3 mr-2", gpsActive && "animate-pulse")} />
                  {gpsActive ? "GPS LINK ACTIVE" : "ACQUIRE GPS SPEED"}
                </Button>
              </div>

              {/* Weather HUD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atmospheric Load</label>
                <div className="grid grid-cols-3 gap-2">
                  {WEATHER_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setWeather(w.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300",
                        weather === w.value
                          ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                          : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      <span className="text-xl mb-1">{w.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle HUD */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Classification</label>
                <div className="grid grid-cols-1 gap-2">
                  {VEHICLE_CLASSES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => setVehicle(v.value)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 text-left",
                        vehicle === v.value
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{v.label}</span>
                      {vehicle === v.value && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full h-14 bg-primary text-primary-foreground font-black tracking-[0.3em] uppercase shadow-lg shadow-primary/30"
                onClick={() => analyze()}
                disabled={loading}
              >
                <RefreshCw className={cn("w-5 h-5 mr-3", loading && "animate-spin")} />
                {loading ? "PROCESSING..." : "RUN ANALYSIS"}
              </Button>
            </CardContent>
          </Card>

          {/* Accident Memory Card */}
          <Card className="glass-panel border-red-500/20 !bg-red-500/5 tactical-border before:!border-red-500 after:!border-red-500">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Neural Memory Ingest</p>
                  <p className="text-[9px] font-bold text-red-400/60 uppercase">Improve Local Intelligence</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
                Log local incidents to reinforce Sentinel-X's prediction model for this sector.
              </p>
              <Button
                variant="destructive"
                className="w-full h-11 font-black tracking-widest uppercase text-xs bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40"
                onClick={handleReportAccident}
                disabled={reportingAccident || reportAccident.isPending}
              >
                REPORT INCIDENT
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Core HUD Display */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <Card className={cn("glass-panel border-white/10 transition-all duration-1000 relative overflow-hidden h-[480px] flex flex-col items-center justify-center", analysis ? colors.ring + " ring-2" : "")}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
            
            {/* HUD Rings Decoration */}
            <div className="absolute w-[400px] h-[400px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[360px] h-[360px] border border-white/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Survivability Rating</p>
              
              <div className="relative w-72 h-72">
                <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={score >= 75 ? "#22c55e" : score >= 55 ? "#eab308" : score >= 30 ? "#f97316" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-2000 ease-in-out"
                  />
                  {/* Decorative Pointers */}
                  <line x1="60" y1="6" x2="60" y2="12" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                  <line x1="60" y1="108" x2="60" y2="114" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                  <line x1="6" y1="60" x2="12" y2="60" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                  <line x1="108" y1="60" x2="114" y2="60" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={cn("text-8xl font-black tabular-nums tracking-tighter leading-none mb-2", analysis ? colors.text : "text-foreground")}>
                    {score}
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1", colors.badge)}>
                    {analysis?.overallRisk ?? "CALIBRATING"} RISK
                  </Badge>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-10">
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Time Slice</p>
                    <p className="text-xl font-bold font-mono text-primary">{hourOfDay}:00</p>
                 </div>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fatigue Ingest</p>
                    <p className="text-xl font-bold font-mono text-primary">{isLive ? fatigueTimer : fatigueMinutes}M</p>
                 </div>
              </div>
            </div>
          </Card>

          {/* Detailed Risk HUD */}
          {analysis && (
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
               <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-2">
                  <Target className="w-3 h-3 text-primary" />
                  Telemetry Vectors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 gap-x-10 gap-y-6">
                <RiskTelemetry label="Velocity Strain" value={analysis.speedRisk} icon={<Car className="w-3 h-3" />} />
                <RiskTelemetry label="Biometric Fatigue" value={analysis.fatigueRisk} icon={<Clock className="w-3 h-3" />} />
                <RiskTelemetry label="Atmospheric Drag" value={analysis.weatherRisk} icon={<Wind className="w-3 h-3" />} />
                <RiskTelemetry label="Cognitive Load" value={analysis.distractionRisk} icon={<TrendingDown className="w-3 h-3" />} />
              </CardContent>
              <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-white/5">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Challan Probability Index</span>
                    <Badge variant="outline" className={cn("font-black text-[10px] tracking-widest", analysis.challanProbability > 60 ? "text-red-500 border-red-500/30" : "text-green-500 border-green-500/30")}>
                      {analysis.challanProbability}% THREAT
                    </Badge>
                 </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT: Tactical Intel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI Tactical Readout */}
          {analysis && (
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
              <CardHeader className="pb-4 border-b border-white/5 bg-primary/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-primary flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Neural Analysis Readout
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-xs font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                  "{analysis.aiAnalysis}"
                </p>

                {analysis.warnings.length > 0 && (
                  <div className="space-y-2">
                    {analysis.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 text-[11px] p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span className="font-bold uppercase tracking-tight">{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Recommendations</p>
                   <div className="space-y-2">
                      {analysis.recommendations.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-foreground bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {r}
                        </div>
                      ))}
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tactical Map */}
          <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-2">
                <Layers className="w-3 h-3 text-primary" />
                Sector Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="h-64 rounded-xl overflow-hidden border border-white/10 relative grayscale hover:grayscale-0 transition-all duration-700">
                {!isOffline ? (
                  <MapContainer center={[23.6850, 86.8950]} zoom={4} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {analysis?.nearbyBlackspots.map((spot, i) => (
                      <Marker key={i} position={[23.6850 + (Math.random() - 0.5) * 5, 86.8950 + (Math.random() - 0.5) * 5]}>
                        <Popup>
                          <div className="text-xs">
                            <p className="font-black uppercase tracking-widest">{spot.name}</p>
                            <p className="text-muted-foreground text-[10px] mt-1">{spot.type}</p>
                            <Badge className={cn("mt-2 text-[9px] font-black", RISK_COLORS[spot.riskLevel as keyof typeof RISK_COLORS]?.badge ?? "bg-gray-800")}>
                              {spot.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <OfflineMapFallback className="h-full border-none" />
                )}
              </div>
              
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Proximal Hazards</p>
                 <div className="space-y-2">
                    {analysis?.nearbyBlackspots.slice(0, 2).map((spot, i) => (
                      <div key={i} className="p-3 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start mb-1">
                           <p className="text-[11px] font-black uppercase tracking-widest leading-none">{spot.name}</p>
                           <Badge variant="outline" className={cn("text-[8px] font-black py-0 px-2 h-4", RISK_COLORS[spot.riskLevel as keyof typeof RISK_COLORS]?.text ?? "text-muted-foreground")}>
                             {spot.riskLevel.toUpperCase()}
                           </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{spot.description}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RiskTelemetry({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
           <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('bg-', 'bg-'))} />
           {label}
        </span>
        <span className="text-xs font-black tabular-nums">{value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
