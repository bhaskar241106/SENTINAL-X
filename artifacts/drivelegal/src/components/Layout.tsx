import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Shield, 
  Calculator, 
  MapPin, 
  Phone, 
  User, 
  MessageSquare,
  Settings,
  RefreshCw,
  Receipt,
  Radio,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/App";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isOffline, baseUrl, setBaseUrl } = useApi();
  const [tempUrl, setTempUrl] = useState(baseUrl);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Shield, label: "Sentinel-X", path: "/sentinel" },
    { icon: Receipt, label: "Fine Calc", path: "/challan" },
    { icon: MapPin, label: "Geofences", path: "/geofence" },
    { icon: Phone, label: "Emergency", path: "/emergency" },
    { icon: MessageSquare, label: "Legal AI", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden premium-gradient">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-sidebar border-sidebar-border flex flex-col glass-panel !bg-sidebar/90 shrink-0">
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                SENTINEL
              </h1>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOffline ? "bg-red-500" : "bg-green-500")} />
                <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest">
                  {isOffline ? "Offline Mode" : "System Active"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 neon-glow-blue"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/10"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                  {item.label}
                  {isActive && <div className="absolute right-0 w-1 h-6 bg-white rounded-l-full" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Connection Settings */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Settings className="w-3 h-3" /> API Core
              </span>
              <Badge variant="outline" className={cn("text-[8px] px-1 h-4", isOffline ? "text-red-400 border-red-400/30" : "text-green-400 border-green-400/30")}>
                {isOffline ? "DISCONNECTED" : "CONNECTED"}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-sidebar-foreground/70 ml-1 uppercase tracking-widest">Laptop IP Node</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="192.168.x.x:8080"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                />
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 shrink-0 rounded-lg hover:scale-105 transition-transform" 
                  onClick={() => {
                    setBaseUrl(tempUrl);
                    window.location.reload();
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sidebar-foreground truncate">Agent Bhaskar</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">Sentinel-X Commander</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-slate-50 min-w-0">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-grid-slate-200 opacity-20 pointer-events-none" />
        <div className="relative z-10 w-full p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
