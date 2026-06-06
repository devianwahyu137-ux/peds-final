import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Sparkles, Send } from "lucide-react";
import { buildPortfolioContext, buildSuggestedQuestions } from '@/lib/portfolioContextBuilder';
import { sendChatMessage, hasStreamingKey } from '@/lib/aiChatService';
import { getAlphaShieldAnalysis } from '@/lib/gemini';
import { useRootStore } from '@/stores/rootStore';
import { useMarketData } from '@/contexts/MacroDataContext';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';

export default function CopilotDrawer({ isOpen, onClose, messages, setMessages }) {
  const [inputValue, setInputValue]   = useState("");
  const [isStreaming, setIsStreaming]  = useState(false);
  const [streamText, setStreamText]   = useState("");
  const [error, setError]             = useState(null);
  const endOfMessagesRef = useRef(null);
  const inputRef         = useRef(null);

  const scenarioId  = useRootStore((s) => s.scenarioId);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const liveData    = useRootStore((s) => s.liveData);
  const { marketData } = useMarketData();

  const config = SCENARIO_CONFIG[scenarioId] ?? SCENARIO_CONFIG.EQUILIBRIUM;

  // Build context (memoized — only rebuilds when state changes):
  const portfolioState = useMemo(
    () => ({ scenarioId, weights, analytics, macroInputs, liveData }),
    [scenarioId, weights, analytics, macroInputs, liveData]
  );

  const portfolioContext = useMemo(
    () => buildPortfolioContext(portfolioState),
    [portfolioState]
  );

  // Build dynamic suggested questions:
  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(scenarioId, analytics),
    [scenarioId, analytics]
  );

  // Auto-scroll to bottom when messages change, streaming, or drawer opens
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText, isStreaming, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Sync external submissions (from FloatingCopilotTrigger)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user' && !isStreaming && !lastMsg.fetched) {
      const updatedMessages = [...messages];
      updatedMessages[updatedMessages.length - 1].fetched = true;
      setMessages(updatedMessages);
      handleSend(lastMsg.content, true);
    }
  }, [messages, isStreaming]);

  /**
   * handleSend — sends message via streaming API (Anthropic/OpenAI)
   * or falls back to Gemini if no streaming key is configured.
   */
  const handleSend = useCallback(async (text, isExternal = false) => {
    const msg = (text ?? inputValue).trim();
    if (!msg || isStreaming) return;

    setInputValue("");
    setError(null);

    // Only add user message to chat if not already added externally
    if (!isExternal) {
      const userMsg = { role: 'user', content: msg, fetched: true };
      setMessages(prev => [...prev, userMsg]);
    }

    setIsStreaming(true);
    setStreamText("");

    // Build history for API (exclude system messages)
    const historyForApi = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content,
      }));

    try {
      if (hasStreamingKey()) {
        // ── STREAMING PATH (Anthropic / OpenAI) ──────────────
        let accumulated = '';
        await sendChatMessage(
          historyForApi,
          msg,
          portfolioState,
          (chunk) => {
            accumulated += chunk;
            setStreamText(accumulated);
          }
        );

        setMessages(prev => [
          ...prev,
          { role: 'ai', content: accumulated },
        ]);
        setStreamText("");
      } else {
        // ── GEMINI FALLBACK (non-streaming) ───────────────────
        const messagesWithContext = [
          { role: 'system', content: portfolioContext },
          ...messages,
        ];

        const aiResponseText = await getAlphaShieldAnalysis(
          msg,
          marketData,
          messagesWithContext
        );

        setMessages(prev => [
          ...prev,
          { role: 'ai', content: aiResponseText },
        ]);
      }
    } catch (err) {
      if (err.message === 'NO_STREAMING_KEY') {
        // Transparent fallback to Gemini
        try {
          const messagesWithContext = [
            { role: 'system', content: portfolioContext },
            ...messages,
          ];
          const aiResponseText = await getAlphaShieldAnalysis(
            msg,
            marketData,
            messagesWithContext
          );
          setMessages(prev => [
            ...prev,
            { role: 'ai', content: aiResponseText },
          ]);
        } catch (geminiErr) {
          console.error('[AlphaShield] Gemini fallback error:', geminiErr);
          setError("Koneksi ke jaringan AlphaShield terputus. Silakan coba beberapa saat lagi.");
        }
      } else {
        console.error('[AlphaShield] AI API error:', err);
        setError(err.message || "Terjadi kesalahan saat menghubungi layanan AI.");
      }
    } finally {
      setIsStreaming(false);
    }
  }, [inputValue, isStreaming, messages, portfolioState, portfolioContext, marketData, setMessages]);

  const handleLocalSubmit = useCallback((text) => {
    if (text.trim() === '') return;
    handleSend(text);
  }, [handleSend]);

  // Detect which AI provider is active for the status badge
  const providerLabel = useMemo(() => {
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) return 'Claude';
    if (import.meta.env.VITE_OPENAI_API_KEY) return 'GPT-4o';
    if (import.meta.env.VITE_GEMINI_API_KEY) return 'Gemini';
    return 'Offline';
  }, []);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-screen w-[90%] md:w-[400px] z-50
                    backdrop-blur-2xl border-l shadow-2xl flex flex-col
                    transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: 'var(--as-bg-secondary)',
          borderColor: 'var(--as-border-primary)',
        }}
      >
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
              AlphaShield Quant Copilot
            </h2>
            {/* Provider badge */}
            <span
              className="text-[8px] font-mono px-1.5 py-0.5 rounded-md
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">

          {/* Suggested questions — show when no user messages yet */}
          {messages.filter(m => m.role === 'user').length === 0 && !isStreaming && (
            <div className="space-y-2 mb-4">
              <div
                className="text-[9px] font-mono tracking-widest uppercase mb-2"
                style={{ color: 'var(--as-text-dim)' }}
              >
                PERTANYAAN DISARANKAN
              </div>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleLocalSubmit(q)}
                  className="w-full text-left text-[10px] font-mono px-3 py-2.5
                             rounded-xl cursor-pointer transition-all duration-150"
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
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            );
          })}

          {/* Streaming response — live text */}
          {isStreaming && streamText && (
            <div className="flex justify-start">
              <div
                className="border rounded-r-xl rounded-tl-xl p-3 text-sm
                           font-sans leading-relaxed max-w-[90%] shadow-sm"
                style={{
                  background: 'var(--as-bg-primary)',
                  borderColor: 'var(--as-border-primary)',
                  color: 'var(--as-text-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {streamText}
                <span
                  className="animate-pulse ml-0.5 inline-block w-0.5 h-3.5
                             align-middle rounded-full"
                  style={{ background: config.color }}
                />
              </div>
            </div>
          )}

          {/* Loading indicator — waiting for first chunk */}
          {isStreaming && !streamText && (
            <div className="flex justify-start">
              <div
                className="border rounded-r-xl rounded-tl-xl p-4 text-sm
                           font-sans leading-relaxed shadow-sm"
                style={{
                  background: 'var(--as-bg-primary)',
                  borderColor: 'var(--as-border-primary)',
                  color: 'var(--as-text-secondary)',
                }}
              >
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="animate-bounce inline-block w-1.5 h-1.5 rounded-full"
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
              className="mx-1 px-3 py-2 rounded-xl text-[10px] font-mono"
              style={{
                background: 'rgba(239,68,68,0.10)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              ⚠ {error}
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
                onClick={() => setInputValue(chipText)}
                className="text-[11px] px-3 py-1.5 rounded-full bg-indigo-900/20
                           text-indigo-300 border border-indigo-500/20 cursor-pointer
                           hover:bg-indigo-500/30 transition-colors whitespace-nowrap"
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
              placeholder={isStreaming ? "Menunggu respons..." : "Ketik pesan..."}
              className="bg-transparent border-none outline-none text-sm font-sans
                         w-full flex-1"
              style={{ color: 'var(--as-text-primary)' }}
              value={inputValue}
              disabled={isStreaming}
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
                if (inputValue.trim() !== '' && !isStreaming) {
                  handleLocalSubmit(inputValue);
                  setInputValue('');
                }
              }}
              className="transition-colors cursor-pointer"
              style={{
                color: isStreaming
                  ? 'var(--as-text-dim)'
                  : 'var(--as-text-secondary)',
              }}
              disabled={isStreaming}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
