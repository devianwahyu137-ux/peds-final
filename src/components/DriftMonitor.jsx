import React from "react";
import { useRootStore } from "@/stores/rootStore";

const ASSET_CONFIG = {
  stocks: { label: "Equities (IDX)", icon: "📈", color: "#3b82f6" },
  bonds: { label: "SBN / Bonds", icon: "🏛️", color: "#a78bfa" },
  gold: { label: "Physical Gold", icon: "🥇", color: "#fbbf24" },
  cash: { label: "Cash / Liquidity", icon: "💵", color: "#34d399" }
};

const DriftMonitor = React.memo(function DriftMonitor() {
  const { targetWeights, weights, actualWeights } = useRootStore();
  const currentTargetWeights = targetWeights || weights || {};
  const currentActualWeights = actualWeights || currentTargetWeights; // Fallback if actualWeights is undefined
  const assets = ["stocks", "bonds", "gold", "cash"];

  return (
    <div className="border border-neutral-900 bg-neutral-950/60 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white font-mono">[📊] DRIFT_MONITOR_CORE</h3>
        <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Comparing actual weights vs target baseline weights</p>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => {
          const target = currentTargetWeights?.[asset] ?? 0;
          const actual = currentActualWeights?.[asset] ?? 0;
          const drift = actual - target;
          const cfg = ASSET_CONFIG[asset];

          const absDrift = Math.abs(drift);
          let statusLabel = "ALIGNMENT_OK";
          let statusStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          
          if (absDrift >= 10.0) {
            statusLabel = "CRITICAL";
            statusStyle = "bg-red-500/10 text-red-400 border-red-500/20";
          } else if (absDrift >= 5.0) {
            statusLabel = "WARNING";
            statusStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
          }

          const driftColor = drift === 0 ? "text-neutral-500" : drift > 0 ? "text-emerald-400" : "text-red-400";
          const driftSign = drift > 0 ? "+" : "";

          // Zero-centered alignment calculations (scaled to +/- 25% max visual limits)
          const scaleLimit = 25;
          const scaledPercent = Math.max(-100, Math.min(100, (drift / scaleLimit) * 50)); // -50% to +50% range relative to center (50%)
          
          return (
            <div key={asset} className="border border-neutral-900/60 bg-black/40 rounded-xl p-4 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span className="font-bold text-neutral-300 text-[11px]">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded border uppercase ${statusStyle}`}>{statusLabel}</span>
                  <span className={`font-bold text-[11px] ${driftColor}`}>{driftSign}{drift.toFixed(1)}%</span>
                </div>
              </div>

              {/* Zero-Centered Divergence Velocity Bar */}
              <div className="space-y-1">
                <div className="relative h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-900">
                  {/* Anchor Center Zero-line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-neutral-800 z-10" />
                  
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
                <div className="flex justify-between text-[7px] text-neutral-600 font-bold px-1 uppercase tracking-widest">
                  <span>-25% Under</span>
                  <span>Target Alignment</span>
                  <span>+25% Over</span>
                </div>
              </div>

              {/* Explicit Numerical Details */}
              <div className="flex justify-between text-[9px] text-neutral-500 border-t border-neutral-900/40 pt-2">
                <span>ACTUAL: <strong className="text-neutral-300">{actual.toFixed(1)}%</strong></span>
                <span>TARGET: <strong className="text-neutral-400">{target.toFixed(1)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DriftMonitor;
