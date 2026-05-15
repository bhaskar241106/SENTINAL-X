import { Link, useLocation } from "wouter";
import { useCountry } from "@/App";
import { useListCountries } from "@workspace/api-client-react";
import {
  MessageSquare,
  Calculator,
  Globe,
  Search,
  AlertTriangle,
  LayoutDashboard,
  ChevronDown,
  Shield,
  Zap,
  ShieldAlert,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { path: "/chat", label: "AI Assistant", icon: MessageSquare, group: "main" },
  { path: "/challan", label: "Fine Calculator", icon: Calculator, group: "main" },
  { path: "/laws", label: "Law Explorer", icon: Search, group: "main" },
  { path: "/countries/IN", label: "Country Laws", icon: Globe, group: "main" },
  { path: "/emergency", label: "SOS & Emergency", icon: AlertTriangle, group: "main" },
  { path: "/sentinel", label: "Sentinel-X", icon: Zap, group: "guardian", badge: "AI" },
  { path: "/police-mode", label: "Police Mode", icon: ShieldAlert, group: "guardian" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { data: countries } = useListCountries();
  const currentCountry = countries?.find((c) => c.code === selectedCountry);

  const mainItems = navItems.filter((n) => n.group === "main");
  const guardianItems = navItems.filter((n) => n.group === "guardian");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 z-50 shadow-xl">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-sidebar-border">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-primary/30 transition-shadow">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-base text-white tracking-tight">DriveLegal</div>
                <div className="text-xs text-sidebar-foreground/50 font-medium tracking-wider uppercase">BIMSTEC AI</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Country Selector */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 font-semibold uppercase tracking-wider mb-2 px-1">Active Country</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground h-10 px-3"
                data-testid="button-country-selector"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-base">{currentCountry?.flag ?? "🌏"}</span>
                  <span>{currentCountry?.name ?? "Select Country"}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56" side="right">
              {countries?.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  data-testid={`item-country-${c.code}`}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    c.code === selectedCountry && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <span className="text-base">{c.flag}</span>
                  <span>{c.name}</span>
                  {c.code === selectedCountry && <span className="ml-auto text-xs">Active</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {/* Main nav */}
          <p className="text-xs font-semibold text-sidebar-foreground/30 uppercase tracking-wider px-3 py-1.5">Navigation</p>
          {mainItems.map((item) => {
            const isCountryPage = item.path.startsWith("/countries/");
            const isActive = isCountryPage
              ? location.startsWith("/countries/")
              : location === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={isCountryPage ? `/countries/${selectedCountry}` : item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </div>
              </Link>
            );
          })}

          {/* Guardian features */}
          <p className="text-xs font-semibold text-sidebar-foreground/30 uppercase tracking-wider px-3 py-1.5 mt-3">Road Guardian</p>
          {guardianItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : item.path === "/sentinel"
                        ? "text-amber-400/80 hover:bg-sidebar-accent hover:text-amber-300"
                        : "text-red-400/80 hover:bg-sidebar-accent hover:text-red-300"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge className="text-xs px-1.5 py-0 bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground/60">7 Nations</span>
            <span className="mx-1 text-sidebar-foreground/20">·</span>
            <span className="text-xs font-semibold text-sidebar-foreground/60">2,400+ Laws</span>
          </div>
          <p className="text-xs text-sidebar-foreground/30">Road Safety Hackathon 2026</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
