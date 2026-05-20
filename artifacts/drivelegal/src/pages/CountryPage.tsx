import { useRoute } from "wouter";
import { useGetCountryLaws, useListCountries, getGetCountryLawsQueryKey } from "@workspace/api-client-react";
import { useCountry } from "@/App";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Phone,
  AlertTriangle,
  Car,
  Navigation,
  Search,
  Globe,
  Radio,
  FileText,
  Activity
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  low: "bg-green-500/20 text-green-400 border-green-500/50",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/50",
};

export default function CountryPage() {
  const [, params] = useRoute("/countries/:code");
  const code = params?.code ?? "";
  const { setSelectedCountry } = useCountry();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: countries } = useListCountries();
  const { data: laws, isLoading } = useGetCountryLaws(code, {
    query: { enabled: !!code, queryKey: getGetCountryLawsQueryKey(code) },
  });

  const country = (Array.isArray(countries) ? countries : [])?.find((c) => c.code === code);

  const categories = useMemo(() => {
    if (!laws) return [];
    return Array.from(new Set(laws.map((l) => l.category)));
  }, [laws]);

  const filtered = useMemo(() => {
    if (!laws) return [];
    return laws.filter((l) => {
      const matchCat = category === "all" || l.category === category;
      const matchSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [laws, category, search]);

  if (!country && !isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Intelligence data for sector {code} not found. <Link href="/" className="text-primary underline">Return to Base</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 relative">
      {/* HUD Scanline */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-grid-white" />
      </div>

      {/* Navigation */}
      <div className="relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 font-black tracking-widest uppercase text-[10px] text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Sector Overview
          </Button>
        </Link>
      </div>

      {/* Header: Regional Intelligence Dossier */}
      {country ? (
        <div className="flex flex-col md:flex-row items-start gap-8 relative z-10 border-b border-white/10 pb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
            <div className="text-8xl bg-white/5 border border-white/10 w-32 h-32 flex items-center justify-center rounded-3xl backdrop-blur-xl relative z-10">
              {country.flag}
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] font-black tracking-[0.4em] uppercase border-primary/30 text-primary bg-primary/5 px-3 py-1 mb-2">
                Regional Intelligence Dossier // Sector {code}
              </Badge>
              <h1 className="text-6xl font-black tracking-tighter uppercase">{country.name}</h1>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Traffic Flow:</span>
                <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[10px] tracking-widest uppercase">
                  {country.drivingSide.toUpperCase()} HAND
                </Badge>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                <Car className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Currency Node:</span>
                <Badge variant="outline" className="font-black text-[10px] tracking-widest uppercase border-white/20">
                  {country.currency}
                </Badge>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Legal Matrix:</span>
                <span className="font-black text-[10px] tracking-widest uppercase text-primary">{country.lawsCount} Rules Indexed</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setSelectedCountry(code)}
            className="h-14 px-8 font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-2xl"
          >
            <Radio className="w-4 h-4 mr-3" /> SET AS ACTIVE SECTOR
          </Button>
        </div>
      ) : (
        <Skeleton className="h-40 rounded-3xl bg-white/5" />
      )}

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* LEFT: Intelligence & Emergency */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Emergency Uplinks */}
          {country && (
            <Card className="glass-panel border-red-500/20 !bg-red-500/5 tactical-border before:!border-red-500 after:!border-red-500">
              <CardHeader className="pb-4 border-b border-red-500/10">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 flex items-center gap-3">
                  <Phone className="w-4 h-4" />
                  Distress Communication Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <EmergChannel label="Sector Police" number={country.emergencyPolice} />
                  <EmergChannel label="Medical Evacuation" number={country.emergencyAmbulance} />
                  <EmergChannel label="Fire Containment" number={country.emergencyFire} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driving Advisory */}
          {code === "MM" && (
            <Card className="glass-panel border-amber-500/20 !bg-amber-500/5 tactical-border before:!border-amber-500 after:!border-amber-500">
              <CardContent className="p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Hazard Warning: Traffic Asymmetry</p>
                  <p className="text-xs font-bold text-amber-500/80 leading-relaxed uppercase tracking-tight">
                    CRITICAL: Myanmar drives on the RIGHT side. Neighboring sectors (IN, BD, NP, BT, LK, TH) use LEFT hand traffic. Recalibrate driving instincts immediately upon entry.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sector Overview Intelligence */}
          <Card className="glass-panel border-white/5 overflow-hidden">
             <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                   <Activity className="w-4 h-4 text-primary" />
                   Sector Metadata
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Supported Dialects</p>
                   <div className="flex flex-wrap gap-2">
                      {country?.languages.map((l) => (
                        <Badge key={l} variant="outline" className="bg-white/5 border-white/10 font-mono text-[9px] px-3 py-1 text-primary">{l}</Badge>
                      ))}
                   </div>
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jurisdictional Status</p>
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest text-foreground uppercase">AI INDEX: VERIFIED</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* RIGHT: Legal Matrix Ingest */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
           <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input
                  placeholder="FILTER LEGAL NODES (E.G. 'HELMET', 'SPEED')..."
                  className="pl-12 h-12 bg-black/40 border-white/10 font-black tracking-widest text-[10px] uppercase placeholder:text-white/20 focus-visible:ring-primary/50 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48 h-12 bg-black/40 border-white/10 font-black text-[10px] tracking-widest uppercase rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel">
                  <SelectItem value="all">ALL CATEGORIES</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>

           {isLoading ? (
             <div className="space-y-4">
               {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}
             </div>
           ) : filtered.length === 0 ? (
             <div className="text-center py-24 glass-panel rounded-3xl border-dashed border-white/10">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-sm font-black tracking-widest uppercase text-muted-foreground">No Legal Nodes Found</p>
             </div>
           ) : (
             <div className="space-y-4">
                {filtered.map((law) => (
                  <Card key={law.id} className="glass-panel border-white/5 hover:border-primary/40 transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-white/10 bg-white/5 px-3 py-1">{law.category}</Badge>
                            <Badge className={cn("text-[9px] font-black tracking-widest uppercase px-3 py-1", SEVERITY_COLORS[law.severity])}>
                              {law.severity}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                             <h3 className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">{law.title}</h3>
                             <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed uppercase tracking-tighter">{law.description}</p>
                          </div>

                          <div className="flex items-center gap-5 pt-2 border-t border-white/5">
                             <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{law.act}</p>
                                <p className="text-[9px] font-mono text-muted-foreground/40">IDENT: {law.section}</p>
                             </div>
                          </div>
                        </div>

                        {law.penalty != null && (
                          <div className="text-right shrink-0 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 opacity-60">Legal Penalty</p>
                            <div className="text-2xl font-black font-mono tracking-tighter text-foreground leading-none">
                              {law.penaltyCurrency === "INR" ? "₹" :
                               law.penaltyCurrency === "NPR" ? "रू" :
                               law.penaltyCurrency === "BDT" ? "৳" :
                               law.penaltyCurrency === "THB" ? "฿" :
                               law.penaltyCurrency === "LKR" ? "Rs" :
                               law.penaltyCurrency === "BTN" ? "Nu." :
                               "K"}{law.penalty.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase mt-2">{law.penaltyCurrency} JURISDICTION</div>
                            {law.penaltyUsd && (
                              <div className="text-[9px] font-mono text-muted-foreground/50 mt-1">≈ ${law.penaltyUsd} USD-E</div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function EmergChannel({ label, number }: { label: string; number: string }) {
  return (
    <a href={`tel:${number}`} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 transition-all group">
      <div className="space-y-1">
        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-red-400">{label}</p>
        <p className="text-xl font-black font-mono text-white group-hover:text-red-500">{number}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-red-500/30 group-hover:bg-red-500/20 transition-all">
         <Phone className="w-4 h-4 text-white/20 group-hover:text-red-500" />
      </div>
    </a>
  );
}
