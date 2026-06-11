import { Sparkles, Bot } from "lucide-react";

export default function FloatingCopilotTrigger({ onOpen, onSuggestionClick, inputValue, setInputValue, onSubmit, isVisible }) {
  const suggestions = [
    "Evaluasi Efisiensi Portofolio",
    "Dampak Suku Bunga",
    "Simulasi Rotasi Sektor"
  ];

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-3 w-[90%] md:w-[600px] flex flex-col gap-3 shadow-2xl bg-[#121212]/80 backdrop-blur-md border border-white/10 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Suggestion Chips */}
      <div className="overflow-x-auto scrollbar-hide flex items-center gap-2">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestionClick(text)}
            className="text-xs px-3.5 py-2.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            {text}
          </button>
        ))}
      </div>      {/* Input Mockup */}
      <div className="flex items-center gap-3 px-2">
        <Sparkles size={18} className="text-indigo-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Tanyakan analisis kuantitatif..." 
          className="bg-transparent border-none outline-none text-sm w-full text-neutral-200 placeholder-neutral-500 flex-1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={onOpen}
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && e.target.value.trim() !== '') { 
              onSubmit(e.target.value); 
              setInputValue(''); 
              e.target.value = ''; 
            } 
          }}
        />
      </div>
      
    </div>
  );
}
