import { useState, useRef, useEffect, useCallback } from "react";
import { useCountry, useApi } from "@/App";
import {
  useListGeminiConversations,
  getListGeminiConversationsQueryKey,
  useCreateGeminiConversation,
  useGetGeminiConversation,
  getGetGeminiConversationQueryKey,
  useDeleteGeminiConversation,
  useListCountries,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  Bot,
  Radio,
  Gavel,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MODES = [
  { value: "normal", label: "General" },
  { value: "tourist", label: "Tourist" },
  { value: "violation", label: "Violation" },
  { value: "emergency", label: "Emergency" },
];

const SUGGESTED_QUESTIONS = [
  "What is the drunk driving limit?",
  "Is a helmet required for passengers?",
  "What's the speed limit on highways?",
  "What documents must I carry while driving?",
];

export default function ChatPage() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { baseUrl } = useApi();
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [mode, setMode] = useState("normal");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const voiceRecognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: countries } = useListCountries();

  const SpeechRecognitionClass = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const toggleVoiceInput = useCallback(() => {
    if (!SpeechRecognitionClass) {
      toast({ title: "Not supported", description: "Voice input requires Chrome or Edge.", variant: "destructive" });
      return;
    }
    if (isVoiceRecording) {
      voiceRecognitionRef.current?.stop();
      setIsVoiceRecording(false);
      return;
    }
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    voiceRecognitionRef.current = recognition;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const spoken = event.results[0]?.[0]?.transcript ?? "";
      if (spoken) setInput((prev) => (prev ? prev + " " + spoken : spoken));
    };
    recognition.onerror = () => setIsVoiceRecording(false);
    recognition.onend = () => setIsVoiceRecording(false);
    recognition.start();
    setIsVoiceRecording(true);
  }, [SpeechRecognitionClass, isVoiceRecording, toast]);

  const speak = (text: string, id: string) => {
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
  };

  const { data: conversations, isLoading: convosLoading } = useListGeminiConversations();
  const { data: activeConvo, isLoading: convoLoading } = useGetGeminiConversation(
    activeConvoId!,
    { query: { enabled: !!activeConvoId, queryKey: getGetGeminiConversationQueryKey(activeConvoId!) } }
  );

  const createConvo = useCreateGeminiConversation();
  const deleteConvo = useDeleteGeminiConversation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages, streamedContent]);

  async function handleSend(messageText?: string) {
    const text = messageText ?? input;
    if (!text.trim() || streaming) return;

    let convoId = activeConvoId;

    if (!convoId) {
      const newConvo = await createConvo.mutateAsync({
        data: { title: text.slice(0, 60) },
      });
      convoId = newConvo.id;
      setActiveConvoId(convoId);
      qc.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
    }

    setInput("");
    setStreaming(true);
    setStreamedContent("");

    try {
      let cleanBaseUrl = baseUrl.trim();
      if (cleanBaseUrl && !cleanBaseUrl.startsWith("http")) {
        cleanBaseUrl = `http://${cleanBaseUrl}`;
      }
      const apiUrl = cleanBaseUrl ? `${cleanBaseUrl.replace(/\/$/, "")}/api/gemini/conversations/${convoId}/messages` : `/api/gemini/conversations/${convoId}/messages`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, country: selectedCountry, mode }),
      });

      if (!response.body) throw new Error("No stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.content) {
                full += data.content;
                setStreamedContent(full);
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setStreaming(false);
      setStreamedContent("");
      qc.invalidateQueries({ queryKey: getGetGeminiConversationQueryKey(convoId!) });
    }
  }

  function handleDelete(id: number) {
    deleteConvo.mutate({ id }, {
      onSuccess: () => {
        if (activeConvoId === id) setActiveConvoId(null);
        qc.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
      },
    });
  }

  const messages = activeConvo?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden">
      <aside className="w-64 border-r bg-sidebar/40 backdrop-blur-2xl flex flex-col shrink-0 border-white/5">
        <div className="p-6 border-b border-white/5">
          <Button
            className="w-full h-11 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
            onClick={() => setActiveConvoId(null)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Initialize Convo
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-4 ml-2">Intelligence Nodes</p>
          {convosLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl bg-white/5" />)
          ) : conversations?.length === 0 ? (
            <div className="text-[10px] font-bold text-muted-foreground/40 text-center py-12 px-6 uppercase tracking-widest leading-relaxed">
              No local neural history detected
            </div>
          ) : (
            conversations?.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all duration-300 relative overflow-hidden border border-transparent",
                  c.id === activeConvoId 
                    ? "bg-white/10 border-white/10 shadow-xl" 
                    : "hover:bg-white/5"
                )}
                onClick={() => setActiveConvoId(c.id)}
              >
                {c.id === activeConvoId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                <MessageSquare className={cn("w-4 h-4 shrink-0", c.id === activeConvoId ? "text-primary" : "text-white/20")} />
                <span className={cn("text-xs flex-1 truncate font-black uppercase tracking-tight", c.id === activeConvoId ? "text-primary" : "text-slate-600 group-hover:text-slate-900")}>
                  {c.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        
        <div className="px-8 py-4 border-b border-white/5 bg-sidebar/20 backdrop-blur-xl flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-black text-xs uppercase tracking-widest text-slate-800">Sentinel AI Engine</h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Link: Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-44 h-10 bg-black/40 border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                {(Array.isArray(countries) ? countries : [])?.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-[10px] font-bold uppercase">
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-36 h-10 bg-black/40 border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-[10px] font-bold uppercase">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-0">
          {!activeConvoId && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-10 text-center animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
                <div className="w-24 h-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10 shadow-2xl">
                  <Bot className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="font-black text-4xl tracking-tighter uppercase">Initialize Neural Link</h2>
                <p className="text-slate-500 text-sm font-bold max-w-md mx-auto leading-relaxed uppercase tracking-tight">
                  Query the BIMSTEC legal database via encrypted satellite uplink. Ask about regional traffic codes, fines, and crossing protocols.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left p-5 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-primary transition-colors mb-2">Preset Query</p>
                    <p className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors leading-relaxed">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {convoLoading && (
            <div className="space-y-6">
              <Skeleton className="h-16 w-2/3 rounded-3xl bg-white/5" />
              <Skeleton className="h-24 w-full rounded-3xl bg-white/5" />
            </div>
          )}

          {messages.map((m, index) => (
            <div
              key={m.id || index}
              className={cn("flex gap-6 animate-in slide-in-from-bottom-2 duration-500", m.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 border",
                m.role === "user" ? "bg-white/5 border-white/10" : "bg-primary/10 border-primary/20"
              )}>
                {m.role === "user" ? <User className="w-5 h-5 text-white/40" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-[28px] px-7 py-5 text-sm font-medium leading-relaxed shadow-2xl relative group",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20"
                    : "glass-panel border-slate-200 rounded-2xl rounded-tl-sm text-slate-800"
                )}
              >
                {m.role === "assistant" && (
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                      onClick={() => speak(m.content, (m.id || index).toString())}
                    >
                      {isSpeaking === (m.id || index).toString() ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-xs md:text-sm">{m.content}</p>
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex gap-6 justify-start animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-7 py-5 glass-panel border-primary/20 text-slate-800 leading-relaxed shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                    onClick={() => speak(streamedContent || "", "streaming")}
                  >
                    {isSpeaking === "streaming" ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                {streamedContent ? (
                  <p className="whitespace-pre-wrap relative z-10">{streamedContent}</p>
                ) : (
                  <div className="flex gap-2 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-32" />
        </div>

        {/* Tactical Input Bar */}
        <div className="absolute bottom-8 left-0 right-0 px-8 z-10">
          <div className="max-w-4xl mx-auto glass-panel border-white/10 p-2 pl-6 rounded-[32px] flex items-center gap-3 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query Sentinel Neural Core..."
              className="flex-1 bg-white/50 border-none focus:ring-0 text-sm py-4 resize-none h-auto max-h-32 min-h-[56px] text-slate-900 placeholder:text-slate-400 font-bold"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={streaming}
            />
            
            <div className="flex items-center gap-2 pr-2">
              <Button
                onClick={toggleVoiceInput}
                size="icon"
                variant="ghost"
                className={cn(
                  "h-12 w-12 rounded-2xl transition-all duration-300",
                  isVoiceRecording ? "bg-red-500/20 text-red-500 scale-110" : "text-white/20 hover:text-white hover:bg-white/5"
                )}
              >
                {isVoiceRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || streaming}
                className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
              >
                {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center mt-4">
            Encrypted Satellite Uplink // {isVoiceRecording ? "Listening for Audio Input" : "Ready for Query"}
          </p>
        </div>
      </div>
    </div>
  );
}
