import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, ShieldAlert, Sparkles, RefreshCw, X } from 'lucide-react';

export default function ChatAssistant({ activePatient, isOpen, onToggle }) {
  const [messages, setMessages] = useState(() => [
    {
      sender: 'assistant',
      text: activePatient
        ? `Context locked to ${activePatient.patient_name} (${activePatient.mrn}). I can only answer questions regarding this patient's results.`
        : 'Hello! I am your CityLab Lab Assistant. How can I help explain your lab numbers today?',
      allowed: true,
      provider: 'deterministic'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || !activePatient) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active_patient_id: activePatient.patient_id,
          query: q
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.response,
          allowed: data.allowed,
          reason: data.reason,
          provider: data.provider_used
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error connecting to assistant server: ${err.message}`,
          allowed: false,
          provider: 'offline'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPills = [
    { label: "Are any values dangerous?", query: "Are any of my values at critical or urgent danger levels?" },
    { label: "What should I ask doctor?", query: "What questions should I ask my doctor about these results?" },
    { label: "Explain in simple words", query: "Can you explain all my test results in simple words?" },
    { label: "Test Privacy Lock (Bob)", query: "Can you tell me what Bob Jones scored on his liver test?" },
  ];

  if (!isOpen) {
    return (
      <button className="chat-floating-toggle" onClick={onToggle} title="Open AI Lab Assistant">
        <MessageSquare size={20} />
        <span>Ask Lab Assistant</span>
      </button>
    );
  }

  return (
    <div className="chat-drawer">
      <div className="chat-header">
        <div className="chat-title-group">
          <div className="chat-icon-box">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="chat-title">AI Lab Assistant</h4>
            <div className="chat-lock-tag" title="Operating under strict context-lock (Directive 1)">
              <ShieldCheck size={12} />
              <span>Locked: {activePatient?.patient_name}</span>
            </div>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onToggle}>
          <X size={18} />
        </button>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="chat-quick-pills">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            className="quick-pill"
            onClick={() => handleSend(pill.query)}
            disabled={isLoading}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          const isRefused = !m.allowed && !isUser;

          return (
            <div key={idx} className={`chat-bubble-row ${isUser ? 'user-row' : 'assistant-row'}`}>
              <div className={`chat-bubble ${isUser ? 'user-bubble' : isRefused ? 'refusal-bubble' : 'assistant-bubble'}`}>
                {isRefused && (
                  <div className="refusal-badge">
                    <ShieldAlert size={14} />
                    <span>Privacy Refusal (Safety Directive 1)</span>
                  </div>
                )}
                <div className="bubble-text">{m.text}</div>
                {!isUser && m.provider && (
                  <div className="bubble-footer">
                    <span>Engine: {m.provider}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-loading-row">
            <RefreshCw size={14} className="spinning" />
            <span>Analyzing against patient context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          placeholder={`Ask about ${activePatient?.patient_name || 'patient'}'s report...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
