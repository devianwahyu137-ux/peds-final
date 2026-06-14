import { Sparkles, Bot, Send } from "lucide-react";
import { useRootStore, SCENARIOS } from '@/stores/rootStore';
import { ACCENT } from './SharedComponents';

export default function FloatingCopilotTrigger({ onOpen, onSuggestionClick, inputValue, setInputValue, onSubmit, isVisible }) {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const crisisMode = useRootStore((s) => s.crisisMode);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  return (
    <div 
      className={`fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px)+12px)] md:bottom-12 left-1/2 -translate-x-1/2 w-[88%] md:w-[90%] max-w-xl z-[45] bg-black rounded-full border px-4 md:px-5 py-2 md:py-2.5 flex flex-row items-center gap-2 md:gap-3 transition-all duration-500 animate-pulse ${
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ boxShadow: `0 0 30px -5px ${acc.neon || '#f59e0b'}`, borderColor: `${acc.neon || '#f59e0b'}80` }}
    >
      {/* Bot/User Avatar Icon */}
      <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
        <Sparkles size={12} className="text-indigo-400" />
      </div>

      {/* Input Element */}
      <input 
        type="text" 
        placeholder="Apa yang ada di benak Anda?" 
        className="bg-transparent border-none outline-none text-sm w-full text-neutral-200 placeholder-neutral-500 flex-1 cursor-pointer"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={onOpen}
        onKeyDown={(e) => { 
          if (e.key === 'Enter' && e.target.value.trim() !== '') { 
            onSubmit(e.target.value); 
            setInputValue(''); 
          } 
        }}
      />

      {/* Send Icon */}
      <button 
        onClick={() => {
          if (inputValue.trim() !== '') {
            onSubmit(inputValue);
            setInputValue('');
          } else {
            onOpen();
          }
        }}
        className="text-neutral-400 hover:text-indigo-400 transition-colors shrink-0"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
