import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import { Flame, Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import MacroIndicatorCards from "../components/MacroIndicatorCards";
import { ACCENT, ScenarioButton } from "../components/SharedComponents";
import { DataHealthPanel } from "../components/DataHealthPanel";
import { MacroInterpretationPanel } from "../components/MacroInterpretationPanel";
import { MacroReleaseCalendar } from "../components/MacroReleaseCalendar";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';

/**
 * MarketPage — "KONDISI PASAR" tab.
 * Scenario selector + MacroIndicatorCards + Interpretation + Calendar.
 */
export default function MarketPage() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const setScenario = useRootStore((s) => s.setScenario);
  const crisisMode = useRootStore((s) => s.crisisMode);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  return (
    <div className="space-y-10 w-full page-enter">
      <ScenarioIntelligence />
      {/* Data Health Panel — per-endpoint status */}
      <DataHealthPanel />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-neutral-900 pb-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          KONDISI PASAR
          <span className="text-gray-600 mx-3 font-light">//</span>
          <span style={{ color: acc.neon }}>MAKROEKONOMI</span>
        </h2>
        <p className="text-[10px] font-sans text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider">
          Indikator Ekonomi Indonesia &amp; Global — Simulasi Data Live
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scenario Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-xl p-6">
            <div className="text-[9px] text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-3 font-sans">
              Skenario Ekonomi
            </div>
            <div className="space-y-3">
              {Object.values(SCENARIOS)
                .filter(sc => sc.theme !== 'Stress Test')
                .map((sc) => (
                <ScenarioButton
                  key={sc.id}
                  scenario={sc}
                  isActive={scenarioId === sc.id}
                  onClick={() => setScenario(sc.id)}
                 />
              ))}
            </div>
          </div>

          {/* Black Swan Panel */}
          <div className="border border-red-950 bg-red-950/5 rounded-xl p-6 space-y-4">
            <div className="text-[9px] text-red-500 uppercase tracking-widest font-bold font-sans">
              Stress Test Ekstrem
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScenario('HIPERINFLASI')}
                className={`p-3.5 md:p-2 min-h-[44px] md:min-h-0 rounded border text-[10px] flex items-center justify-center gap-2 font-bold cursor-pointer transition-colors font-sans ${
                  scenarioId === "HIPERINFLASI"
                    ? "bg-red-900/40 border-red-500 text-white"
                    : "border-slate-200 dark:border-neutral-900 text-slate-400 dark:text-neutral-500 hover:bg-red-950/40 hover:border-red-500/50"
                }`}
              >
                <Flame size={16} className="text-red-500 shrink-0" /> HIPERINFLASI
              </button>
              <button
                onClick={() => setScenario('RUPIAH_CRASH')}
                className={`p-3.5 md:p-2 min-h-[44px] md:min-h-0 rounded border text-[10px] flex items-center justify-center gap-2 font-bold cursor-pointer transition-colors font-sans ${
                  scenarioId === "RUPIAH_CRASH"
                    ? "bg-amber-900/40 border-amber-500 text-white"
                    : "border-slate-200 dark:border-neutral-900 text-slate-400 dark:text-neutral-500 hover:bg-amber-950/40 hover:border-amber-500/50"
                }`}
              >
                <AlertTriangle size={16} className="text-amber-500 shrink-0" /> RUPIAH CRASH
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <MacroIndicatorCards />
        </div>
      </div>

      {/* Macro Interpretation Panel — below indicators */}
      <MacroInterpretationPanel />

      {/* Release Calendar */}
      <MacroReleaseCalendar />
    </div>
  );
}
