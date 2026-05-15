import { useGetDashboardStats, useListCountries } from "@workspace/api-client-react";
import { useCountry } from "@/App";
import { Link } from "wouter";
import { MessageSquare, Calculator, Search, AlertTriangle, Globe, Shield, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <Badge variant="secondary" className="text-xs font-semibold tracking-wider uppercase">Road Safety Hackathon 2026</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">DriveLegal BIMSTEC AI</h1>
        <p className="text-muted-foreground text-base max-w-xl">
          The authoritative traffic law assistant for Bangladesh, Bhutan, India, Myanmar, Nepal, Sri Lanka, and Thailand.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4" data-testid="stats-grid">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard icon={Globe} label="Countries" value={stats?.totalCountries ?? 0} sub="BIMSTEC nations" color="text-green-600" />
            <StatCard icon={Shield} label="Traffic Laws" value={(stats?.totalLaws ?? 0) + "+"} sub="Indexed & searchable" color="text-blue-600" />
            <StatCard icon={Calculator} label="Violation Types" value={stats?.totalViolationTypes ?? 0} sub="With fine breakdowns" color="text-amber-600" />
            <StatCard icon={TrendingUp} label="Languages" value={stats?.totalLanguages ?? 0} sub="Supported regions" color="text-purple-600" />
          </>
        )}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Features</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.href} href={f.href} data-testid={`feature-card-${f.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <Card className={`cursor-pointer border bg-gradient-to-br ${f.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`mt-0.5 ${f.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-0.5">{f.label}</div>
                      <div className="text-sm text-muted-foreground">{f.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-1" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Country Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">BIMSTEC Countries</h2>
        {countriesLoading ? (
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {countries?.map((c) => (
              <Link
                key={c.code}
                href={`/countries/${c.code}`}
                data-testid={`country-card-${c.code}`}
                onClick={() => setSelectedCountry(c.code)}
              >
                <Card className="cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 border hover:border-primary/30 group">
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-3xl">{c.flag}</div>
                    <div className="text-xs font-semibold text-foreground leading-tight">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.lawsCount} laws</div>
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0"
                    >
                      {c.drivingSide === "left" ? "Drive L" : "Drive R"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Per-Country Stats */}
      {stats?.countriesData && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Coverage by Country</h2>
          <div className="space-y-2">
            {stats.countriesData.map((c) => (
              <div key={c.code} className="flex items-center gap-4 p-3 rounded-lg bg-card border hover:border-primary/20 transition-colors" data-testid={`stat-country-${c.code}`}>
                <span className="text-xl">{c.flag}</span>
                <span className="font-medium text-sm w-28">{c.name}</span>
                <div className="flex-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {c.lawsCount} laws
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {c.violationsCount} violations
                  </span>
                </div>
                <Link href={`/countries/${c.code}`} data-testid={`link-country-detail-${c.code}`}>
                  <span className="text-xs text-primary font-medium hover:underline cursor-pointer">View laws</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number | string; sub: string; color: string }) {
  return (
    <Card className="border bg-card">
      <CardContent className="p-5">
        <div className={`${color} mb-3`}><Icon className="w-5 h-5" /></div>
        <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
        <div className="text-sm font-semibold text-foreground mt-0.5">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}
