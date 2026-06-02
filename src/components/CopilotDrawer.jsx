import { useState, useRef, useEffect, useMemo } from "react";
import { X, Sparkles, Send } from "lucide-react";
import { buildPortfolioContext, buildSuggestedQuestions } from '@/lib/portfolioContextBuilder';
import { useRootStore } from '@/stores/rootStore';

// ── MOCK QUANT ENGINE ─────────────────────────────────────────
function generateMockResponse(input) {
  const lowerInput = input.toLowerCase();

  // Scenario A (Macro/Interest Rates)
  if (
    lowerInput.includes("makro") ||
    lowerInput.includes("suku bunga") ||
    lowerInput.includes("bi rate") ||
    lowerInput.includes("yield") ||
    lowerInput.includes("dampak")
  ) {
    return `<div class="space-y-3"><p><strong>Analisis Makroekonomi Terkini:</strong></p><p>Suku bunga acuan saat ini tertahan di 5.25%. Kami mendeteksi adanya inversi pada <em>Sovereign Yield Curve</em> yang mengindikasikan likuiditas ketat. Capital outflow ke instrumen DXY memberikan tekanan pada nilai tukar.</p><p><strong>Rekomendasi:</strong> Pertahankan durasi portofolio obligasi di bawah 3 tahun untuk memitigasi risiko suku bunga.</p></div>`;
  }
  
  // Scenario B (Portfolio/Evaluation)
  if (
    lowerInput.includes("evaluasi") ||
    lowerInput.includes("portofolio") ||
    lowerInput.includes("risiko") ||
    lowerInput.includes("status") ||
    lowerInput.includes("sharpe") ||
    lowerInput.includes("alokasi")
  ) {
    return `<div class="space-y-3"><p><strong>Evaluasi Portofolio:</strong></p><p>Berdasarkan MPT Engine, Sharpe Ratio Anda mencerminkan tingkat efisiensi alokasi saat ini. Volatilitas dan Beta menunjukkan eksposur terhadap pasar.</p><p>Saran strategis: Selaraskan komposisi SBN dan Emas Fisik sesuai <em>target weights</em> dari skenario aktif untuk menjaga resiliensi.</p></div>`;
  }

  // Scenario C (Rotation/Rebalancing)
  if (
    lowerInput.includes("rotasi") ||
    lowerInput.includes("rebalancing") ||
    lowerInput.includes("sektor") ||
    lowerInput.includes("saham") ||
    lowerInput.includes("bbca") ||
    lowerInput.includes("emas")
  ) {
    return `<div class="space-y-3"><p><strong>Simulasi Rotasi Sektor:</strong></p><p>Mengingat fase pengetatan dan tekanan <em>cost of funds</em>, rotasi sektoral direkomendasikan.</p><ul><li class="ml-4 list-disc"><strong>Kurangi:</strong> Ekuitas siklikal dan perusahaan dengan <em>leverage</em> tinggi.</li><li class="ml-4 list-disc"><strong>Tambah:</strong> Sektor defensif, kas USD, dan instrumen SBN tenor pendek.</li></ul></div>`;
  }

  // Default Scenario
  return `<div class="space-y-3"><p>Sistem menerima instruksi Anda.</p><p>Berdasarkan data <em>Modern Portfolio Theory (MPT)</em>, alokasi Anda telah dievaluasi terhadap volatilitas makro terkini. Pastikan bobot portofolio tetap disiplin sesuai batas toleransi <em>drift</em>.</p></div>`;
}

export default function CopilotDrawer({ isOpen, onClose, messages, setMessages }) {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scenarioId  = useRootStore((s) => s.scenarioId);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const liveData    = useRootStore((s) => s.liveData);

  // Build context (memoized — only rebuilds when state changes):
  const portfolioContext = useMemo(
    () => buildPortfolioContext({ scenarioId, weights, analytics, macroInputs, liveData }),
    [scenarioId, weights, analytics, macroInputs, liveData]
  );

  // Build dynamic suggested questions:
  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(scenarioId, analytics),
    [scenarioId, analytics]
  );

  // Auto-scroll to bottom when messages change, isTyping changes, or drawer opens
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Sync Kapsul submissions to trigger mock engine if the last message is from user and we aren't typing
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user' && !isTyping && lastMsg.content && !lastMsg.fetched) {
       // Mark it so we don't refetch
       const updatedMessages = [...messages];
       updatedMessages[updatedMessages.length - 1].fetched = true;
       setMessages(updatedMessages);
       handleSimulation(lastMsg.content);
    }
  }, [messages, isTyping]);

  const handleSimulation = (userText) => {
    setIsTyping(true);
    
    // In a real API call, inject as system message:
    const messagesWithContext = [
      { role: 'system', content: portfolioContext },
      ...messages,
      { role: 'user', content: userText },
    ];
    // console.log("Payload to AI:", messagesWithContext);

    // Simulate network delay for high-fidelity realism (2000ms)
    setTimeout(() => {
      const mockHtml = generateMockResponse(userText);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: mockHtml }
      ]);
      setIsTyping(false);
    }, 2000);
  };

  const handleLocalSubmit = (text) => {
    if (text.trim() === '') return;
    
    const newUserMsg = { role: 'user', content: text, fetched: true };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    
    handleSimulation(text);
  };

  return (
    <>
      {/* Optional Backdrop for mobile clicks outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Container (Glassmorphism integration) */}
      <div 
        className={`fixed top-0 right-0 h-screen w-[90%] md:w-[400px] z-50 backdrop-blur-2xl border-l shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: 'var(--as-bg-secondary)', borderColor: 'var(--as-border-primary)' }}
      >
        {/* Header & Close Button */}
        <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--as-border-primary)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold tracking-wide font-sans" style={{ color: 'var(--as-text-primary)' }}>
              AlphaShield Quant Copilot
            </h2>
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={
                  msg.role === 'user'
                    ? "rounded-l-xl rounded-tr-xl p-3 text-sm font-sans leading-relaxed max-w-[85%] shadow-sm"
                    : "border rounded-r-xl rounded-tl-xl p-3 text-sm font-sans leading-relaxed max-w-[90%] shadow-sm"
                }
                style={
                  msg.role === 'user'
                    ? { background: 'var(--as-bg-tertiary)', color: 'var(--as-text-primary)' }
                    : { background: 'var(--as-bg-primary)', borderColor: 'var(--as-border-primary)', color: 'var(--as-text-primary)' }
                }
              >
                {msg.role === 'ai' ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Typing Loading State */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="border rounded-r-xl rounded-tl-xl p-4 text-sm font-sans leading-relaxed shadow-sm"
                   style={{ background: 'var(--as-bg-primary)', borderColor: 'var(--as-border-primary)', color: 'var(--as-text-secondary)' }}>
                <div className="flex gap-1 items-center">
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-indigo-400/80 rounded-full" style={{ animationDelay: '0s' }}></span>
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-indigo-400/80 rounded-full" style={{ animationDelay: '0.15s' }}></span>
                  <span className="animate-bounce inline-block w-1.5 h-1.5 bg-indigo-400/80 rounded-full" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Dedicated Chat Input fixed at bottom */}
        <div className="p-4 border-t shrink-0 bg-transparent" style={{ borderColor: 'var(--as-border-primary)' }}>
          
          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 px-2 w-full">
            {suggestedQuestions.map((chipText, idx) => (
              <button
                key={idx}
                onClick={() => setInputValue(chipText)}
                className="text-[11px] px-3 py-1.5 rounded-full bg-indigo-900/20 text-indigo-300 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/30 transition-colors whitespace-nowrap"
              >
                {chipText}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-3 py-2 backdrop-blur-md rounded-xl border focus-within:border-indigo-500/50 transition-colors"
               style={{ background: 'var(--as-bg-primary)', borderColor: 'var(--as-border-secondary)' }}>
            <input 
              type="text" 
              placeholder="Ketik pesan..." 
              className="bg-transparent border-none outline-none text-sm font-sans w-full flex-1"
              style={{ color: 'var(--as-text-primary)' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && e.target.value.trim() !== '') { 
                  handleLocalSubmit(e.target.value); 
                  setInputValue(''); 
                  e.target.value = ''; 
                } 
              }}
            />
            <button 
              onClick={() => {
                if (inputValue.trim() !== '') {
                  handleLocalSubmit(inputValue);
                  setInputValue('');
                }
              }}
              className="transition-colors cursor-pointer"
              style={{ color: 'var(--as-text-secondary)' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
