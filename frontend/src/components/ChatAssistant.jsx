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
        className="chat-floating-launcher"
        onClick={onToggle}
        title="Open AI Lab Assistant"
      >
        <MessageSquare size={18} />
        <span>{t.title}</span>
      </button>
    );
  }

  return (
    <div className={isEmbedded ? "chat-embedded-card" : "chat-floating-card"}>
      {/* Header */}
      <div className="chat-modal-header">
        <div className="chat-header-title-wrap">
          <div className="chat-header-sparkle-box">
            <Sparkles size={16} />
          </div>
          <div className="chat-header-text-group">
            <span className="chat-header-main-title">{t.title}</span>
            <div className="chat-header-locked-tag">
              <ShieldCheck size={12} />
              <span>Locked: {activePatient?.patient_name || "Context Safe"}</span>
            </div>
          </div>
        </div>

        {!isEmbedded && onToggle && (
          <button
            onClick={onToggle}
            className="chat-close-btn"
            title="Close Assistant"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggested Questions Horizontal Scroller */}
      <div className="chat-suggested-scroller">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="chat-suggested-pill"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="chat-speech-error">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="error-close-btn">✕</button>
        </div>
      )}

      {/* Message Stream */}
      <div className="chat-message-stream">
        {messages.map((m, idx) => {
          const isUser = m.sender === "user";
          const isRefused = !m.allowed && !isUser;
          const isSpeakingThis = activeSpeechIndex === idx;

          return (
            <div
              key={idx}
              className={`chat-msg-row ${isUser ? "user" : "assistant"}`}
            >
              <div
                className={`chat-bubble ${
                  isUser
                    ? "bubble-user"
                    : isRefused
                    ? "bubble-refused"
                    : m.isEmergency
                    ? "bubble-emergency"
                    : "bubble-assistant"
                }`}
              >
                {/* Emergency Alert Tag */}
                {m.isEmergency && (
                  <div className="bubble-tag-emergency">
                    <AlertTriangle size={14} />
                    <span>EMERGENCY CLINICAL NOTICE</span>
                  </div>
                )}

                {/* Privacy Refusal Tag */}
                {isRefused && (
                  <div className="bubble-tag-refusal">
                    <ShieldAlert size={14} />
                    <span>Privacy Refusal (Safety Directive 1)</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="bubble-text">{m.text}</div>

                {/* Citations Box */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="bubble-citations">
                    <div className="citations-header">
                      <BookOpen size={12} />
                      <span>{t.trustedCitations}</span>
                    </div>
                    <div className="citations-list">
                      {m.citations.map((c, cIdx) => (
                        <a
                          key={cIdx}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="citation-link"
                        >
                          <span className="truncate">{c.source}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls: Text-to-Speech + Engine Tag */}
                {!isUser && (
                  <div className="bubble-footer">
                    <span>Engine: {m.provider || "deterministic"}</span>
                    <button
                      onClick={() => handleToggleSpeech(idx, m.text)}
                      className={`bubble-voice-btn ${isSpeakingThis ? "speaking" : ""}`}
                      title={isSpeakingThis ? "Stop audio reading" : "Read message aloud"}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX size={12} />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} />
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
          <div className="chat-loading-row">
            <RefreshCw size={14} className="spinning text-primary" />
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
        className="chat-input-bar"
      >
        {/* Voice Speech-to-Text Button */}
        <button
          type="button"
          onClick={toggleMic}
          className={`mic-btn ${isListening ? "listening" : ""}`}
          title={isListening ? "Listening... click to stop" : "Speak to Assistant"}
          aria-label="Microphone voice input"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t.listening : t.inputPlaceholder}
          disabled={isLoading}
          className="chat-text-input"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="send-btn"
          title="Send message"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
