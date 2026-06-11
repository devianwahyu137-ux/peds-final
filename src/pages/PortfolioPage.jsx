import { useState, useEffect } from "react";
import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import {
  ACCENT,
  AllocationRow,
  DonutChart,
  MetricWithContext,
  getSharpeInterpretation,
  getBetaInterpretation,
  getMddInterpretation,
  getVolInterpretation,
} from "../components/SharedComponents";
import { PortfolioStoryPanel, PortfolioWhatIfSimulator } from "../components/PortfolioStoryPanel";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';
import { PortfolioComparison } from '@/components/PortfolioComparison';
import { PortfolioHealthScore } from '@/components/PortfolioHealthScore';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { ExportMenu } from '@/components/ExportMenu';
import { AlertTriangle, Landmark, TrendingUp, Briefcase, Shield, DollarSign } from "lucide-react";

function LedgerRow({ line }) {
  const match = line.match(/^\[(.*?)\]\s+([A-Z_]+)\s+:\s+(.*)$/);
  if (!match) {
    return (
      <div className="border-l-2 border-[var(--as-border-secondary)] pl-3 text-slate-500 dark:text-neutral-400 font-light">
        {line}
      </div>
    );
  }

  const [_, emoji, key, text] = match;
  
  let Icon = AlertTriangle;
  let iconClass = "text-amber-500 mt-0.5 shrink-0";
  
  if (key === 'DEBT_EXPOSURE') { Icon = AlertTriangle; iconClass = "text-amber-500 mt-0.5 shrink-0"; }
  else if (key === 'FIXED_INCOME') { Icon = Landmark; iconClass = "text-indigo-400 mt-0.5 shrink-0"; }
  else if (key === 'RISK_EQUITIES') { Icon = TrendingUp; iconClass = "text-blue-400 mt-0.5 shrink-0"; }
  else if (key === 'SOVEREIGN_BONDS') { Icon = Briefcase; iconClass = "text-purple-400 mt-0.5 shrink-0"; }
  else if (key === 'WEALTH_PRESERVATION') { Icon = Shield; iconClass = "text-red-500 mt-0.5 shrink-0"; }
  else if (key === 'FOREIGN_RESERVES') { Icon = DollarSign; iconClass = "text-emerald-500 mt-0.5 shrink-0"; }
  else { Icon = AlertTriangle; iconClass = "text-neutral-400 mt-0.5 shrink-0"; }

  const formattedKey = key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');

  return (
    <div className="flex items-start gap-3 border-l-2 border-[var(--as-border-secondary)] pl-3">
      <Icon size={16} className={iconClass} />
      <p className="text-sm text-neutral-400 font-light">
        <span className="font-semibold text-neutral-200">{formattedKey}</span> : {text}
      </p>
    </div>
  );
}

/**
 * PortfolioPage — "PORTOFOLIOMU" tab.
 * Content preserved from original Portfolio Matrix section.
 * Adds MetricWithContext for human-readable interpretations.
 */
export default function PortfolioPage() {
  const scenarioId      = useRootStore((s) => s.scenarioId);
  const crisisMode      = useRootStore((s) => s.crisisMode);
  const targetWeights   = useRootStore((s) => s.targetWeights || s.weights || {});
  const targetAnalytics = useRootStore((s) => s.targetAnalytics || s.analytics || {});

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const currentTheme = crisisMode ? "Crisis Mode" : baseScenario.theme;
  const acc = ACCENT[currentAccent] || ACCENT.emerald;

  const [hoveredAsset, setHoveredAsset] = useState(null);
  const [animPct, setAnimPct] = useState({ stocks: 0, bonds: 0, gold: 0, cash: 0 });
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    setIsComputing(true);
    const timer = setTimeout(() => setIsComputing(false), 450);
    return () => clearTimeout(timer);
  }, [scenarioId]);

  useEffect(() => {
    const handle = setTimeout(() => {
      setAnimPct({ ...targetWeights });
    }, 0);
    return () => clearTimeout(handle);
  }, [targetWeights]);

  return (
    <div className="space-y-6 w-full page-enter">
      <ScenarioIntelligence />
      {/* Header */}
      <div className="border-b border-[var(--as-border-secondary)] pb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">
            PORTOFOLIOMU
            <span className="text-gray-600 mx-3 font-light">//</span>
            <span style={{ color: acc.neon }}>ALOKASI ASET</span>
          </h2>
          <p className="text-[10px] font-mono font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
            Distribusi optimal berdasarkan skenario {scenarioId}
          </p>
        </div>
        <ExportMenu />
      </div>

      {/* ROW 1 (TOP SECTION) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Donut + Asset Bars */}
        <div className="xl:col-span-7 space-y-4">
          <div className="card-tier-2 overflow-visible h-full">
            <div className="text-[9px] text-[var(--as-text-dim)] font-semibold uppercase tracking-widest mb-4 font-mono">
              Asset Allocation Matrix
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <DonutChart
                accentColor={currentAccent}
                hovered={hoveredAsset}
                setHovered={setHoveredAsset}
                animPct={animPct}
                analytics={targetAnalytics}
                isComputing={isComputing}
              />
              <div className="flex-1 w-full space-y-3.5">
                <AllocationRow assetKey="stocks" pct={Math.round(targetWeights?.stocks ?? 0)} />
                <AllocationRow assetKey="bonds" pct={Math.round(targetWeights?.bonds ?? 0)} />
                <AllocationRow assetKey="gold" pct={Math.round(targetWeights?.gold ?? 0)} />
                <AllocationRow assetKey="cash" pct={Math.round(targetWeights?.cash ?? 0)} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: MPT Analytics with interpretations */}
        <div className="xl:col-span-5 space-y-4">
          <div className="card-tier-2 h-full">
            <div className="text-[9px] text-[var(--as-text-dim)] font-semibold uppercase tracking-widest mb-3 font-mono">
              Analisis <GlossaryTerm termId="mpt">MPT</GlossaryTerm> — dengan Interpretasi
            </div>
            {isComputing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="shimmer h-[98px] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 [&>*]:stat-hover">
                <MetricWithContext
                  label="Sharpe Ratio"
                  value={(targetAnalytics?.sharpeRatio ?? targetAnalytics?.sharpe ?? 0).toFixed(2)}
                  unit=" σ"
                  interpretation={getSharpeInterpretation(targetAnalytics?.sharpeRatio ?? targetAnalytics?.sharpe ?? 0)}
                  color={acc.neon}
                />
                <MetricWithContext
                  label="Portfolio Beta"
                  value={(targetAnalytics?.portfolioBeta ?? targetAnalytics?.beta ?? 0).toFixed(2)}
                  unit=" β"
                  interpretation={getBetaInterpretation(targetAnalytics?.portfolioBeta ?? targetAnalytics?.beta ?? 0)}
                  color="#a78bfa"
                />
                <MetricWithContext
                  label="Max Drawdown"
                  value={((targetAnalytics?.maxDrawdown ?? targetAnalytics?.estimatedMaxDrawdown ?? 0) * 100).toFixed(1)}
                  unit="%"
                  interpretation={getMddInterpretation(targetAnalytics?.maxDrawdown ?? targetAnalytics?.estimatedMaxDrawdown ?? 0)}
                  color="#ef4444"
                />
                <MetricWithContext
                  label="Volatilitas"
                  value={((targetAnalytics?.portfolioVolatility ?? targetAnalytics?.portfolioStdDev ?? 0) * 100).toFixed(1)}
                  unit="%"
                  interpretation={getVolInterpretation(targetAnalytics?.portfolioVolatility ?? targetAnalytics?.portfolioStdDev ?? 0)}
                  color="var(--as-text-secondary)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2 (BOTTOM SECTION - THE ALIGNMENT FIX) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Side: Ledger + What If */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Technical Execution Ledger */}
          <div className="card-tier-3 font-mono text-[11px] space-y-2">
            <div className="text-[9px] text-[var(--as-text-dim)] font-semibold uppercase tracking-widest mb-1">
              Technical Execution Ledger
            </div>
            {baseScenario.ledger.map((ledgerLine, ledgerIndex) => (
              <LedgerRow key={ledgerIndex} line={ledgerLine} />
            ))}
          </div>
          
          {/* Simulasi What-If (Relocated here) */}
          <PortfolioWhatIfSimulator />
        </div>

        {/* Right Side: Tema Risiko + Narasi */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Risk Theme badge */}
          <div className="card-tier-3 flex flex-col items-center text-center">
            <span className="text-[8px] text-[var(--as-text-dim)] font-semibold uppercase font-mono tracking-widest">
              Tema Risiko Aktif
            </span>
            <span
              className="text-sm font-black mt-2 uppercase font-mono"
              style={{ color: acc.neon }}
            >
              {currentTheme}
            </span>
            <span className="text-[9px] text-[var(--as-text-tertiary)] font-light mt-1 font-mono">
              Skenario: {scenarioId}
            </span>
          </div>

          {/* Portfolio Story — narrative panel */}
          <PortfolioStoryPanel />
        </div>
      </div>

      <PortfolioComparison />

      {/* Portfolio Health Score — composite risk gauge */}
      <PortfolioHealthScore />
    </div>
  );
}
