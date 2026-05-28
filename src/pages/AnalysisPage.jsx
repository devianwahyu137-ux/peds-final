import SovereignYieldCurve from "../components/SovereignYieldCurve";
import MacroNewsCards from "../components/MacroNewsCards";
import { MonteCarloPanel } from "../components/EfficientFrontier/MonteCarloPanel";

/**
 * AnalysisPage — "ANALISIS" tab.
 * Combines yield curve, correlation matrix, news feed, and Monte Carlo simulation.
 * Content preserved — only wrapper added.
 */
export default function AnalysisPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Analisis <span className="text-emerald-400">// Riset & Berita</span>
        </h1>
        <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
          Yield curve sovereign, korelasi makro, dan sentimen pasar
        </p>
      </div>

      <SovereignYieldCurve />
      <MacroNewsCards />

      {/* Monte Carlo Simulation Engine */}
      <MonteCarloPanel />
    </div>
  );
}
