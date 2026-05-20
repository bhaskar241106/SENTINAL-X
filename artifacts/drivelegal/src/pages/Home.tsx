import { useGetDashboardStats, useListCountries } from "@workspace/api-client-react";
import { useCountry } from "@/App";
import { Link } from "wouter";
import { MessageSquare, Calculator, Search, AlertTriangle, Globe, Shield, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const features = [
  {
    href: "/chat",
    icon: MessageSquare,
    label: "AI Legal Assistant",
    desc: "Ask any traffic law question powered by Gemini AI",
    color: "from-green-500/10 to-emerald-500/10 border-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    href: "/challan",
    icon: Calculator,
    label: "Fine Calculator",
    desc: "Calculate exact fines for any violation by country",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    href: "/laws",
    icon: Search,
    label: "Law Explorer",
    desc: "Search and compare laws across all BIMSTEC nations",
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    href: "/emergency",
    icon: AlertTriangle,
    label: "SOS & Emergency",
    desc: "Emergency contacts and accident FIR checklist",
    color: "from-red-500/10 to-rose-500/10 border-red-500/20",
    iconColor: "text-red-600 dark:text-red-400",
  },
];

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: countries, isLoading: countriesLoading } = useListCountries();
  const { setSelectedCountry } = useCountry();

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
              <Shield className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px] font-black tracking-[0.3em] uppercase border-primary/30 text-primary">
                Sentinel OS v4.2 // Regional Defense
              </Badge>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent">
                DriveLegal BIMSTEC
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground dark:text-slate-400 text-lg max-w-2xl font-bold leading-relaxed">
            The world's first AI-native legal engine for cross-border traffic compliance. 
            Providing 24/7 protection across <span className="text-foreground font-bold">7 nations</span>.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-6" data-testid="stats-grid">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))
        ) : (
          <>
            <StatCard icon={Globe} label="Jurisdictions" value={stats?.totalCountries ?? 0} sub="BIMSTEC States" color="text-blue-500" />
            <StatCard icon={Shield} label="Neural Nodes" value={(stats?.totalLaws ?? 0) + "+"} sub="Laws Indexed" color="text-green-500" />
            <StatCard icon={Calculator} label="Threat Vectors" value={stats?.totalViolationTypes ?? 0} sub="Violations Mapped" color="text-orange-500" />
            <StatCard icon={TrendingUp} label="Core Uplinks" value={stats?.totalLanguages ?? 0} sub="Regional Dialects" color="text-purple-500" />
          </>
        )}
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Strategic Operations</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-border/0 via-border to-border/0 mx-8" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.href} href={f.href}>
                <Card className={cn(
                  "cursor-pointer group overflow-hidden glass-panel border border-white/5 hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/10",
                  f.href === "/chat" ? "md:col-span-1" : ""
                )}>
                  <CardContent className="p-8 flex items-start gap-6 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500", f.iconColor)}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-xl font-black tracking-tight">{f.label}</div>
                      <div className="text-sm text-muted-foreground dark:text-slate-300 font-bold leading-relaxed">{f.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors mt-2" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Country Surveillance */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground text-center">Global Coverage Map</h2>
        <div className="grid grid-cols-7 gap-4">
          {(Array.isArray(countries) ? countries : [])?.map((c) => (
            <Link
              key={c.code}
              href={`/countries/${c.code}`}
              onClick={() => setSelectedCountry(c.code)}
            >
              <Card className="cursor-pointer glass-panel !bg-white border-slate-200 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group text-center py-6 px-4">
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0">{c.flag}</div>
                <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-800">{c.name}</div>
                <div className="text-[9px] text-primary font-black uppercase tracking-widest">{c.lawsCount} CODES</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number | string; sub: string; color: string }) {
  return (
    <Card className="glass-panel border-slate-100 overflow-hidden group hover:shadow-lg transition-all duration-300 !bg-white shadow-sm">
      <CardContent className="p-6 relative">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="w-24 h-24" />
        </div>
        <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-black tabular-nums tracking-tighter text-slate-900">{value}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
          <div className="text-[10px] font-black text-primary uppercase tracking-widest">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}
