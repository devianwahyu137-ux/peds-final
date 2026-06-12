import React from "react";
import { Landmark, LineChart, Coins, Wallet, TrendingUp } from "lucide-react";
import { useRootStore } from "@/stores/rootStore";
import { formatNumber } from "@/utils/format";

const ASSET_CONFIG = {
  stocks: { label: "Equities (IDX)", icon: <TrendingUp size={16} className="text-emerald-400" />, color: "#3b82f6" },
  bonds: { label: "SBN / Bonds", icon: <Landmark size={16} className="text-indigo-400" />, color: "#a78bfa" },
  gold: { label: "Physical Gold", icon: <Coins size={16} className="text-amber-400" />, color: "#fbbf24" },
  cash: { label: "Cash / Liquidity", icon: <Wallet size={16} className="text-emerald-400" />, color: "#34d399" }
};

const DriftMonitor = React.memo(function DriftMonitor() {
  const { targetWeights, weights, actualWeights } = useRootStore();
  const currentTargetWeights = targetWeights || weights || {};
  const currentActualWeights = actualWeights || currentTargetWeights; // Fallback if actualWeights is undefined
  const assets = ["stocks", "bonds", "gold", "cash"];

  return (
    <div className="card-tier-2 space-y-4 transition-colors duration-300">
      <div>
        <div className="flex items-center gap-2 text-[var(--as-text-primary)]">
          <LineChart size={18} className="text-blue-400" />
          <span className="font-bold tracking-wide text-sm uppercase">Drift Monitor Core</span>
        </div>
        <p className="text-[10px] font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">
          Comparing actual weights vs target baseline weights
        </p>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => {
          const target = currentTargetWeights?.[asset] ?? 0;
          const actual = currentActualWeights?.[asset] ?? 0;
          const delta = actual - target;
          const cfg = ASSET_CONFIG[asset];

          const absDrift = Math.abs(delta);
          let statusLabel = "ALIGNMENT_OK";
          let statusStyle = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
          
          if (absDrift >= 10.0) {
            statusLabel = "CRITICAL";
            statusStyle = "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20";
          } else if (absDrift >= 5.0) {
            statusLabel = "WARNING";
            statusStyle = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
          }

          const driftColor = delta === 0 ? "text-slate-500 dark:text-neutral-500" : delta > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
          const driftSign = delta > 0 ? "+" : "";

          // Center-Zero Gauge logic
          const fillWidth = Math.min(Math.abs(delta) / 25 * 50, 50);
          const isUnder = delta < 0;
          
          return (
            <div key={asset} className="card-tier-3 space-y-3 font-sans transition-colors duration-300">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span className="font-semibold text-[var(--as-text-secondary)] text-[11px] font-sans">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase font-sans ${statusStyle}`}>{statusLabel}</span>
                  <span className={`font-bold text-[11px] font-mono tabular-nums ${driftColor}`}>{driftSign}{formatNumber(delta, 1)}%</span>
                </div>
              </div>

              {/* Zero-Centered Gauge */}
              <div>
                <div className="relative w-full h-2 bg-neutral-800/60 rounded-full mt-2 mb-1 overflow-hidden">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-neutral-500 z-10 -translate-x-1/2" />
                  <div
                    className={`absolute top-0 bottom-0 transition-all duration-500 ${isUnder ? "bg-orange-500/80" : "bg-emerald-500/80"}`}
                    style={isUnder ? { right: '50%', width: `${fillWidth}%` } : { left: '50%', width: `${fillWidth}%` }}
                  />
                </div>
                <div className="flex justify-between items-center w-full text-[10px] font-sans text-neutral-500 uppercase tracking-wider">
                  <span>-25% Under</span>
                  <span>Target</span>
                  <span>+25% Over</span>
                </div>
              </div>

              {/* Explicit Numerical Details */}
              <div className="flex justify-between text-[9px] font-light text-[var(--as-text-tertiary)] border-t border-[var(--as-border-secondary)] pt-2 font-sans">
                <span>ACTUAL: <strong className="text-[var(--as-text-primary)] font-bold font-mono tabular-nums">{formatNumber(actual, 1)}%</strong></span>
                <span>TARGET: <strong className="text-[var(--as-text-secondary)] font-bold font-mono tabular-nums">{formatNumber(target, 1)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DriftMonitor;
