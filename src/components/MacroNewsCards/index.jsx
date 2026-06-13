import { useRootStore } from "../../stores/rootStore";
import { MACRO_RESEARCH_NOTES } from "../../lib/dummyNewsData";
import NewsCard from "./NewsCard";

/**
 * MacroNewsCards — Panel displaying scenario-specific Macro Research Notes.
 * Automatically aligns with the active environment selected in rootStore.
 */
export default function MacroNewsCards() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const crisisMode = useRootStore((s) => s.crisisMode);

  const effectiveScenario = crisisMode
    ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
    : scenarioId;

  const notes = MACRO_RESEARCH_NOTES[effectiveScenario] || [];

  return (
    <div className="card-tier-2 mt-6 font-mono">
      {/* Section Header with Honest Labeling */}
      <div className="flex items-center justify-between border-b border-slate-300 dark:border-neutral-800/50 pb-3 mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 uppercase">
            CATATAN RISET MAKRO // INSIGHT SKENARIO
          </div>
          <div className="text-[8px] text-neutral-500 font-sans uppercase mt-0.5 tracking-wider">
            INTERPRETASI EDUKATIF · BUKAN BERITA · DISUSUN OLEH MODEL ALPHASHIELD
          </div>
        </div>
        <div className="text-[8px] px-2.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-500 uppercase font-mono tracking-widest font-bold">
          EDUKASI
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-6 text-xs text-neutral-600">
          Tidak ada catatan riset untuk skenario ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((item, index) => (
            <NewsCard key={index} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

