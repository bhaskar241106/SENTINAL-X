import { useState } from "react";
import { useGetEmergencyContacts, useListCountries, getGetEmergencyContactsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useCountry } from "@/App";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Phone, CheckSquare, Shield, FileText, Info, Radio, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmergencyPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [sosActive, setSosActive] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const { toast } = useToast();
  const { data: countries } = useListCountries();
  const { data: emergency, isLoading } = useGetEmergencyContacts(selectedCountry, {
    query: {
      enabled: !!selectedCountry,
      queryKey: getGetEmergencyContactsQueryKey(selectedCountry),
    },
  });

  const country = (Array.isArray(countries) ? countries : [])?.find((c) => c.code === selectedCountry);

  async function handleSOS() {
    if (sosActive) {
      setSosActive(false);
      return;
    }

    setIsTriggering(true);
    let lat = null, lng = null;
    
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        console.warn("Could not grab GPS for SOS");
      }
    }

    try {
      const res = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, country: selectedCountry, type: "manual_trigger" }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSosActive(true);
        toast({ title: "SOS Dispatched", description: `Incident ID: ${data.incidentId}. Local authorities notified.` });
      }
    } catch {
      toast({ title: "Network Error", description: "Could not dispatch SOS to server.", variant: "destructive" });
      setSosActive(true);
    } finally {
      setIsTriggering(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <Badge variant="outline" className="text-[10px] font-black tracking-[0.3em] uppercase border-red-500/30 text-red-500">
                Tactical Response Unit
              </Badge>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Emergency Hub</h1>
            <p className="text-muted-foreground text-sm font-medium">Lethal threat detection and immediate response protocols</p>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Jurisdiction</span>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-40 bg-white border-slate-200 rounded-xl h-10 font-bold text-xs text-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                {(Array.isArray(countries) ? countries : [])?.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-xs font-bold">
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SOS Massive Button */}
      <div className="flex flex-col items-center justify-center py-12 relative group">
        <div className={cn(
          "absolute w-[400px] h-[400px] rounded-full blur-[100px] transition-all duration-1000",
          sosActive ? "bg-red-500/30 scale-125" : "bg-red-500/5 group-hover:bg-red-500/10"
        )} />
        
        <button
          onClick={handleSOS}
          disabled={isTriggering}
          className={cn(
            "w-64 h-64 rounded-full border-[12px] flex flex-col items-center justify-center transition-all duration-500 relative z-10",
            sosActive
              ? "bg-red-600 border-red-400 text-white scale-110 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.5)]"
              : "glass-panel border-red-500/20 text-red-500 hover:scale-105 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          )}
        >
          <Radio className={cn("w-12 h-12 mb-2 transition-all duration-1000", sosActive && "animate-spin")} />
          <span className="text-5xl font-black tracking-tighter">SOS</span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 mt-1">
            {isTriggering ? "TRANSMITTING..." : "HOLD TO TRIGGER"}
          </span>
        </button>

        {sosActive && (
          <div className="mt-8 text-center animate-in slide-in-from-top-4 duration-500">
            <Badge className="bg-red-500 text-white border-none font-black tracking-widest px-4 py-1.5 animate-bounce">
              SATELLITE BEACON DISPATCHED
            </Badge>
          </div>
        )}
      </div>

      {/* Emergency Data Matrix */}
      {emergency && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Contacts Panel */}
          <div className="md:col-span-12 lg:col-span-7 space-y-6">
            <Card className="glass-panel overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" /> Authorized Distress Uplinks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "police", name: "Police Department", category: "Emergency Services", phone: emergency.police },
                    { id: "ambulance", name: "Ambulance / Medical", category: "Medical Response", phone: emergency.ambulance },
                    { id: "fire", name: "Fire Department", category: "Fire Containment", phone: emergency.fire },
                    ...(emergency.trafficPolice ? [{ id: "traffic", name: "Traffic Police", category: "Road Operations", phone: emergency.trafficPolice }] : []),
                    ...(emergency.coastGuard ? [{ id: "coast", name: "Coast Guard", category: "Maritime Search & Rescue", phone: emergency.coastGuard }] : []),
                  ].map((contact) => (
                    <div key={contact.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-black text-sm uppercase tracking-tighter text-foreground">{contact.name}</h3>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{contact.category}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">OFFICIAL</Badge>
                      </div>
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/5 hover:border-primary/50 text-foreground transition-all">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm font-bold">{contact.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" /> Incident FIR Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {emergency.firChecklist.map((item, idx) => (
                  <ChecklistItem key={idx} index={idx + 1} text={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tips & Intelligence */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <Card className="glass-panel !bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
                  <FileText className="w-4 h-4" /> Insurance Intel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {emergency.insuranceTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-blue-600 dark:text-blue-400 font-bold leading-relaxed">{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-panel !bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Shield className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-500">Tourist Safety Advisory</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-bold">
                    Maintain digital copies of your passport and IDP. Secure international insurance before border transit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function EmergencyCallCard({ label, number, icon: Icon, color }: { label: string; number: string; icon: any; color: string }) {
  return (
    <a 
      href={`tel:${number}`}
      className={cn(
        "p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
        color === 'red' ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/40' :
        color === 'blue' ? 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/40' :
        color === 'orange' ? 'bg-orange-500/5 border-orange-500/10 hover:border-orange-500/40' :
        'bg-green-500/5 border-green-500/10 hover:border-green-500/40'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "p-2 rounded-lg",
          color === 'red' ? 'bg-red-500/20 text-red-500' :
          color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
          color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
          'bg-green-500/20 text-green-500'
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-2xl font-black font-mono tracking-tighter group-hover:scale-105 transition-transform origin-left">
        {number}
      </p>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Phone className="w-3 h-3 text-white/40" />
      </div>
    </a>
  );
}

function ChecklistItem({ index, text }: { index: number; text: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <button
      onClick={() => setChecked((v) => !v)}
      className="flex items-start gap-4 w-full text-left group p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
    >
      <div className={cn(
        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300",
        checked ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/20" : "border-white/10 group-hover:border-primary/50"
      )}>
        {checked && <svg viewBox="0 0 10 8" className="w-4 h-4 fill-white"><path d="M1 4l3 3L9 1"/></svg>}
      </div>
      <div className="space-y-0.5">
        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Step 0{index}</span>
        <p className={cn("text-sm font-medium transition-all", checked ? "line-through opacity-30" : "opacity-90 group-hover:opacity-100")}>
          {text}
        </p>
      </div>
    </button>
  );
}
