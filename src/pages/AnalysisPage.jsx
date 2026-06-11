import SovereignYieldCurve from "../components/SovereignYieldCurve";
import MacroNewsCards from "../components/MacroNewsCards";
import { MonteCarloPanel } from "../components/EfficientFrontier/MonteCarloPanel";
import { HistoricalBacktest } from '@/components/HistoricalBacktest';
import { MacroSentimentSummary } from "../components/MacroSentimentSummary";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';
import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import { ACCENT } from "../components/SharedComponents";

/**
 * AnalysisPage — "ANALISIS" tab.
 * Combines yield curve, correlation matrix, sentiment, news, and Monte Carlo.
 */
export default function AnalysisPage() {
  const scenarioId  = useRootStore((s) => s.scenarioId);
  const crisisMode  = useRootStore((s) => s.crisisMode);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  return (
    <div className="space-y-6 w-full page-enter">
      <ScenarioIntelligence />
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-neutral-900 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          ANALISIS
          <span className="text-gray-600 mx-3 font-light">//</span>
          <span style={{ color: acc.neon }}>RISET &amp; BERITA</span>
        </h2>
        <p className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider">
          Yield curve sovereign, korelasi makro, dan sentimen pasar
        </p>
      </div>

      {/* Macro Sentiment Summary — above yield curve */}
      <MacroSentimentSummary />

      <SovereignYieldCurve />
      <MacroNewsCards />

      {/* Historical Backtesting Snapshot */}
      <HistoricalBacktest />

      {/* Monte Carlo Simulation Engine */}
      <MonteCarloPanel />
    </div>
  );
}
