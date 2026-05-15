import { useState } from "react";
import { useSearchLaws, useCompareLaws, getSearchLawsQueryKey, getCompareLawsQueryKey, useListCountries } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Globe, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Speed", "Helmet", "DUI", "Seatbelt", "Phone", "Documents", "Driving Side"];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const FLAG_MAP: Record<string, string> = {
  BD: "🇧🇩", BT: "🇧🇹", IN: "🇮🇳", MM: "🇲🇲", NP: "🇳🇵", LK: "🇱🇰", TH: "🇹🇭",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹", NPR: "रू", BDT: "৳", THB: "฿", LKR: "Rs", BTN: "Nu.", MMK: "K",
};

export default function LawsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [compareCategory, setCompareCategory] = useState("Helmet");

  const { data: countries } = useListCountries();

  const { data: searchResults, isLoading: searchLoading } = useSearchLaws(
    { q: activeSearch, ...(countryFilter !== "all" ? { country: countryFilter } : {}) },
    { query: { enabled: !!activeSearch, queryKey: getSearchLawsQueryKey({ q: activeSearch, country: countryFilter !== "all" ? countryFilter : undefined }) } }
  );

  const { data: compareResults, isLoading: compareLoading } = useCompareLaws(
    { category: compareCategory },
    { query: { enabled: !!compareCategory, queryKey: getCompareLawsQueryKey({ category: compareCategory }) } }
  );

  function handleSearch() {
    setActiveSearch(searchQuery);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Law Explorer</h1>
        </div>
        <p className="text-muted-foreground text-sm">Search and compare traffic laws across all 7 BIMSTEC nations</p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid grid-cols-2 w-72">
          <TabsTrigger value="search" className="gap-2"><Search className="w-4 h-4" />Search</TabsTrigger>
          <TabsTrigger value="compare" className="gap-2"><BarChart3 className="w-4 h-4" />Compare</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="mt-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search laws, acts, sections... e.g. 'helmet', 'drunk driving', 'speed limit'"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-search"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40" data-testid="select-country-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries?.map((c) => (
                  <SelectItem key={c.code} value={c.code} data-testid={`option-filter-${c.code}`}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} data-testid="button-search">Search</Button>
          </div>

          {!activeSearch && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Enter a search term above to find traffic laws</p>
              <p className="text-xs mt-1">Try: "helmet", "BAC", "speed limit", "mobile phone"</p>
            </div>
          )}

          {searchLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          )}

          {activeSearch && !searchLoading && searchResults?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No laws found for "{activeSearch}"
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{searchResults.length} results for "{activeSearch}"</p>
              {searchResults.map((law) => (
                <Card key={law.id} className="border hover:border-primary/20 transition-colors" data-testid={`search-result-${law.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{FLAG_MAP[law.country] ?? "🌏"}</span>
                          <Badge variant="outline" className="text-xs">{law.category}</Badge>
                          <Badge className={cn("text-xs", SEVERITY_COLORS[law.severity])}>{law.severity}</Badge>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{law.title}</h3>
                        <p className="text-sm text-muted-foreground">{law.description}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{law.act} — {law.section}</p>
                      </div>
                      {law.penalty != null && (
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold">{CURRENCY_SYMBOL[law.penaltyCurrency] ?? ""}{law.penalty.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{law.penaltyCurrency}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">Compare:</p>
            <Select value={compareCategory} onValueChange={setCompareCategory}>
              <SelectTrigger className="w-44" data-testid="select-compare-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} data-testid={`option-compare-${c.toLowerCase()}`}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">laws across BIMSTEC</span>
          </div>

          {compareLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : compareResults?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No comparison data available for "{compareCategory}"
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{compareResults?.length ?? 0} countries have {compareCategory} laws</p>
              {compareResults?.map((entry) => (
                <Card key={entry.country} className="border" data-testid={`compare-card-${entry.country}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-xl">{entry.flag}</span>
                      {entry.countryName}
                      <Badge variant="secondary" className="ml-auto text-xs">{entry.laws.length} rules</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {entry.laws.map((law) => (
                      <div key={law.id} className="flex items-center justify-between gap-3 py-2 border-t first:border-t-0 first:pt-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{law.title}</p>
                          <p className="text-xs text-muted-foreground">{law.section}</p>
                        </div>
                        {law.penalty != null && (
                          <div className="text-right">
                            <span className="text-sm font-semibold">{CURRENCY_SYMBOL[law.penaltyCurrency] ?? ""}{law.penalty.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">{law.penaltyCurrency}</span>
                          </div>
                        )}
                        <Badge className={cn("text-xs shrink-0", SEVERITY_COLORS[law.severity])}>{law.severity}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
