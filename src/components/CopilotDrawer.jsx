import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Sparkles, Send, AlertCircle } from "lucide-react";
import { buildSuggestedQuestions } from '@/lib/portfolioContextBuilder';
import { getMacroscopeAnalysis } from '@/lib/gemini';
import { useRootStore, SCENARIOS } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { ACCENT } from './SharedComponents';

function formatMarkdown(text) {
  if (!text) return "";
  let html = text;
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-850 dark:bg-neutral-800/80 px-1 py-0.5 rounded text-indigo-400 dark:text-indigo-300 text-xs font-mono">$1</code>');
  html = html.replace(/\n/g, "<br />");
  return html;
}

export default function CopilotDrawer({ isOpen, onClose, messages, setMessages }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);
  const [streamingText, setStreamingText] = useState("");
  
  const endOfMessagesRef = useRef(null);
  const inputRef         = useRef(null);

  const scenarioId  = useRootStore((s) => s.scenarioId);
  const crisisMode  = useRootStore((s) => s.crisisMode);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const liveData    = useRootStore((s) => s.liveData);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  const config = SCENARIO_CONFIG[scenarioId] ?? SCENARIO_CONFIG.EQUILIBRIUM;

  // Build context (memoized — only rebuilds when state changes):
  const portfolioState = useMemo(
    () => ({ scenarioId, weights, analytics, macroInputs, liveData }),
    [scenarioId, weights, analytics, macroInputs, liveData]
  );

  // Build dynamic suggested questions:
  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(scenarioId, analytics),
    [scenarioId, analytics]
  );

  // Auto-scroll to bottom when messages change or drawer opens
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Sync external submissions (from FloatingCopilotTrigger)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user' && !isLoading && !lastMsg.fetched) {
      const updatedMessages = [...messages];
      updatedMessages[updatedMessages.length - 1].fetched = true;
      setMessages(updatedMessages);
      handleSendMessage(lastMsg.content, true);
    }
  }, [messages, isLoading]);

  /**
   * handleSendMessage — executes real LLM call to Gemini API
   */
  const handleSendMessage = useCallback(async (text, isExternal = false) => {
    const msg = (text ?? inputValue).trim();
    if (!msg || isLoading) return;

    setInputValue("");
    setError(null);
    setStreamingText("");

    // Only add user message to chat if not already added externally
    if (!isExternal) {
      const userMsg = { role: 'user', content: msg, fetched: true };
      setMessages(prev => [...prev, userMsg]);
    }

    setIsLoading(true);

    try {
      // Execute the real API call waiting for the promise to resolve
      const aiResponseText = await getMacroscopeAnalysis(
        msg,
        portfolioState,
        messages,
        (chunkText, fullText) => {
          setStreamingText(fullText);
        }
      );

      setMessages(prev => [
        ...prev,
        { role: 'ai', content: aiResponseText },
      ]);
    } catch (err) {
      console.error('[Macroscope] AI API error:', err);
      setError(err.message || "Terjadi kesalahan saat menghubungi layanan AI.");
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  }, [inputValue, isLoading, messages, portfolioState, setMessages]);

  const handleRetry = useCallback(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMsg = userMessages[userMessages.length - 1].content;
      handleSendMessage(lastUserMsg, true);
    }
  }, [messages, handleSendMessage]);

  const handleLocalSubmit = useCallback((text) => {
    if (text.trim() === '') return;
    handleSendMessage(text);
  }, [handleSendMessage]);

  const providerLabel = import.meta.env.VITE_SUPABASE_URL ? 'GEMINI 2.5 FLASH' : 'Offline';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Floating Panel Container */}
      <div
        className={`fixed top-[85px] right-6 z-[100]
                    bg-black/80 backdrop-blur-md border rounded-2xl shadow-2xl flex flex-col
                    w-[450px] h-[calc(100vh-110px)] max-h-[750px]
                    transition-all duration-300 ease-in-out copilot-breathing-glow ${
          isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          "--glow-color": `${acc.neon}33`,
          "--glow-color-active": `${acc.neon}55`,
          "--glow-border": `${acc.neon}30`,
          "--glow-border-active": `${acc.neon}60`,
        }}
      >
        <style>{`
          @keyframes copilotGlow {
            0%, 100% {
              box-shadow: 0 0 20px -5px var(--glow-color);
              border-color: var(--glow-border);
            }
            50% {
              box-shadow: 0 0 25px 0px var(--glow-color-active);
              border-color: var(--glow-border-active);
            }
          }
          .copilot-breathing-glow {
            animation: copilotGlow 6s ease-in-out infinite;
          }
        `}</style>
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b shrink-0"
          style={{ borderColor: 'var(--as-border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h2
              className="text-sm font-semibold tracking-wide font-sans"
              style={{ color: 'var(--as-text-primary)' }}
            >
              Macroscope Quant Copilot
            </h2>
            {/* Provider badge */}
            <span
              className="text-[8px] font-sans px-1.5 py-0.5 rounded-md
                         tracking-widest uppercase"
              style={{
                background: 'var(--as-bg-tertiary)',
                color: config.color,
                border: `1px solid ${config.color}30`,
              }}
            >
              {providerLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-all cursor-pointer"
            style={{ color: 'var(--as-text-secondary)' }}
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 pt-6 flex flex-col gap-4">

          {/* Suggested questions — show when no user messages yet */}
          {messages.filter(m => m.role === 'user').length === 0 && !isLoading && (
            <div className="space-y-4 mb-4 font-sans">
              <div className="p-4 rounded-xl border border-[var(--as-border-primary)] bg-slate-500/[0.01] space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Selamat Datang</span>
                </div>
                <p className="text-xs text-[var(--as-text-secondary)] leading-relaxed">
                  Halo! Saya adalah <strong>Macroscope Quant Copilot</strong>. Saya siap membantu Anda menganalisis alokasi aset, risiko krisis eksternal, dan efisiensi portofolio di bawah skenario aktif <strong>{config.label}</strong>.
                </p>
                <p className="text-[10px] text-[var(--as-text-tertiary)]">
                  Gunakan kolom obrolan di bawah untuk bertanya, atau pilih salah satu topik diskusi yang disarankan berikut:
                </p>
              </div>

              <div
                className="text-[9px] font-sans tracking-widest uppercase mb-2"
                style={{ color: 'var(--as-text-dim)' }}
              >
                PERTANYAAN DISARANKAN
              </div>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleLocalSubmit(q)}
                  className="w-full text-left text-[10px] font-sans px-3 py-2.5
                             rounded-xl cursor-pointer transition-all duration-150 min-h-[44px] flex items-center"
                  style={{
                    background: 'var(--as-bg-tertiary)',
                    color: 'var(--as-text-secondary)',
                    border: '1px solid var(--as-border-secondary)',
                  }}
                  onMouseOver={e =>
                    (e.currentTarget.style.borderColor = config.color + '40')
                  }
                  onMouseOut={e =>
                    (e.currentTarget.style.borderColor =
                      'var(--as-border-secondary)')
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => {
            if (msg.role === 'system') return null;

            return (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={
                    msg.role === 'user'
                      ? "rounded-l-xl rounded-tr-xl p-3 text-sm font-sans leading-relaxed max-w-[85%] shadow-sm"
                      : "border rounded-r-xl rounded-tl-xl p-3 text-sm font-sans leading-relaxed max-w-[90%] shadow-sm"
                  }
                  style={
                    msg.role === 'user'
                      ? {
                          background: `${config.color}20`,
                          color: 'var(--as-text-primary)',
                          border: `1px solid ${config.color}30`,
                        }
                      : {
                          background: 'var(--as-bg-primary)',
                          borderColor: 'var(--as-border-primary)',
                          color: 'var(--as-text-primary)',
                          whiteSpace: 'pre-wrap',
                        }
                  }
                >
                  {msg.role === 'ai' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          })}

          {/* Active streaming response */}
          {isLoading && streamingText && (
            <div className="flex justify-start">
              <div
                className="border rounded-r-xl rounded-tl-xl p-3 text-sm font-sans leading-relaxed max-w-[90%] shadow-sm"
                style={{
                  background: 'var(--as-bg-primary)',
                  borderColor: 'var(--as-border-primary)',
                  color: 'var(--as-text-primary)',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: formatMarkdown(streamingText) }} />
                {/* Blinking block cursor */}
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse align-middle" />
              </div>
            </div>
          )}

          {/* Loading indicator — wait for AI response */}
          {isLoading && !streamingText && (
            <div className="flex justify-start">
              <div
                className="border rounded-r-xl rounded-tl-xl p-4 text-sm
                           font-sans leading-relaxed shadow-sm flex items-center gap-2"
                style={{
                  background: 'var(--as-bg-primary)',
                  borderColor: 'var(--as-border-primary)',
                  color: 'var(--as-text-secondary)',
                }}
              >
                <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                <span className="text-[11px] font-sans animate-pulse">
                  AI sedang berpikir...
                </span>
                <div className="flex gap-1.5 items-center ml-2">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="animate-bounce inline-block w-1 h-1 rounded-full"
                      style={{
                        background: config.color,
                        animationDelay: `${i * 150}ms`,
                        animationDuration: '0.8s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className="mx-1 px-4 py-3 rounded-xl text-[11px] font-sans flex flex-col gap-2"
              style={{
                background: 'rgba(239,68,68,0.10)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.20)',
              }}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span>Koneksi Gagal</span>
              </div>
              <p className="text-slate-400 dark:text-neutral-400">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-center cursor-pointer transition-colors min-h-[44px] inline-flex items-center justify-center font-bold uppercase tracking-wider text-[9px]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input area fixed at bottom */}
        <div
          className="p-4 border-t shrink-0 bg-transparent"
          style={{ borderColor: 'var(--as-border-primary)' }}
        >
          {/* Suggestion Chips (always visible) */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 px-2 w-full">
            {suggestedQuestions.map((chipText, idx) => (
              <button
                key={idx}
                onClick={inputValue === chipText ? () => setInputValue("") : () => setInputValue(chipText)}
                className="text-[11px] px-3.5 py-2.5 rounded-full bg-indigo-900/20
                           text-indigo-300 border border-indigo-500/20 cursor-pointer
                           hover:bg-indigo-500/30 transition-colors whitespace-nowrap min-h-[44px] flex items-center justify-center"
              >
                {chipText}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div
            className="flex items-center gap-3 px-3 py-2 backdrop-blur-md
                       rounded-xl border focus-within:border-indigo-500/50
                       transition-colors"
            style={{
              background: 'var(--as-bg-primary)',
              borderColor: 'var(--as-border-secondary)',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={isLoading ? "Menunggu respons..." : "Ketik pesan..."}
              className="bg-transparent border-none outline-none text-sm font-sans
                         w-full flex-1"
              style={{ color: 'var(--as-text-primary)' }}
              value={inputValue}
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                  handleLocalSubmit(e.target.value);
                  setInputValue('');
                }
              }}
            />
            <button
              onClick={() => {
                if (inputValue.trim() !== '' && !isLoading) {
                  handleLocalSubmit(inputValue);
                  setInputValue('');
                }
              }}
              className="transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              style={{
                color: isLoading
                  ? 'var(--as-text-dim)'
                  : 'var(--as-text-secondary)',
              }}
              disabled={isLoading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
