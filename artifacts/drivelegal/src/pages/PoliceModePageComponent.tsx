import { useState, useEffect, useRef } from "react";
import { useCountry } from "@/App";
import { useListCountries, useGetEmergencyContacts, getGetEmergencyContactsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Radio,
  Gavel,
  Activity,
  Volume2,
  VolumeX,
  Play,
  ShieldAlert,
  FileText,
  Check,
  Phone,
  MicOff,
  Mic,
  Copy,
  MessageSquare,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DOCUMENTS: Array<{ id: string; label: string; description: string; act: string }> = [
  { id: "dl", label: "Driving Licence", description: "Valid DL with correct vehicle class.", act: "Motor Vehicles Act / Transport Acts" },
  { id: "rc", label: "Registration Certificate (RC)", description: "Vehicle registration book with current address.", act: "Mandatory RC Presentation" },
  { id: "insurance", label: "Insurance Certificate", description: "Valid third-party or comprehensive insurance.", act: "Compulsory Liability Cover" },
  { id: "puc", label: "Pollution Certificate (PUC)", description: "Valid emission test certificate.", act: "Environmental Compliance" },
  { id: "permit", label: "Permit (if commercial)", description: "Route permit for goods/passenger vehicles.", act: "Commercial Carriage Act" },
  { id: "fitness", label: "Fitness Certificate (HV)", description: "Annual fitness cert for heavy vehicles.", act: "Vehicle Safety Standards" },
];

const RIGHTS = [
  { title: "ID Authentication", body: "Right to authenticate officer identity and badge designation." },
  { title: "Receipt Protocol", body: "Absolute right to an official spot receipt for any processed fine." },
  { title: "Due Process", body: "Right against detention without specific legal violation codes." },
  { title: "Judicial Contest", body: "Inherent right to contest all enforcement actions in Traffic Court." },
  { title: "Digital Documentation", body: "Right to maintain visual/audio records of the interaction." },
  { title: "Legal Counsel", body: "Right to remain silent until legal representation is acquired." },
];

const SCRIPT = [
  { label: "Opening Protocol", text: "Good [morning/afternoon/evening] officer. How may I assist you?" },
  { label: "ID Verification", text: "Officer, may I please log your badge number and identification for my records?" },
  { label: "Violation Query", text: "Could you specify the exact legal code or reason for this stop?" },
  { label: "Document Handoff", text: "I am presenting my documents now. [Name each asset clearly.]" },
  { label: "Dispute Clause", text: "I respectfully contest this charge and request a court summons." },
  { label: "Cash Refusal", text: "I will process this through official online channels only. I cannot pay without a digital receipt." },
];

export default function PoliceModePageComponent() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { data: countries } = useListCountries();
  const { data: emergency } = useGetEmergencyContacts(selectedCountry, {
    query: { enabled: !!selectedCountry, queryKey: getGetEmergencyContactsQueryKey(selectedCountry) },
  });
  const { toast } = useToast();

  const [policeMode, setPoliceMode] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("en-IN");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + " ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) setTranscript((prev) => prev + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => { setIsRecording(false); setInterimTranscript(""); };
      recognitionRef.current = recognition;
    }
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) {
      toast({ title: "Module Offline", description: "Forensic audio stream not supported in this environment.", variant: "destructive" });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  function toggleDoc(id: string) {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  function speak(text: string, id: string) {
    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(null);
    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  }

  function copyScript(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  }

  return (
    <div className={cn("max-w-7xl mx-auto space-y-8 relative", policeMode ? "bg-red-500/5 transition-colors duration-1000" : "")}>
      {/* Tactical HUD Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-5">
        <div className="absolute inset-0 bg-grid-slate-200 opacity-20" />
      </div>

      {/* Header */}
      <div className="flex items-end justify-between relative z-10 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-5">
          <div className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center backdrop-blur-md transition-all duration-500", policeMode ? "bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-primary/10 border-primary/30")}>
            <ShieldAlert className={cn("w-8 h-8", policeMode ? "text-red-500" : "text-primary")} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn("text-[10px] font-black tracking-[0.4em] uppercase border-primary/30 px-3 py-1", policeMode ? "text-red-500 border-red-500/30 bg-red-500/5" : "text-primary bg-primary/5")}>
                Protocol: {policeMode ? "ENFORCEMENT INTERACTION" : "STANDBY"}
              </Badge>
              {policeMode && (
                <Badge className="bg-red-500 text-white font-black text-[10px] tracking-widest animate-pulse border-none px-3 py-1">
                  TACTICAL MODE ACTIVE
                </Badge>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent uppercase leading-none">
              Police Mode
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200 backdrop-blur-md">
           <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48 bg-white border-slate-200 rounded-xl h-12 font-black text-xs tracking-widest uppercase text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel">
              {(Array.isArray(countries) ? countries : [])?.map((c) => (
                <SelectItem key={c.code} value={c.code} className="font-bold text-xs">{c.flag} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setPoliceMode((v) => !v)}
            className={cn(
              "h-12 px-8 font-black tracking-widest uppercase rounded-xl transition-all duration-500 flex items-center gap-3",
              policeMode 
                ? "bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:bg-red-500" 
                : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-800"
            )}
          >
            {policeMode ? <Radio className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            {policeMode ? "ABORT PROTOCOL" : "INITIATE STOP MODE"}
          </button>
        </div>
      </div>

      {!policeMode ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
           <div className="w-32 h-32 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
              <ShieldAlert className="w-12 h-12 text-primary/40" />
           </div>
           <div className="max-w-xl space-y-4">
              <h2 className="text-2xl font-black tracking-widest uppercase">System on Standby</h2>
              <p className="text-muted-foreground font-bold leading-relaxed">
                Sentinel-X's legal defense matrix is ready. If stopped by enforcement officers, 
                activate <span className="text-primary">STOP MODE</span> to access real-time rights, document checklists, and forensic audio logging.
              </p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-500 relative z-10">
          
          {/* LEFT: Documents & Emergency */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary" />
                  Asset Verification Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden",
                      checkedDocs.has(doc.id) 
                        ? "bg-primary/10 border-primary/40" 
                        : "bg-white border-slate-100 hover:border-primary/20 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                      checkedDocs.has(doc.id) ? "bg-primary border-primary" : "border-white/10"
                    )}>
                      {checkedDocs.has(doc.id) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm font-black tracking-wide uppercase", checkedDocs.has(doc.id) && "line-through text-primary/60")}>
                        {doc.label}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-0.5">{doc.act}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {emergency && (
              <Card className="glass-panel border-red-500/20 !bg-red-500/5 tactical-border before:!border-red-500 after:!border-red-500">
                 <CardHeader className="pb-4 border-b border-red-500/10">
                    <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 flex items-center gap-3">
                      <Phone className="w-4 h-4" />
                      Critical Distress Links
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 grid grid-cols-2 gap-3">
                    <EmergUplink label="Central Police" number={emergency.police} />
                    <EmergUplink label="Traffic HQ" number={emergency.trafficPolice || emergency.police} />
                    <EmergUplink label="Medical Response" number={emergency.ambulance} />
                    <EmergUplink label="Incident Alert" number={emergency.fire} />
                 </CardContent>
              </Card>
            )}
          </div>

          {/* CENTER: Forensic Audio & Interaction */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Audio Log */}
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                  <Activity className={cn("w-4 h-4 text-primary", isRecording && "animate-pulse")} />
                  Forensic Audio Stream
                </CardTitle>
                <div className="flex items-center gap-4">
                   <Select value={selectedLang} onValueChange={setSelectedLang}>
                    <SelectTrigger className="w-32 h-8 bg-black/40 border-white/10 rounded-lg text-[10px] font-black uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel">
                       <SelectItem value="en-IN">ENGLISH (IN)</SelectItem>
                       <SelectItem value="hi-IN">HINDI</SelectItem>
                       <SelectItem value="th-TH">THAI</SelectItem>
                    </SelectContent>
                  </Select>
                   <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={toggleRecording}
                    className="h-8 px-4 font-black text-[10px] tracking-widest uppercase rounded-lg"
                  >
                    {isRecording ? <MicOff className="w-3 h-3 mr-2" /> : <Mic className="w-3 h-3 mr-2" />}
                    {isRecording ? "STOP LOG" : "START LOG"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {isRecording && (
                   <div className="flex gap-1 h-8 items-end justify-center mb-4">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-primary rounded-full animate-pulse" 
                          style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} 
                        />
                      ))}
                   </div>
                )}
                
                <div className="min-h-48 max-h-64 overflow-y-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs leading-relaxed font-mono relative shadow-inner">
                  <div className="absolute top-2 right-4 text-[8px] font-black text-slate-500 tracking-widest uppercase">Forensic Stream</div>
                  {transcript || interimTranscript ? (
                    <>
                      <span className="text-green-400 font-bold">{transcript}</span>
                      <span className="text-slate-500 italic">{interimTranscript}</span>
                    </>
                  ) : (
                    <span className="text-slate-700 uppercase tracking-widest flex items-center justify-center h-32 italic">Awaiting acoustic data...</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-white/10 bg-white/5 hover:bg-white/10 font-black tracking-widest uppercase text-[10px]"
                    onClick={() => { navigator.clipboard.writeText(transcript); toast({ title: "COPIED", description: "Transcript saved to buffer." }); }}
                    disabled={!transcript}
                  >
                    <Copy className="w-3 h-3 mr-2" /> COPY LOG
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 border-white/10 bg-white/5 hover:bg-white/10 font-black tracking-widest uppercase text-[10px]"
                    onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                  >
                    CLEAR
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Script Matrix */}
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Interaction Protocols
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {SCRIPT.map((s) => (
                  <div key={s.label} className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer" onClick={() => copyScript(s.text, s.label)}>
                    <div className="flex-1">
                       <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">{s.label}</p>
                       <p className="text-xs font-bold text-foreground leading-relaxed">"{s.text}"</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button
                         onClick={(e) => { e.stopPropagation(); speak(s.text, s.label); }}
                         className={cn("p-2 rounded-lg bg-black/40 border border-white/5 transition-colors", isSpeaking === s.label ? "text-primary border-primary" : "text-white/20 hover:text-primary")}
                       >
                         {isSpeaking === s.label ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                       </button>
                       <div className={cn("shrink-0 p-2 rounded-lg bg-black/40 border border-white/5 transition-colors", copiedScript === s.label ? "text-green-500 border-green-500/30" : "text-white/20 group-hover:text-primary")}>
                          {copiedScript === s.label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                       </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Rights & Intel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card className="glass-panel border-white/5 overflow-hidden tactical-border">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
                <CardTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3">
                  <Gavel className="w-4 h-4 text-primary" />
                  Legal Rights Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                 {RIGHTS.map((r, i) => (
                   <div key={i} className="space-y-2 group">
                      <div className="flex items-center gap-3">
                         <div className="text-[10px] font-black text-primary font-mono opacity-40">0{i+1}</div>
                         <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{r.title}</h4>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/80 leading-relaxed pl-7 border-l border-white/5">
                        {r.body}
                      </p>
                   </div>
                 ))}
              </CardContent>
            </Card>

            <Card className="glass-panel !bg-amber-500/5 border-amber-500/20 tactical-border before:!border-amber-500 after:!border-amber-500">
               <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-amber-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Conduct Advisory</p>
                  </div>
                  <p className="text-[11px] font-bold text-amber-500/80 leading-relaxed uppercase tracking-tighter">
                    Maintain absolute professionalism. Record everything. Avoid confrontational physical movements. Assert rights firmly but calmly.
                  </p>
               </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function EmergUplink({ label, number }: { label: string; number: string }) {
  return (
    <a href={`tel:${number}`} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-100 hover:border-red-500/50 hover:bg-red-50 transition-all group shadow-sm">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-red-500">{label}</p>
      <p className="text-xl font-black font-mono text-slate-900 group-hover:text-red-600">{number}</p>
    </a>
  );
}
