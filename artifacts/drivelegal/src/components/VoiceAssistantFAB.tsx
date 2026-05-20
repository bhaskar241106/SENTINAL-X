import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCountry, useApi } from "@/App";

export function VoiceAssistantFAB() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { baseUrl } = useApi();
  const [, setLocation] = useLocation();

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US"; // Can be dynamic based on country later

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error !== 'no-speech') {
            console.error("Speech recognition error", event.error);
          }
        };
        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleVoiceCommand(transcript);
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  async function handleVoiceCommand(text: string) {
    if (!text.trim()) return;

    // Show a toast so user knows it heard them
    toast({ title: "Heard:", description: `"${text}"`, duration: 3000 });

    setIsProcessing(true);
    try {
      let cleanBaseUrl = baseUrl.trim();
      if (cleanBaseUrl && !cleanBaseUrl.startsWith("http")) {
        cleanBaseUrl = `http://${cleanBaseUrl}`;
      }
      const apiUrl = cleanBaseUrl ? `${cleanBaseUrl.replace(/\/$/, "")}/api/gemini/voice` : "/api/gemini/voice";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, country: selectedCountry }),
      });
      const data = await response.json();

      if (data.success && data.text) {
        speakOutLoud(data.text);
        toast({ title: "Sentinel AI", description: data.text });

        // AUTOMATION: Execute Action
        if (data.action) {
           if (data.action.type === "NAVIGATE" && data.action.value) {
             setLocation(data.action.value);
           } else if (data.action.type === "SET_COUNTRY" && data.action.value) {
             setSelectedCountry(data.action.value.toUpperCase());
           }
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to process voice command", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }

  function speakOutLoud(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    synthRef.current.speak(utterance);
  }

  function toggleListen() {
    if (!recognitionRef.current) {
      toast({ title: "Not Supported", description: "Your browser does not support Voice Recognition.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // stop any playing speech
      if (synthRef.current) synthRef.current.cancel();
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Handle case where it's already started
        console.error(e);
      }
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
      {/* Neural Link Tooltip */}
      {(isListening || isProcessing) && (
        <div className="bg-black/80 backdrop-blur-xl border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)] px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-right-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Neural Processing...</span>
              </>
            ) : (
              <>
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Acoustic Uplink Active</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB Core */}
      <div className="relative group">
        <div className={cn(
          "absolute -inset-2 rounded-full blur-md transition-all duration-500",
          isProcessing ? "bg-primary/20 animate-pulse" : 
          isListening ? "bg-red-500/30 animate-ping" : "bg-primary/10 group-hover:bg-primary/30"
        )} />
        <button
          onClick={toggleListen}
          disabled={isProcessing}
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 backdrop-blur-xl border border-white/10",
            isProcessing ? "bg-black/90 text-primary border-primary/50" :
              isListening ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border-red-400" : 
              "bg-black/60 text-white hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:border-primary hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
          )}
        >
          {isProcessing ? (
            <div className="relative">
              <Loader2 className="w-7 h-7 animate-spin" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]" />
            </div>
          ) : isListening ? (
            <div className="relative">
              <MicOff className="w-7 h-7" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            </div>
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>
    </div>
  );
}
