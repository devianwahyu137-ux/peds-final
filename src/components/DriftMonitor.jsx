import React from "react";
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore } from "@/stores/rootStore";

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
        <div className="flex items-center gap-2 text-[var(--as-text-primary)]"><LineChart size={18} className="text-blue-400" /><span className="font-bold tracking-wide text-sm uppercase">Drift Monitor Core</span></div>
        <p className="text-[10px] font-light text-[var(--as-text-tertiary)] mt-1 uppercase tracking-widest">Comparing actual weights vs target baseline weights</p>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => {
          const target = currentTargetWeights?.[asset] ?? 0;
          const actual = currentActualWeights?.[asset] ?? 0;
          const drift = actual - target;
          const cfg = ASSET_CONFIG[asset];

          const absDrift = Math.abs(drift);
          let statusLabel = "ALIGNMENT_OK";
          let statusStyle = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
          
          if (absDrift >= 10.0) {
            statusLabel = "CRITICAL";
            statusStyle = "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20";
          } else if (absDrift >= 5.0) {
            statusLabel = "WARNING";
            statusStyle = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
          }

          const driftColor = drift === 0 ? "text-slate-500 dark:text-neutral-500" : drift > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
          const driftSign = drift > 0 ? "+" : "";

          // Zero-centered alignment calculations (scaled to +/- 25% max visual limits)
          const scaleLimit = 25;
          const scaledPercent = Math.max(-100, Math.min(100, (drift / scaleLimit) * 50)); // -50% to +50% range relative to center (50%)
          
          return (
            <div key={asset} className="card-tier-3 space-y-3 font-mono transition-colors duration-300">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span className="font-semibold text-[var(--as-text-secondary)] text-[11px]">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase ${statusStyle}`}>{statusLabel}</span>
                  <span className={`font-bold text-[11px] ${driftColor}`}>{driftSign}{drift.toFixed(1)}%</span>
                </div>
              </div>

              {/* Zero-Centered Divergence Velocity Bar */}
              <div className="space-y-1">
                <div className="relative h-2 w-full bg-[var(--as-bg-secondary)] rounded-full overflow-hidden border border-[var(--as-border-primary)] shadow-inner">
                  {/* Anchor Center Zero-line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--as-border-divider)] z-10" />
                  
                  {/* Left or Right Divergence fill */}
                  <div
                    className={`absolute top-0 bottom-0 transition-all duration-500 ${
                      drift > 0 ? "bg-emerald-500/80" : "bg-red-500/80"
                    }`}
                    style={{
                      left: drift > 0 ? "50%" : `${50 + scaledPercent}%`,
                      width: `${Math.abs(scaledPercent)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[7px] text-[var(--as-text-dim)] font-semibold px-1 uppercase tracking-widest">
                  <span>-25% Under</span>
                  <span>Target Alignment</span>
                  <span>+25% Over</span>
                </div>
              </div>

              {/* Explicit Numerical Details */}
              <div className="flex justify-between text-[9px] font-light text-[var(--as-text-tertiary)] border-t border-[var(--as-border-secondary)] pt-2">
                <span>ACTUAL: <strong className="text-[var(--as-text-primary)] font-bold">{actual.toFixed(1)}%</strong></span>
                <span>TARGET: <strong className="text-[var(--as-text-secondary)] font-bold">{target.toFixed(1)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DriftMonitor;
