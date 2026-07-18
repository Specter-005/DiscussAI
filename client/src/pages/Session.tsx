import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, useUpdateSession } from "@/hooks/use-sessions";
import { useMessages, useCreateMessage } from "@/hooks/use-messages";
import { useTTS } from "@/hooks/use-tts";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { GlassPanel } from "@/components/GlassPanel";
import { CyberButton } from "@/components/CyberButton";
import { SessionTimer } from "@/components/SessionTimer";
import { TurnCounter } from "@/components/TurnCounter";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import { useToast } from "@/hooks/use-toast";
import {
  Send, LogOut, Loader2, User, MessageSquare, Mic, MicOff,
  Volume2, VolumeX, SkipForward
} from "lucide-react";

const DIFFICULTY_TIMER: Record<string, number> = {
  easy: 5 * 60,
  medium: 8 * 60,
  hard: 12 * 60,
};

const DIFFICULTY_TURNS: Record<string, number> = {
  easy: 8,
  medium: 6,
  hard: 4,
};

const PERSONA_COLORS: Record<string, { bg: string; border: string; gradient: string }> = {
  Alex: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", gradient: "from-cyan-500/20 to-blue-500/10" },
  Jordan: { bg: "bg-purple-500/10", border: "border-purple-500/30", gradient: "from-purple-500/20 to-pink-500/10" },
  Casey: { bg: "bg-red-500/10", border: "border-red-500/30", gradient: "from-red-500/20 to-orange-500/10" },
  Morgan: { bg: "bg-green-500/10", border: "border-green-500/30", gradient: "from-green-500/20 to-cyan-500/10" },
  Riley: { bg: "bg-orange-500/10", border: "border-orange-500/30", gradient: "from-orange-500/20 to-yellow-500/10" },
};

export default function Session() {
  const [, params] = useRoute("/session/:id");
  const [, setLocation] = useLocation();
  const sessionId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();

  const { data: sessionData, isLoading: sessionLoading } = useSession(sessionId);
  const { data: messages, isLoading: messagesLoading } = useMessages(sessionId);
  const sendMessage = useCreateMessage(sessionId!);
  const updateSession = useUpdateSession();

  const [input, setInput] = useState("");
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [typingPersona, setTypingPersona] = useState<string | null>(null);
  const [skipRequested, setSkipRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLenRef = useRef(0);

  const tts = useTTS();
  const voice = useVoiceInput();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-speak new AI messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const newCount = messages.length - prevMessagesLenRef.current;
    if (newCount > 0 && prevMessagesLenRef.current > 0) {
      const newMsgs = messages.slice(-newCount);
      for (const m of newMsgs) {
        if (m.participant.isAi) {
          tts.speak(m.message.content, m.participant.name);
        }
      }
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages]);

  const difficulty = sessionData?.session?.difficulty || "medium";
  const timerDuration = DIFFICULTY_TIMER[difficulty] || 480;
  const maxTurns = DIFFICULTY_TURNS[difficulty] || 6;

  const handleTimeUp = useCallback(() => {
    if (!sessionEnded) {
      toast({
        title: "⏱️ Time's up!",
        description: "Your session has ended. Redirecting to evaluation...",
        variant: "destructive",
      });
      handleEndSession();
    }
  }, [sessionEnded]);

  const handleEndSession = async () => {
    if (!sessionData?.session || sessionEnded) return;
    setSessionEnded(true);
    tts.stopAll();
    try {
      await updateSession.mutateAsync({
        id: sessionData.session.id,
        updates: { status: "completed" },
      });
      // Save session metadata to localStorage for analytics
      const history = JSON.parse(localStorage.getItem("discuss-ai-sessions") || "[]");
      history.push({
        id: sessionData.session.id,
        topicTitle: sessionData.topic?.title || "Unknown",
        difficulty,
        turnsUsed,
        maxTurns,
        date: new Date().toISOString(),
      });
      localStorage.setItem("discuss-ai-sessions", JSON.stringify(history));
      setLocation(`/session/${sessionData.session.id}/feedback`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to end session.", variant: "destructive" });
      setSessionEnded(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <h2 className="text-xl font-display font-bold text-primary tracking-widest neon-text-cyan animate-pulse">
          ESTABLISHING CONNECTION...
        </h2>
      </div>
    );
  }

  if (!sessionData) return <div className="p-8 text-center text-red-500">Session not found.</div>;

  const { session, participants, topic } = sessionData;
  const userParticipant = participants.find((p) => !p.isAi);
  const aiParticipants = participants.filter((p) => p.isAi);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userParticipant || sessionEnded) return;
    if (turnsUsed >= maxTurns) {
      toast({ title: "No turns left!", description: "Session ending...", variant: "destructive" });
      handleEndSession();
      return;
    }

    const messageContent = input;
    setInput("");
    setTurnsUsed((prev) => prev + 1);
    setSkipRequested(false);

    // Show typing indicator after a short delay
    setTimeout(() => {
      if (!skipRequested) setTypingPersona(aiParticipants[0]?.name || null);
    }, 800);

    try {
      await sendMessage.mutateAsync({
        content: messageContent,
        participantId: userParticipant.id,
      });
      setTypingPersona(null);

      // Check if this used the last turn
      if (turnsUsed + 1 >= maxTurns) {
        setTimeout(() => {
          toast({ title: "All turns used!", description: "Session ending...", variant: "destructive" });
          handleEndSession();
        }, 3000);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      setInput(messageContent);
      setTurnsUsed((prev) => Math.max(0, prev - 1));
      setTypingPersona(null);
    }
  };

  const handleVoiceRecord = async () => {
    if (voice.isRecording) {
      const { transcript } = await voice.stopRecording();
      if (transcript && transcript.trim()) {
        setInput(transcript.trim());
      }
    } else {
      try {
        await voice.startRecording();
      } catch (err) {
        toast({
          title: "Microphone Error",
          description: "Please allow microphone access.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSkipAI = () => {
    setSkipRequested(true);
    setTypingPersona(null);
    tts.stopAll();
  };

  const getTimestamp = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  return (
    <div className="min-h-screen flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 glass-panel rounded-none border-t-0 border-x-0 flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <h1 className="font-display font-bold tracking-wider text-xs md:text-sm truncate">
              <span className="text-muted-foreground">TOPIC:</span> {topic.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Timer */}
          <SessionTimer
            durationSeconds={timerDuration}
            onTimeUp={handleTimeUp}
            isActive={!sessionEnded}
          />

          {/* Turn Counter */}
          <div className="hidden md:block">
            <TurnCounter totalTurns={maxTurns} usedTurns={turnsUsed} />
          </div>

          {/* Mute TTS */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={tts.toggleMute}
            className={`p-2 rounded-lg transition-all ${
              tts.isMuted
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-primary/10 text-primary border border-primary/30"
            }`}
            title={tts.isMuted ? "Unmute AI voices" : "Mute AI voices"}
          >
            {tts.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>

          <CyberButton variant="ghost" size="sm" onClick={handleEndSession}>
            <LogOut className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">TERMINATE</span>
          </CyberButton>
        </div>
      </header>

      {/* Mobile Turn Counter */}
      <div className="md:hidden px-4 py-2 glass-panel rounded-none border-x-0">
        <TurnCounter totalTurns={maxTurns} usedTurns={turnsUsed} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Entities */}
        <aside className="hidden lg:flex w-72 flex-col p-4 border-r border-border bg-card/30 z-10 shrink-0">
          <h2 className="text-xs font-bold font-display text-muted-foreground tracking-widest mb-4 uppercase">
            Active Personas ({aiParticipants.length})
          </h2>
          <div className="space-y-3 overflow-y-auto scrollbar-hide">
            {aiParticipants.map((ai) => {
              const colors = PERSONA_COLORS[ai.name] || PERSONA_COLORS.Alex;
              const isSpeaking = tts.speakingPersona === ai.name;

              return (
                <GlassPanel
                  key={ai.id}
                  className={`p-3 bg-gradient-to-br ${colors.gradient} border ${colors.border} transition-all duration-300 ${
                    isSpeaking ? "scale-[1.02] shadow-lg shadow-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} border-2 flex items-center justify-center font-bold text-sm ${
                          isSpeaking ? `${colors.border} neon-border-cyan` : "border-border"
                        }`}
                      >
                        {ai.avatar || ai.name.substring(0, 1)}
                      </div>
                      {isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold text-sm ${isSpeaking ? "text-foreground" : "text-muted-foreground"}`}>
                        {ai.name}
                      </p>
                      <p className="text-xs text-muted-foreground italic truncate">{ai.personality}</p>
                      {isSpeaking && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-primary font-bold tracking-widest uppercase mt-0.5"
                        >
                          SPEAKING...
                        </motion.p>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </aside>

        {/* Center - Chat Area */}
        <main className="flex-1 flex flex-col relative z-0">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
            <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border-[1px] rounded-full border-primary/50 animate-[spin_120s_linear_infinite]" />
            <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border-[1px] rounded-full border-secondary/50 animate-[spin_90s_linear_infinite_reverse]" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide relative z-10">
            {messagesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-50" />
              </div>
            ) : messages?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <MessageSquare className="w-12 h-12 opacity-20" />
                <p className="font-display tracking-widest uppercase text-sm">Awaiting initial input...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages?.map((m) => {
                  const isUser = !m.participant.isAi;
                  const colors = PERSONA_COLORS[m.participant.name] || PERSONA_COLORS.Alex;

                  return (
                    <motion.div
                      key={m.message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2 mb-1 ml-1 mr-1">
                          <span className="text-xs text-muted-foreground font-display tracking-wider uppercase">
                            {m.participant.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">
                            {getTimestamp(m.message.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`
                            p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md relative
                            ${
                              isUser
                                ? "bg-primary/10 border border-primary/30 rounded-tr-sm shadow-[0_4px_20px_rgba(0,140,200,0.1)] border-r-4 border-r-primary"
                                : `${colors.bg} border ${colors.border} rounded-tl-sm`
                            }
                          `}
                        >
                          {m.message.content}
                          {/* Speaker replay button for AI messages */}
                          {!isUser && (
                            <button
                              onClick={() => tts.replayMessage(m.message.content, m.participant.name)}
                              className="absolute top-2 right-2 p-1 rounded-md opacity-0 hover:opacity-100 bg-primary/10 text-primary hover:bg-primary/20 transition-all group-hover:opacity-50"
                              style={{ opacity: 0.3 }}
                              title="Replay audio"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator */}
                {typingPersona && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[70%] flex flex-col items-start">
                      <span className="text-xs text-muted-foreground font-display tracking-wider uppercase mb-1 ml-1">
                        {typingPersona}
                      </span>
                      <div className="p-4 rounded-2xl rounded-tl-sm bg-muted/20 border border-border">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                          <div className="w-2 h-2 rounded-full bg-primary typing-dot" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Skip AI button */}
          {(typingPersona || sendMessage.isPending) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-2"
            >
              <button
                onClick={handleSkipAI}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all mx-auto"
              >
                <SkipForward className="w-3 h-3" />
                Skip AI Response
              </button>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-4 glass-panel rounded-none border-x-0 border-b-0 shrink-0 z-20 space-y-2">
            {/* Voice waveform */}
            {voice.isRecording && (
              <div className="flex items-center gap-3 px-4 py-2">
                <WaveformVisualizer analyserData={voice.analyserData} isActive={voice.isRecording} />
                <span className="text-xs text-red-400 font-display tabular-nums">
                  {voice.maxSeconds - voice.recordingTime}s
                </span>
              </div>
            )}

            {/* Live transcript */}
            {voice.liveTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm"
              >
                <p className="text-xs text-primary/70 mb-1 uppercase tracking-wider">Live transcript:</p>
                <p>{voice.liveTranscript}</p>
              </motion.div>
            )}

            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex gap-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-primary" />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sessionEnded ? "Session ended" : "Type or use voice..."}
                disabled={sendMessage.isPending || sessionEnded}
                className="flex-1 bg-muted/20 border border-border text-foreground placeholder:text-muted-foreground rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />

              {/* Voice Recording Button with countdown ring */}
              <button
                type="button"
                onClick={handleVoiceRecord}
                disabled={sendMessage.isPending || sessionEnded}
                className={`p-3 rounded-lg transition-all relative ${
                  voice.isRecording
                    ? "bg-red-500/20 border border-red-500/50 text-red-400"
                    : "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30"
                }`}
                title={voice.isRecording ? "Stop recording" : "Start voice recording"}
              >
                {voice.isRecording && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - voice.recordingTime / voice.maxSeconds)}
                      className="text-red-400 transform -rotate-90 origin-center"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                )}
                {voice.isRecording ? (
                  <MicOff className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <button
                type="submit"
                disabled={!input.trim() || sendMessage.isPending || sessionEnded}
                className="p-3 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
