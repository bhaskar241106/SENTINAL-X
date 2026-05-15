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
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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

  const country = countries?.find((c) => c.code === code);

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
        Country not found. <Link href="/" className="text-primary underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
          All Countries
        </Button>
      </Link>

      {/* Header */}
      {country ? (
        <div className="flex items-start gap-6">
          <div className="text-6xl">{country.flag}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{country.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <Badge variant="outline" className="gap-1.5">
                <Navigation className="w-3 h-3" />
                Drive {country.drivingSide === "left" ? "LEFT" : "RIGHT"}
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Car className="w-3 h-3" />
                {country.currency}
              </Badge>
              <Badge variant="secondary">{country.lawsCount} laws indexed</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {country.languages.map((l) => (
                <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
              ))}
            </div>
          </div>
          <Button
            onClick={() => setSelectedCountry(code)}
            variant="outline"
            size="sm"
            data-testid="button-set-active-country"
          >
            Set as Active Country
          </Button>
        </div>
      ) : (
        <Skeleton className="h-24 rounded-xl" />
      )}

      {/* Emergency Numbers */}
      {country && (
        <Card className="border bg-red-50/50 dark:bg-red-950/10 border-red-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
              <Phone className="w-4 h-4" />
              Emergency Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <EmergencyNumber label="Police" number={country.emergencyPolice} />
              <EmergencyNumber label="Ambulance" number={country.emergencyAmbulance} />
              <EmergencyNumber label="Fire" number={country.emergencyFire} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driving Side Warning for Myanmar */}
      {code === "MM" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">Tourist Alert:</span> Myanmar drives on the RIGHT side of the road, unlike neighboring India, Bangladesh, Nepal, Bhutan, Sri Lanka, and Thailand which all drive on the LEFT.
          </div>
        </div>
      )}

      {/* Laws Table */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold flex-1">Traffic Laws</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search laws..."
              className="pl-9 w-56 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-laws"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 h-9 text-sm" data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No laws found matching your search.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((law) => (
              <Card key={law.id} className="border hover:border-primary/20 transition-colors" data-testid={`law-card-${law.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{law.category}</Badge>
                        <Badge className={cn("text-xs", SEVERITY_COLORS[law.severity])}>
                          {law.severity}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{law.title}</h3>
                      <p className="text-sm text-muted-foreground">{law.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5 font-mono">{law.act} — {law.section}</p>
                    </div>
                    {law.penalty != null && (
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-foreground">
                          {law.penaltyCurrency === "INR" ? "₹" :
                           law.penaltyCurrency === "NPR" ? "रू" :
                           law.penaltyCurrency === "BDT" ? "৳" :
                           law.penaltyCurrency === "THB" ? "฿" :
                           law.penaltyCurrency === "LKR" ? "Rs" :
                           law.penaltyCurrency === "BTN" ? "Nu." :
                           "K"}{law.penalty.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">{law.penaltyCurrency}</div>
                        {law.penaltyUsd && (
                          <div className="text-xs text-muted-foreground">≈ ${law.penaltyUsd} USD</div>
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
  );
}

function EmergencyNumber({ label, number }: { label: string; number: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono text-red-700 dark:text-red-400">{number}</p>
    </div>
  );
}
