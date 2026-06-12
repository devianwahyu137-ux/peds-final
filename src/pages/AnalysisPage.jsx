import SovereignYieldCurve from "../components/SovereignYieldCurve";
import MacroNewsCards from "../components/MacroNewsCards";
import { MacroSentimentSummary } from "../components/MacroSentimentSummary";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';
import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import { ACCENT } from "../components/SharedComponents";
import { lazy, Suspense } from 'react';

const MonteCarloPanel = lazy(() => import("../components/EfficientFrontier/MonteCarloPanel").then(m => ({ default: m.MonteCarloPanel })));
const HistoricalBacktest = lazy(() => import("@/components/HistoricalBacktest").then(m => ({ default: m.HistoricalBacktest })));

function ShimmerSkeleton({ heightClass = "h-[300px]", title = "MENGHITUNG SIMULASI..." }) {
  return (
    <div className="w-full bg-slate-100/30 dark:bg-[var(--as-bg-secondary)] border border-slate-200 dark:border-neutral-900 rounded-xl p-6 space-y-4 overflow-hidden relative transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-48 bg-slate-200/50 dark:bg-neutral-800/50 rounded animate-pulse" />
        </div>
        <div className="h-6 w-20 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className={`w-full ${heightClass} rounded-lg shimmer`} />
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 w-24 bg-slate-200/50 dark:bg-neutral-800/50 rounded animate-pulse" />
        <div className="h-3 w-36 bg-slate-200/50 dark:bg-neutral-800/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

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
    <div className="space-y-10 w-full page-enter">
      <ScenarioIntelligence />
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-neutral-900 pb-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">
          ANALISIS
          <span className="text-gray-600 mx-3 font-light">//</span>
          <span style={{ color: acc.neon }}>RISET &amp; BERITA</span>
        </h2>
        <p className="text-[10px] font-sans text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider">
          Yield curve sovereign, korelasi makro, dan sentimen pasar
        </p>
      </div>

      {/* Macro Sentiment Summary — above yield curve */}
      <MacroSentimentSummary />

      <SovereignYieldCurve />
      <MacroNewsCards />

      {/* Historical Backtesting Snapshot */}
      <Suspense fallback={<ShimmerSkeleton heightClass="h-[300px]" title="MEMUAT BACKTEST SEJARAH..." />}>
        <HistoricalBacktest />
      </Suspense>

      {/* Monte Carlo Simulation Engine */}
      <Suspense fallback={<ShimmerSkeleton heightClass="h-[400px]" title="MEMUAT MESIN SIMULASI MONTE CARLO..." />}>
        <MonteCarloPanel />
      </Suspense>
    </div>
  );
}
