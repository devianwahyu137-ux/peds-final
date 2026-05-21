import { useState, useEffect } from "react";
import { useDataStore, SCENARIOS } from "../stores/alphaShieldStore";
import {
  ACCENT,
  ASSET_CONFIG,
  AllocationRow,
  DonutChart,
  MetricWithContext,
  getSharpeInterpretation,
  getBetaInterpretation,
  getMddInterpretation,
  getVolInterpretation,
} from "../components/SharedComponents";

/**
 * PortfolioPage — "PORTOFOLIOMU" tab.
 * Content preserved from original Portfolio Matrix section.
 * Adds MetricWithContext for human-readable interpretations.
 */
export default function PortfolioPage() {
  const scenarioId      = useDataStore((s) => s.scenarioId);
  const crisisMode      = useDataStore((s) => s.crisisMode);
  const targetWeights   = useDataStore((s) => s.targetWeights);
  const targetAnalytics = useDataStore((s) => s.targetAnalytics);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  const currentTheme = crisisMode ? "Crisis Mode" : baseScenario.theme;
  const acc = ACCENT[currentAccent];

  const [hoveredAsset, setHoveredAsset] = useState(null);
  const [animPct, setAnimPct] = useState({ stocks: 0, bonds: 0, gold: 0, cash: 0 });

  useEffect(() => {
    const handle = setTimeout(() => {
      setAnimPct({ ...targetWeights });
    }, 0);
    return () => clearTimeout(handle);
  }, [targetWeights]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-4">
        <h1 className="text-lg font-black font-mono uppercase tracking-tight">
          Portofoliomu <span style={{ color: acc.neon }}>// Alokasi Aset</span>
        </h1>
        <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase tracking-wider">
          Distribusi optimal berdasarkan skenario {scenarioId}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Donut + Asset Bars */}
        <div className="xl:col-span-7 space-y-4">
          <div className="glass-card rounded-xl p-5 overflow-visible">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-4 font-mono">
              Asset Allocation Matrix
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <DonutChart
                accentColor={currentAccent}
                hovered={hoveredAsset}
                setHovered={setHoveredAsset}
                animPct={animPct}
                analytics={targetAnalytics}
              />
              <div className="flex-1 w-full space-y-3.5">
                <AllocationRow assetKey="stocks" pct={Math.round(targetWeights.stocks)} />
                <AllocationRow assetKey="bonds" pct={Math.round(targetWeights.bonds)} />
                <AllocationRow assetKey="gold" pct={Math.round(targetWeights.gold)} />
                <AllocationRow assetKey="cash" pct={Math.round(targetWeights.cash)} />
              </div>
            </div>
          </div>

          {/* Technical Execution Ledger */}
          <div className="glass-card rounded-xl p-4 font-mono text-[11px] space-y-2">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">
              Technical Execution Ledger
            </div>
            {baseScenario.ledger.map((ledgerLine, ledgerIndex) => (
              <div key={ledgerIndex} className="border-l-2 border-neutral-800 pl-3 text-neutral-400">
                {ledgerLine}
              </div>
            ))}
          </div>
        </div>

        {/* Right: MPT Analytics with interpretations */}
        <div className="xl:col-span-5 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              Analisis MPT — dengan Interpretasi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MetricWithContext
                label="Sharpe Ratio"
                value={targetAnalytics.sharpeRatio.toFixed(2)}
                unit=" σ"
                interpretation={getSharpeInterpretation(targetAnalytics.sharpeRatio)}
                color={acc.neon}
              />
              <MetricWithContext
                label="Portfolio Beta"
                value={targetAnalytics.portfolioBeta.toFixed(2)}
                unit=" β"
                interpretation={getBetaInterpretation(targetAnalytics.portfolioBeta)}
                color="#a78bfa"
              />
              <MetricWithContext
                label="Max Drawdown"
                value={(targetAnalytics.maxDrawdown * 100).toFixed(1)}
                unit="%"
                interpretation={getMddInterpretation(targetAnalytics.maxDrawdown)}
                color="#ef4444"
              />
              <MetricWithContext
                label="Volatilitas"
                value={(targetAnalytics.portfolioVolatility * 100).toFixed(1)}
                unit="%"
                interpretation={getVolInterpretation(targetAnalytics.portfolioVolatility)}
                color="#a3a3a3"
              />
            </div>
          </div>

          {/* Risk Theme badge */}
          <div className="glass-card rounded-xl p-4 flex flex-col items-center text-center">
            <span className="text-[8px] text-neutral-600 uppercase font-mono tracking-widest">
              Tema Risiko Aktif
            </span>
            <span
              className="text-sm font-black mt-2 uppercase font-mono"
              style={{ color: acc.neon }}
            >
              {currentTheme}
            </span>
            <span className="text-[9px] text-neutral-600 mt-1 font-mono">
              Skenario: {scenarioId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
