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
  ShieldAlert,
  FileText,
  Phone,
  Mic,
  MicOff,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Scale,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DOCUMENTS: Array<{ id: string; label: string; description: string; act: string }> = [
  { id: "dl", label: "Driving Licence", description: "Valid DL with correct vehicle class. Both sides.", act: "Motor Vehicles Act / Transport Acts (all countries)" },
  { id: "rc", label: "Registration Certificate (RC)", description: "Vehicle registration book with current address.", act: "All BIMSTEC countries require RC on demand" },
  { id: "insurance", label: "Insurance Certificate", description: "Valid third-party or comprehensive insurance. Not expired.", act: "Mandatory in all 7 BIMSTEC nations" },
  { id: "puc", label: "Pollution Certificate (PUC)", description: "Valid emission test certificate (India/Bangladesh). Not required in all countries.", act: "India: Central Motor Vehicles Rules 1989, Rule 115" },
  { id: "permit", label: "Permit (if commercial)", description: "Route permit for goods/passenger vehicles only.", act: "Required for inter-state commercial transport" },
  { id: "fitness", label: "Fitness Certificate (HV)", description: "Annual fitness cert for heavy vehicles, buses, and trucks.", act: "Required for public/commercial vehicles" },
];

const RIGHTS = [
  { title: "Right to see the officer's identity", body: "You have the right to ask the police officer to show their official ID card and badge number before any interaction. Note it down." },
  { title: "Right to a spot receipt for fines paid", body: "If paying a fine on the spot, always demand an official challan receipt. Never pay without a receipt — this prevents unofficial extortion." },
  { title: "Right not to be harassed or detained without cause", body: "A traffic stop should be brief. If detained, ask clearly: 'Am I being detained or am I free to go?' Know you cannot be held without a valid legal reason." },
  { title: "Right to contest the challan in court", body: "You can contest any challan in a Traffic Court or Magistrate's Court. Get the challan copy and note the offence code, date, and officer details." },
  { title: "Right to record (in most jurisdictions)", body: "In public spaces, you generally have the right to record police interactions on your phone. Do so calmly and non-confrontationally." },
  { title: "Right to call a lawyer before making statements", body: "You are not obligated to make statements without legal counsel present. State clearly: 'I would like to speak to my lawyer before making any statement.'" },
];

const SCRIPT = [
  { label: "Greeting", text: "Good [morning/afternoon/evening] officer. How may I help you?" },
  { label: "Requesting ID", text: "Officer, may I please see your badge number and ID card for my records?" },
  { label: "Asking for reason", text: "Could you please tell me the specific reason you have stopped me today?" },
  { label: "When asked for documents", text: "Certainly, I will provide my documents. [Name each document as you hand it over.]" },
  { label: "Contesting a challan", text: "I respectfully disagree with this charge. I would like to contest this in court. Please provide me the challan copy." },
  { label: "If asked to pay cash", text: "I would prefer to pay through the official online system or at the court. I cannot pay without an official receipt." },
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

  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);

  const LANGUAGES = [
    { value: "en-IN", label: "English (India)" },
    { value: "hi-IN", label: "Hindi" },
    { value: "ta-IN", label: "Tamil" },
    { value: "te-IN", label: "Telugu" },
    { value: "kn-IN", label: "Kannada" },
    { value: "bn-IN", label: "Bengali" },
    { value: "th-TH", label: "Thai" },
    { value: "my-MM", label: "Burmese" },
    { value: "ne-NP", label: "Nepali" },
    { value: "si-LK", label: "Sinhala" },
  ];

  const SpeechRecognitionClass = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  function toggleRecording() {
    if (!SpeechRecognitionClass) {
      toast({ title: "Not supported", description: "Voice transcription requires Chrome or Edge.", variant: "destructive" });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    recognition.start();
    setIsRecording(true);
  }

  function toggleDoc(id: string) {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function copyScript(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight">Police Mode</h1>
            {policeMode && <Badge className="bg-red-500/10 text-red-600 border-red-500/30 animate-pulse">ACTIVE</Badge>}
          </div>
          <p className="text-muted-foreground text-sm">Legal guidance, document checklist, rights, and live transcription when stopped by traffic police</p>
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-police-country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Police Stop Button */}
      <div className="flex justify-center py-2">
        <button
          onClick={() => setPoliceMode((v) => !v)}
          data-testid="button-police-mode"
          className={cn(
            "px-8 py-5 rounded-2xl font-black text-xl tracking-widest border-4 transition-all duration-300 shadow-xl select-none",
            policeMode
              ? "bg-red-600 border-red-400 text-white scale-105 shadow-red-500/40"
              : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:scale-102 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
          )}
        >
          {policeMode ? "POLICE STOP — ACTIVE" : "TAP IF STOPPED BY POLICE"}
        </button>
      </div>

      {policeMode && (
        <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Document Checklist */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Document Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {DOCUMENTS.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    data-testid={`doc-check-${doc.id}`}
                    className="w-full flex items-start gap-3 p-3 rounded-lg border hover:border-primary/30 transition-colors text-left group"
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      checkedDocs.has(doc.id) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                    )}>
                      {checkedDocs.has(doc.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold", checkedDocs.has(doc.id) && "line-through text-muted-foreground")}>{doc.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{doc.act}</p>
                    </div>
                    {checkedDocs.has(doc.id) && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                  </button>
                ))}
                <div className="text-xs text-center text-muted-foreground mt-2">
                  {checkedDocs.size}/{DOCUMENTS.length} documents ready
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            {emergency && (
              <Card className="border border-red-200/50 bg-red-50/20 dark:bg-red-950/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Phone className="w-4 h-4" />
                    Emergency — {emergency.countryName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <EmergNum label="Police" number={emergency.police} />
                  <EmergNum label="Ambulance" number={emergency.ambulance} />
                  {emergency.trafficPolice && <EmergNum label="Traffic Police" number={emergency.trafficPolice} />}
                  <EmergNum label="Fire" number={emergency.fire} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Voice Transcription */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="w-4 h-4 text-primary" />
                  Live Voice Transcription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={selectedLang} onValueChange={setSelectedLang}>
                    <SelectTrigger className="flex-1 h-8 text-xs" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "default"}
                    onClick={toggleRecording}
                    className="gap-1.5"
                    data-testid="button-transcription"
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? "Stop" : "Record"}
                  </Button>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-2 text-xs text-red-500 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Recording in {LANGUAGES.find((l) => l.value === selectedLang)?.label}...
                  </div>
                )}

                <div className="min-h-32 max-h-48 overflow-y-auto p-3 rounded-lg bg-muted/50 border text-sm leading-relaxed font-mono" data-testid="transcript-display">
                  {transcript || interimTranscript ? (
                    <>
                      <span className="text-foreground">{transcript}</span>
                      <span className="text-muted-foreground italic">{interimTranscript}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Transcript will appear here...</span>
                  )}
                </div>

                {transcript && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => { navigator.clipboard.writeText(transcript); toast({ title: "Copied" }); }}
                      data-testid="button-copy-transcript"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy transcript
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => { setTranscript(""); setInterimTranscript(""); }}
                      data-testid="button-clear-transcript"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Know Your Rights */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Know Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {RIGHTS.map((r, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-xs font-semibold mb-0.5">{i + 1}. {r.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Interaction Script */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Interaction Script
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {SCRIPT.map((s) => (
                  <div key={s.label} className="flex items-start gap-2 p-2 rounded-lg bg-muted/40 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                      <p className="text-xs mt-0.5">{s.text}</p>
                    </div>
                    <button
                      onClick={() => copyScript(s.text, s.label)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background"
                      data-testid={`copy-script-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {copiedScript === s.label ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!policeMode && (
        <Card className="border border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/10 max-w-2xl mx-auto">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-semibold">How to use Police Mode:</span> Tap the button above when stopped by traffic police. It will reveal your document checklist, legal rights, a live voice transcription recorder (to record the interaction), and quick-dial emergency numbers. Stay calm and professional.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmergNum({ label, number }: { label: string; number: string }) {
  return (
    <a href={`tel:${number}`} className="block p-2 rounded-lg bg-background border hover:border-red-300 transition-colors text-center" data-testid={`police-emergency-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-black font-mono text-red-600 dark:text-red-400">{number}</p>
    </a>
  );
}
