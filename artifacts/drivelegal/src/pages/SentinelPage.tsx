import { useState, useEffect, useRef, useCallback } from "react";
import { useCountry } from "@/App";
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
} from "lucide-react";
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
  critical: { ring: "ring-red-500", bg: "bg-red-500", text: "text-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  high: { ring: "ring-orange-500", bg: "bg-orange-500", text: "text-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  medium: { ring: "ring-yellow-500", bg: "bg-yellow-500", text: "text-yellow-500", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  low: { ring: "ring-green-500", bg: "bg-green-500", text: "text-green-500", badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
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
  const { data: countries } = useListCountries();
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

  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fatigueIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const reportAccident = useReportAccident();
  const { data: accidents } = useListAccidents({ country: selectedCountry }, {
    query: { queryKey: getListAccidentsQueryKey({ country: selectedCountry }) },
  });

  const hourOfDay = new Date().getHours();

  const analyze = useCallback(async (overrideSpeed?: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/sentinel/analyze", {
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Sentinel-X</h1>
            <Badge variant="outline" className="text-xs font-mono">LIVE RISK INTELLIGENCE</Badge>
            {isLive && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs animate-pulse gap-1">
                <Radio className="w-3 h-3" /> LIVE
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">AI-powered death prevention score and road danger prediction</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-sentinel-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={isLive ? "destructive" : "default"}
            onClick={toggleLive}
            data-testid="button-toggle-live"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            {isLive ? "Stop Live" : "Start Live"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Controls */}
        <div className="space-y-4">
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Driving Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Speed */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Speed</label>
                  <div className="flex items-center gap-1.5">
                    {gpsActive && <Badge className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1"><Navigation className="w-2.5 h-2.5" />GPS</Badge>}
                    <span className="text-lg font-bold tabular-nums">{gpsSpeed ?? speed}</span>
                    <span className="text-xs text-muted-foreground">km/h</span>
                  </div>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => { setSpeed(v); setGpsSpeed(null); }}
                  min={0} max={180} step={5}
                  className="w-full"
                  data-testid="slider-speed"
                  disabled={gpsActive}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span><span>180 km/h</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 text-xs h-7"
                  onClick={gpsActive ? stopGPS : startGPS}
                  data-testid="button-gps"
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  {gpsActive ? "Stop GPS" : "Use GPS Speed"}
                </Button>
              </div>

              {/* Weather */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Weather</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {WEATHER_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      onClick={() => setWeather(w.value)}
                      data-testid={`weather-${w.value}`}
                      className={cn(
                        "flex flex-col items-center gap-0.5 p-2 rounded-lg border text-xs transition-all",
                        weather === w.value
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      )}
                    >
                      <span className="text-base">{w.icon}</span>
                      <span className="leading-tight text-center">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Vehicle</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {VEHICLE_CLASSES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => setVehicle(v.value)}
                      data-testid={`vehicle-${v.value}`}
                      className={cn(
                        "p-2 rounded-lg border text-xs transition-all",
                        vehicle === v.value
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-border hover:border-primary/40 text-muted-foreground"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fatigue */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driving Time</label>
                  <span className="text-sm font-bold">{isLive ? fatigueTimer : fatigueMinutes} min</span>
                </div>
                {!isLive && (
                  <Slider
                    value={[fatigueMinutes]}
                    onValueChange={([v]) => setFatigueMinutes(v)}
                    min={0} max={480} step={15}
                    className="w-full"
                    data-testid="slider-fatigue"
                  />
                )}
                {isLive && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 text-center">
                    <Clock className="w-3 h-3 inline mr-1" />Auto-tracking since session start
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => analyze()}
                disabled={loading}
                data-testid="button-analyze"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                {loading ? "Analyzing..." : "Analyze Now"}
              </Button>
            </CardContent>
          </Card>

          {/* Accident Report */}
          <Card className="border border-red-200/50 bg-red-50/20 dark:bg-red-950/10">
            <CardContent className="p-4">
              <p className="text-xs font-semibold mb-2 text-red-700 dark:text-red-400">Accident Memory Engine</p>
              <p className="text-xs text-muted-foreground mb-3">Report this incident to improve AI predictions for future drivers.</p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs"
                onClick={handleReportAccident}
                disabled={reportingAccident || reportAccident.isPending}
                data-testid="button-report-accident"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Report Incident
              </Button>
              {accidents && accidents.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {accidents.length} incidents recorded in {countries?.find((c) => c.code === selectedCountry)?.name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Score + Risk Bars */}
        <div className="space-y-4">
          {/* Survivability Score */}
          <Card className={cn("border-2 transition-all", analysis ? colors.ring : "border-border")}>
            <CardContent className="p-6 flex flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Death Prevention Score</p>
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={score >= 75 ? "#22c55e" : score >= 55 ? "#eab308" : score >= 30 ? "#f97316" : "#ef4444"}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-4xl font-black tabular-nums", analysis ? colors.text : "text-foreground")}>{score}</span>
                  <span className="text-xs text-muted-foreground font-medium">/100</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                {analysis ? (
                  <>
                    <Badge className={cn("text-sm px-3 py-0.5 font-bold uppercase tracking-wider", colors.badge)}>
                      {analysis.overallRisk} risk
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Hour: {hourOfDay}:00 {hourOfDay >= 22 || hourOfDay <= 5 ? "🌙 Night" : "☀️ Day"}</p>
                  </>
                ) : (
                  <Badge variant="outline">Loading...</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Breakdown */}
          {analysis && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Risk Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RiskBar label="Speed Risk" value={analysis.speedRisk} icon={<Car className="w-3.5 h-3.5" />} />
                <RiskBar label="Fatigue Risk" value={analysis.fatigueRisk} icon={<Clock className="w-3.5 h-3.5" />} />
                <RiskBar label="Weather Risk" value={analysis.weatherRisk} icon={<Wind className="w-3.5 h-3.5" />} />
                <RiskBar label="Distraction Risk" value={analysis.distractionRisk} icon={<TrendingDown className="w-3.5 h-3.5" />} />
                <div className="pt-1 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Challan Probability</span>
                    <span className={cn("font-bold", analysis.challanProbability > 60 ? "text-red-500" : analysis.challanProbability > 30 ? "text-yellow-500" : "text-green-500")}>
                      {analysis.challanProbability}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: AI Analysis + Blackspots */}
        <div className="space-y-4">
          {/* AI Analysis */}
          {analysis && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Sentinel-X AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis.aiAnalysis}</p>

                {analysis.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    {analysis.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        {w}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Recommendations</p>
                    <div className="space-y-1">
                      {analysis.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <span className="text-primary font-bold mt-0.5">→</span>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Blackspots */}
          {analysis && analysis.nearbyBlackspots.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Digital Twin: Known Blackspots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.nearbyBlackspots.map((spot, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-card space-y-1" data-testid={`blackspot-${i}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-tight">{spot.name}</p>
                      <Badge className={cn("text-xs shrink-0", RISK_COLORS[spot.riskLevel as keyof typeof RISK_COLORS]?.badge ?? "bg-gray-100 text-gray-700")}>
                        {spot.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{spot.type}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{spot.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Accident History */}
          {accidents && accidents.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Accident Memory Engine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {accidents.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0">
                    <Badge className={cn("text-xs shrink-0", RISK_COLORS[a.severity as keyof typeof RISK_COLORS]?.badge ?? "bg-gray-100 text-gray-700")}>
                      {a.severity}
                    </Badge>
                    <span className="text-muted-foreground truncate">{a.description ?? `${a.cause ?? "Unknown cause"} — ${a.weather ?? "?"} conditions`}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 70 ? "bg-red-500" : value >= 40 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">{icon}{label}</span>
        <span className="font-bold tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
