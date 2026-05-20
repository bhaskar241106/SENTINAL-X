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
import { Search, Globe, BarChart3, Shield, Info, ArrowRight, Layers, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Speed", "Helmet", "DUI", "Seatbelt", "Phone", "Documents", "Driving Side"];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  low: "bg-green-500/20 text-green-400 border-green-500/50",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/50",
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
    <div className="p-8 max-w-6xl mx-auto space-y-10 relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between relative z-10 border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-primary/30 flex items-center justify-center backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <Globe className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-700" />
          </div>
          <div className="space-y-1">
            <Badge variant="outline" className="text-[10px] font-black tracking-[0.4em] uppercase border-primary/30 text-primary bg-primary/5 px-3 py-1">
              Sector: Legal Intelligence
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent uppercase">
              Law Explorer
            </h1>
          </div>
        </div>
      </div>

      <Tabs defaultValue="search" className="relative z-10">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl w-full max-w-md">
          <TabsTrigger 
            value="search" 
            className="rounded-xl h-full font-black tracking-widest uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            Strategic Search
          </TabsTrigger>
          <TabsTrigger 
            value="compare" 
            className="rounded-xl h-full font-black tracking-widest uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4" />
            Cross-Border Compare
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-panel border-white/5 tactical-border overflow-hidden p-1">
             <CardContent className="p-4 flex gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="ENTER QUERY (E.G. 'HELMET', 'SPEEDING', 'DUI')..."
                    className="pl-12 h-12 bg-black/40 border-white/10 font-black tracking-widest text-xs placeholder:text-white/20 focus-visible:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-56 h-12 bg-black/40 border-white/10 font-black text-[10px] tracking-widest uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    <SelectItem value="all">ALL NATIONS</SelectItem>
                    {(Array.isArray(countries) ? countries : [])?.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-10 font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  EXECUTE
                </Button>
             </CardContent>
          </Card>

          {!activeSearch && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 opacity-30">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                 <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black tracking-widest uppercase">Awaiting Search Input</p>
                <p className="text-xs font-bold uppercase opacity-60">Neural indices ready for query</p>
              </div>
            </div>
          )}

          {searchLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                 <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">Query Results: {searchResults.length} Nodes Found</p>
                 <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((law) => (
                  <Card key={law.id} className="glass-panel border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                       <Shield className="w-20 h-20" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{FLAG_MAP[law.country] ?? "🌏"}</div>
                          <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-white/10 bg-white/5">{law.category}</Badge>
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase px-3 py-1", SEVERITY_COLORS[law.severity])}>
                          {law.severity}
                        </Badge>
                      </div>
                      
                      <h3 className="text-base font-black tracking-tight uppercase mb-2 group-hover:text-primary transition-colors">{law.title}</h3>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed line-clamp-2 mb-6">{law.description}</p>
                      
                      <div className="flex items-end justify-between border-t border-white/5 pt-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{law.act}</p>
                          <p className="text-[9px] font-mono text-muted-foreground/60">SECTION: {law.section}</p>
                        </div>
                        {law.penalty != null && (
                          <div className="text-right">
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Standard Fine</p>
                             <p className="text-xl font-black font-mono tracking-tighter text-foreground">
                               {CURRENCY_SYMBOL[law.penaltyCurrency] ?? ""}{law.penalty.toLocaleString()}
                             </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-panel border-white/5 tactical-border overflow-hidden p-6">
            <div className="flex items-center gap-6">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30">
                 <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Comparison Parameter</p>
                 <div className="flex items-center gap-4">
                    <Select value={compareCategory} onValueChange={setCompareCategory}>
                      <SelectTrigger className="w-64 h-12 bg-black/40 border-white/10 font-black text-xs tracking-widest uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cross-referencing BIMSTEC datasets...</p>
                 </div>
              </div>
            </div>
          </Card>

          {compareLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compareResults?.map((entry) => (
                <Card key={entry.country} className="glass-panel border-white/5 overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
                  <CardHeader className="pb-4 bg-white/5 border-b border-white/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="text-2xl">{entry.flag}</span>
                       <CardTitle className="text-xs font-black uppercase tracking-widest">{entry.countryName}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30 bg-primary/5">
                      {entry.laws.length} NODES
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                      {entry.laws.map((law) => (
                        <div key={law.id} className="p-5 hover:bg-white/5 transition-colors group/item">
                          <div className="flex justify-between items-start mb-3">
                             <div className="space-y-1 flex-1 pr-4">
                                <p className="text-xs font-black tracking-tight uppercase group-hover/item:text-primary transition-colors leading-tight">{law.title}</p>
                                <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">{law.section}</p>
                             </div>
                             <Badge variant="outline" className={cn("text-[8px] font-black px-2 py-0 h-4 uppercase", SEVERITY_COLORS[law.severity])}>
                                {law.severity}
                             </Badge>
                          </div>
                          {law.penalty != null && (
                            <div className="flex items-center justify-between">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fine</p>
                               <p className="text-sm font-black font-mono text-foreground">
                                 {CURRENCY_SYMBOL[law.penaltyCurrency] ?? ""}{law.penalty.toLocaleString()}
                               </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
