import { useState } from "react";
import { User, Car, Plus, ShieldCheck, Mail, Phone, MapPin, Fingerprint, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCountry } from "@/App";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { selectedCountry } = useCountry();
  const { toast } = useToast();
  
  const [user, setUser] = useState({
    fullName: "Guest Operative",
    email: "operative@sentinel-x.net",
    phone: "",
  });

  const [vehicles, setVehicles] = useState([
    { id: 1, make: "Toyota", model: "Corolla", class: "car", plate: "MH-12-AB-1234" }
  ]);

  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", class: "car", plate: "" });
  const [isAdding, setIsAdding] = useState(false);

  function handleAddVehicle() {
    if (!newVehicle.plate || !newVehicle.make) {
      toast({ title: "SECURITY FAULT", description: "Plate and Make are mandatory for registration.", variant: "destructive" });
      return;
    }
    
    setVehicles([...vehicles, { id: Date.now(), ...newVehicle }]);
    setNewVehicle({ make: "", model: "", class: "car", plate: "" });
    setIsAdding(false);
    toast({ title: "ASSET LOGGED", description: `${newVehicle.make} ${newVehicle.model} added to Sentinel grid.` });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-end justify-between relative z-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 animate-ping rounded-xl" />
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Fingerprint className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <Badge variant="outline" className="text-[10px] font-black tracking-[0.3em] uppercase border-primary/30 text-primary mb-2 bg-primary/5">
              CLEARANCE: LEVEL 4
            </Badge>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
              OPERATIVE DOSSIER
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              Identity & Asset Management Grid
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Identity Core */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="glass-panel border-white/5 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Identity Core
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Designation</label>
                <Input 
                  value={user.fullName} 
                  onChange={(e) => setUser({...user, fullName: e.target.value})}
                  className="bg-white border-slate-200 font-mono text-slate-900 focus-visible:ring-primary/50 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sentinel ID (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-primary/50" />
                  <Input 
                    value={user.email} 
                    className="pl-10 bg-slate-50 border-slate-200 font-mono text-slate-500 h-11" 
                    readOnly 
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encryption Key</p>
                <p className="text-xs font-mono text-slate-600 break-all">SENTINEL-X-4.2-OP-8821-HASH-X992</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comms Link</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-primary/50" />
                  <Input 
                    placeholder="Enter uplink number" 
                    className="pl-10 bg-white border-slate-200 font-mono focus-visible:ring-primary/50 h-11" 
                    value={user.phone} 
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Sector</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-primary/50" />
                  <Input 
                    value={selectedCountry} 
                    className="pl-10 bg-slate-50 border-slate-200 font-mono text-slate-500 h-11" 
                    readOnly 
                  />
                </div>
              </div>
              <Button className="w-full mt-4 h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black tracking-[0.2em] uppercase">
                Synchronize Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fleet Grid */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-3 text-slate-500">
                <Car className="w-4 h-4 text-primary" />
                Fleet Telemetry Grid
              </CardTitle>
              <Badge variant="outline" className="font-mono bg-white border-slate-200 text-slate-600">
                {vehicles.length} ASSETS ONLINE
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {vehicles.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between group hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <Car className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase">{v.make} {v.model}</p>
                      <p className="text-[10px] font-bold text-primary font-mono">{v.plate}</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 font-black text-[9px] uppercase tracking-widest">VERIFIED</Badge>
                </div>
              ))}

              {!isAdding ? (
                <Button 
                  variant="outline" 
                  className="w-full h-16 border-dashed border-white/20 hover:border-primary/50 bg-transparent hover:bg-primary/5 text-muted-foreground hover:text-primary font-black tracking-widest uppercase mt-4 transition-all" 
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="w-5 h-5 mr-3" /> Register New Asset
                </Button>
              ) : (
                <div className="p-6 border border-primary/30 rounded-xl bg-primary/5 space-y-5 mt-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent pointer-events-none" />
                  <h4 className="font-black text-xs uppercase tracking-[0.2em] text-primary flex items-center gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    New Asset Initialization
                  </h4>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Manufacturer</label>
                      <Input placeholder="e.g. Honda" className="bg-black/40 border-white/10 font-mono" value={newVehicle.make} onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Model</label>
                      <Input placeholder="e.g. Civic" className="bg-black/40 border-white/10 font-mono" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Plate Identifier</label>
                      <Input placeholder="TS09AB1234" className="uppercase font-mono bg-black/40 border-primary/30 focus-visible:ring-primary/50 text-primary placeholder:text-primary/30" value={newVehicle.plate} onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Classification</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm ring-offset-background font-mono text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        value={newVehicle.class}
                        onChange={(e) => setNewVehicle({...newVehicle, class: e.target.value})}
                      >
                        <option value="two_wheeler">Two Wheeler</option>
                        <option value="car">Car</option>
                        <option value="heavy_vehicle">Heavy Vehicle</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 relative z-10">
                    <Button onClick={handleAddVehicle} className="flex-1 font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                      Finalize Registration
                    </Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)} className="font-black tracking-widest uppercase border-white/10 hover:bg-white/5">
                      Abort
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
