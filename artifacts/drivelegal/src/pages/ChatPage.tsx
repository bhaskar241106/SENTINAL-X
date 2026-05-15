import { useState, useRef, useEffect, useCallback } from "react";
import { useCountry } from "@/App";
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
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [mode, setMode] = useState("normal");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
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
      const response = await fetch(`/api/gemini/conversations/${convoId}/messages`, {
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Button
            className="w-full"
            size="sm"
            onClick={() => setActiveConvoId(null)}
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {convosLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
          ) : conversations?.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-6 px-4">Start a conversation with DriveLegal AI</div>
          ) : (
            conversations?.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors",
                  c.id === activeConvoId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
                onClick={() => setActiveConvoId(c.id)}
                data-testid={`conversation-${c.id}`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs flex-1 truncate font-medium">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`button-delete-conversation-${c.id}`}
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="px-6 py-3 border-b bg-card flex items-center gap-3">
          <h1 className="font-semibold text-sm flex-1">AI Legal Assistant</h1>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((c) => (
                <SelectItem key={c.code} value={c.code} data-testid={`option-country-${c.code}`}>
                  {c.flag} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m.value} value={m.value} data-testid={`option-mode-${m.value}`}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mode !== "normal" && (
            <Badge variant="outline" className="text-xs capitalize">{mode} mode</Badge>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!activeConvoId && !streaming && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-xl mb-1">DriveLegal AI</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Ask about traffic laws, fines, or road rules across 7 BIMSTEC nations.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left text-xs p-3 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    data-testid={`suggestion-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {convoLoading && <Skeleton className="h-20 rounded-xl" />}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
              data-testid={`message-${m.id}`}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border rounded-tl-sm"
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {streaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-card border leading-relaxed">
                {streamedContent ? (
                  <p className="whitespace-pre-wrap">{streamedContent}</p>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t bg-card">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about traffic laws, fines, driving rules..."
                className="min-h-[44px] max-h-32 resize-none text-sm pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={streaming}
                data-testid="input-message"
              />
              {isVoiceRecording && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <Button
              onClick={toggleVoiceInput}
              size="icon"
              variant={isVoiceRecording ? "destructive" : "outline"}
              className="h-11 w-11 shrink-0"
              title={isVoiceRecording ? "Stop recording" : "Voice input"}
              data-testid="button-voice-input"
            >
              {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming}
              size="icon"
              className="h-11 w-11 shrink-0"
              data-testid="button-send"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for newline · <Mic className="w-3 h-3 inline" /> for voice input
          </p>
        </div>
      </div>
    </div>
  );
}
