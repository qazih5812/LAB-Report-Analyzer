import React, { useState, useRef, useEffect } from "react";
import { apiUrl } from "../api";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ExternalLink,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { startListening, speakText, stopSpeech, isSpeechRecognitionSupported } from "../utils/voice";
import { translations } from "../locales/translations";

export default function ChatAssistant({
  activePatient,
  isOpen = true,
  onToggle,
  isEmbedded = false,
  language = "en",
}) {
  const t = translations[language]?.chat || translations.en.chat;

  const [messages, setMessages] = useState(() => [
    {
      sender: "assistant",
      text: activePatient
        ? `Context locked to ${activePatient.patient_name} (${activePatient.mrn}). I can only answer questions regarding this patient's certified results.`
        : "Hello! I am your CityLab Lab Assistant. How can I help explain your lab numbers today?",
      allowed: true,
      provider: "deterministic",
      citations: [],
      isEmergency: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);
  const [speechError, setSpeechError] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Update initial message when active patient changes
  useEffect(() => {
    if (activePatient) {
      setMessages([
        {
          sender: "assistant",
          text: `Context locked to ${activePatient.patient_name} (${activePatient.mrn}). I can only answer questions regarding this patient's certified results under Directive 1.`,
          allowed: true,
          provider: "deterministic",
          citations: [],
          isEmergency: false,
        },
      ]);
    }
  }, [activePatient?.patient_id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || !activePatient) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setSpeechError(null);

    try {
      const res = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active_patient_id: activePatient.patient_id,
          query: q,
          language: language || "en",
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: data.response,
          allowed: data.allowed,
          reason: data.reason,
          provider: data.provider_used,
          citations: data.citations || [],
          isEmergency: Boolean(data.is_emergency),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: `Error connecting to assistant server: ${err.message}`,
          allowed: false,
          provider: "offline",
          citations: [],
          isEmergency: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    const rec = startListening({
      language,
      onResult: (transcript) => {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      },
      onError: (errMsg) => {
        setSpeechError(errMsg);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (rec) {
      recognitionRef.current = rec;
      setIsListening(true);
    }
  };

  const handleToggleSpeech = (index, text) => {
    if (activeSpeechIndex === index) {
      stopSpeech();
      setActiveSpeechIndex(null);
    } else {
      stopSpeech();
      setActiveSpeechIndex(index);
      speakText(text, {
        language,
        onEnd: () => setActiveSpeechIndex(null),
        onError: () => setActiveSpeechIndex(null),
      });
    }
  };

  const suggestedQuestions = t.suggestedQuestions || [
    "Are any of my values at critical or urgent danger levels?",
    "What questions should I ask my doctor about these results?",
    "Can you explain all my test results in simple words?",
    "Can you tell me what Bob Jones scored on his liver test?",
  ];

  if (!isEmbedded && !isOpen) {
    return (
      <button
        className="fixed bottom-6 end-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-xl shadow-teal-600/30 transition-transform hover:scale-105"
        onClick={onToggle}
        title="Open AI Lab Assistant"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold">{t.title}</span>
      </button>
    );
  }

  return (
    <div
      className={
        isEmbedded
          ? "w-full max-w-4xl mx-auto flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-[calc(100vh-140px)]"
          : "fixed bottom-6 end-6 z-50 w-full max-w-md sm:w-96 flex flex-col bg-card rounded-2xl border border-border shadow-2xl overflow-hidden h-[540px] animate-in fade-in zoom-in-95 duration-200"
      }
    >
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-teal-700 to-teal-600 px-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-none">{t.title}</span>
            <div className="flex items-center gap-1 text-[11px] text-teal-100 mt-1 truncate">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">Locked: {activePatient?.patient_name || "Context Safe"}</span>
            </div>
          </div>
        </div>

        {!isEmbedded && onToggle && (
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Questions Horizontal Scroller */}
      <div className="px-3 py-2 bg-secondary/50 border-b border-border flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-card hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-400 text-[11px] font-medium text-muted-foreground border border-border/70 shrink-0 transition-colors text-start whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-xs font-bold px-1">✕</button>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-background/50">
        {messages.map((m, idx) => {
          const isUser = m.sender === "user";
          const isRefused = !m.allowed && !isUser;
          const isSpeakingThis = activeSpeechIndex === idx;

          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs relative group
                  ${isUser
                    ? "bg-teal-600 text-white rounded-ee-xs"
                    : isRefused
                    ? "bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-500/30 rounded-es-xs"
                    : m.isEmergency
                    ? "bg-red-500/15 text-red-900 dark:text-red-200 border-2 border-red-500 rounded-es-xs font-medium"
                    : "bg-card text-card-foreground border border-border/80 rounded-es-xs"
                  }
                `}
              >
                {/* Emergency Alert Tag */}
                {m.isEmergency && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mb-2 pb-1 border-b border-red-500/30">
                    <AlertTriangle className="w-4 h-4" />
                    <span>EMERGENCY CLINICAL NOTICE</span>
                  </div>
                )}

                {/* Privacy Refusal Tag */}
                {isRefused && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Privacy Refusal (Safety Directive 1)</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Citations Box */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <BookOpen className="w-3 h-3 text-teal-600" />
                      <span>{t.trustedCitations}</span>
                    </div>
                    <div className="space-y-1">
                      {m.citations.map((c, cIdx) => (
                        <a
                          key={cIdx}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-secondary/70 hover:bg-teal-500/10 text-[11px] text-teal-700 dark:text-teal-400 transition-colors"
                        >
                          <span className="truncate">{c.source}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls: Text-to-Speech + Engine Tag */}
                {!isUser && (
                  <div className="mt-2.5 pt-1.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40">
                    <span>Engine: {m.provider || "deterministic"}</span>
                    <button
                      onClick={() => handleToggleSpeech(idx, m.text)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-secondary transition-colors
                        ${isSpeakingThis ? "text-teal-600 font-bold" : "text-muted-foreground"}
                      `}
                      title={isSpeakingThis ? "Stop audio reading" : "Read message aloud"}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/60 p-2.5 rounded-xl border border-border/50 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Verifying results against clinical rules engine...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Voice Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0"
      >
        {/* Voice Speech-to-Text Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`p-2 rounded-xl transition-all
            ${isListening
              ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }
          `}
          title={isListening ? "Listening... click to stop" : "Speak to Assistant"}
          aria-label="Microphone voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t.listening : t.inputPlaceholder}
          disabled={isLoading}
          className="flex-1 bg-secondary/70 border border-border/60 rounded-xl px-3.5 py-2 text-sm text-foreground outline-none focus:border-teal-500 transition-colors"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
