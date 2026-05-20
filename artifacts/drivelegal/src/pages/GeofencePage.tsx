import { useState } from "react";
import { useCountry, useApi } from "@/App";
import { useGeofence, Coordinate } from "@/hooks/useGeofence";
import { OfflineMapFallback } from "@/components/OfflineMapFallback";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, MapPin, AlertTriangle, Crosshair, Shield, Activity, Layers, Target, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const BLACKSPOTS: Coordinate[] = [
  { lat: 23.685, lng: 86.895 }, 
  { lat: 28.7041, lng: 77.1025 },
];

function LocationSelector({ setLocation }: { setLocation: (coord: Coordinate) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function GeofencePage() {
  const { setSelectedCountry } = useCountry();
  const { isOffline, baseUrl } = useApi();
  const { location, alert: geoAlert, isActive: geoActive, simulateLocation, clearAlert } = useGeofence(BLACKSPOTS);

  return (
    <div className={cn("p-8 max-w-7xl mx-auto space-y-8 relative")}>
      {/* Background HUD Grid */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-grid-white" />
      </div>

      {/* Background Alerts Overlay */}
      {geoAlert.type === 'blackspot' && (
        <div className="fixed inset-0 pointer-events-none border-[16px] border-red-500/20 animate-pulse z-50">
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600 text-white font-black text-xs tracking-[0.5em] uppercase shadow-[0_0_20px_rgba(239,68,68,0.5)]">
             COLLISION HAZARD DETECTED
           </div>
        </div>
      )}
      {geoAlert.type === 'border' && (
        <div className="fixed inset-0 pointer-events-none bg-orange-500/5 border-[16px] border-orange-500/20 z-50 transition-all">
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-orange-600 text-white font-black text-xs tracking-[0.5em] uppercase shadow-[0_0_20px_rgba(249,115,22,0.5)]">
             SECTOR BOUNDARY BREACH
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between relative z-10 border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-blue-500/30 flex items-center justify-center backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
            <Radio className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] font-black tracking-[0.4em] uppercase border-blue-500/30 text-blue-500 bg-blue-500/5 px-3 py-1">
                System: Global Surveillance
              </Badge>
              {geoActive && (
                <Badge className="bg-blue-600 text-white font-black text-[10px] tracking-widest animate-pulse border-none px-3 py-1">
                  SATELLITE LINK ACTIVE
                </Badge>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent uppercase">
              Geofence Explorer
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* LEFT: Map Control Center */}
        <Card className="col-span-12 lg:col-span-8 glass-panel overflow-hidden tactical-border">
          <CardHeader className="pb-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
              <Layers className="w-4 h-4 text-blue-500" />
              Coordinate Matrix visualization
            </CardTitle>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Interactive Telemetry</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[550px] relative">
              {!isOffline ? (
                <MapContainer center={[23.6850, 86.8950]} zoom={5} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSelector setLocation={(coord) => simulateLocation(coord.lat, coord.lng)} />
                  {location && (
                    <Marker position={[location.lat, location.lng]}>
                      <Popup className="font-mono text-[10px] font-black uppercase tracking-widest">Uplink Position: Verified</Popup>
                    </Marker>
                  )}
                  {BLACKSPOTS.map((spot, i) => (
                    <Circle key={i} center={[spot.lat, spot.lng]} radius={1000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15 }}>
                      <Popup className="text-xs font-black uppercase text-red-500">Lethal Collision Blackspot</Popup>
                    </Circle>
                  ))}
                  <Circle center={[24.238, 94.304]} radius={5000} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.1 }}>
                    <Popup className="text-xs font-black uppercase text-orange-500">Geopolitical Boundary: IN-MM</Popup>
                  </Circle>
                </MapContainer>
              ) : (
                <OfflineMapFallback className="h-full border-none shadow-none bg-black/20" />
              )}
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-white/5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center space-y-1">
                 <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Navigation Protocol</p>
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight">Tap map to simulate spatial jump</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Tactical Analysis */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="glass-panel border-white/5 tactical-border">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-muted-foreground">
                <Target className="w-4 h-4 text-blue-500" />
                Live Telemetry Readout
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-6 rounded-3xl bg-black/40 border border-white/5 font-mono text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                {location ? (
                  <div className="relative z-10">
                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-3">Satellite Coordinates</p>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-foreground tracking-tighter">
                         {location.lat.toFixed(6)}°N
                       </p>
                       <p className="text-2xl font-black text-foreground tracking-tighter">
                         {location.lng.toFixed(6)}°E
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-4">
                     <Cpu className="w-8 h-8 text-blue-500/20 animate-pulse" />
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black animate-pulse">Scanning Satellite Array...</p>
                  </div>
                )}
              </div>

              {geoAlert.type ? (
                <div className={cn(
                  "p-6 rounded-3xl border-2 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden",
                  geoAlert.type === 'border' 
                    ? 'bg-orange-500/10 border-orange-500/40' 
                    : 'bg-red-500/10 border-red-500/40'
                )}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <AlertTriangle className="w-16 h-16" />
                  </div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className={cn("p-3 rounded-2xl", geoAlert.type === 'border' ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500')}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", geoAlert.type === 'border' ? 'text-orange-500' : 'text-red-500')}>
                        {geoAlert.type === 'border' ? 'BOUNDARY BREACH' : 'LETHAL HAZARD'}
                      </p>
                      <p className="text-xl font-black tracking-tight uppercase">{geoAlert.type === 'border' ? 'Sector Migration' : 'Collision Zone'}</p>
                    </div>
                  </div>
                  <p className={cn("text-xs font-bold leading-relaxed mb-8 uppercase tracking-tighter", geoAlert.type === 'border' ? 'text-orange-200' : 'text-red-200')}>
                    {geoAlert.message}
                  </p>
                  
                  <div className="space-y-3 relative z-10">
                    {geoAlert.type === 'border' && geoAlert.newCountryCode && (
                      <Button className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-900/40 rounded-2xl" onClick={() => { setSelectedCountry(geoAlert.newCountryCode!); clearAlert(); }}>
                        SYNCHRONIZE TO {geoAlert.newCountryCode} LAWS
                      </Button>
                    )}
                    <Button variant="outline" className="w-full h-14 glass-panel !bg-white/10 border-white/20 hover:!bg-white/20 font-black uppercase tracking-widest text-[10px] rounded-2xl" onClick={clearAlert}>
                      ACKNOWLEDGE THREAT
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-[32px] border border-dashed border-white/10 text-center space-y-6 opacity-40">
                  <div className="w-20 h-20 rounded-full bg-green-500/5 border border-green-500/20 flex items-center justify-center mx-auto relative">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                    <Shield className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-green-500">Security: Stable</p>
                    <p className="text-[10px] font-bold text-muted-foreground px-6 uppercase tracking-tight">No proximal threats or sector boundaries detected within scan range.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environmental Matrix */}
          <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
             <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                   <Activity className="w-4 h-4 text-blue-500" />
                   Sector Environmental Grid
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Atmospheric Load</p>
                   <p className="text-xs font-black">STABLE // CLEAR</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Satellite Link</p>
                   <p className="text-xs font-black text-green-500">UPLINK ACTIVE</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
