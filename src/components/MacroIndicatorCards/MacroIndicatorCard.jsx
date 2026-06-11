import { useState, useEffect, useRef } from "react";
import MicroSparkline from "./MicroSparkline";
import MacroTooltip from "./MacroTooltip";
import { useRootStore } from "@/stores/rootStore";
import { SCENARIO_CONFIG } from "@/lib/scenarioPulse";
import { RefreshCw } from "lucide-react";



/**
 * useCountUp — requestAnimationFrame-based counter animation hook.
 * Parses numeric strings with units and animates between values.
 *
 * @param {string|number} targetValue - target to animate towards
 * @param {number} duration - animation duration in ms
 * @returns {string|number} current display value
 */
function useCountUp(targetValue, duration = 800) {
  const [display, setDisplay] = useState(targetValue);
  const prevRef = useRef(targetValue);
  const rafRef = useRef(null);

  useEffect(() => {
    if (prevRef.current === targetValue) return;

    const startVal = parseFloat(String(prevRef.current).replace(/[^0-9.-]/g, ""));
    const endVal = parseFloat(String(targetValue).replace(/[^0-9.-]/g, ""));

    if (isNaN(startVal) || isNaN(endVal)) {
      setDisplay(targetValue);
      prevRef.current = targetValue;
      return;
    }

    // Determine decimal places from the target
    const strTarget = String(targetValue);
    const decimals = (strTarget.split(".")[1] || "").replace(/[^0-9]/g, "").length;
    // Extract suffix (%, pts, IDR, etc.)
    const suffix = strTarget.replace(/[0-9.,-\s]/g, "").trim();

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;

      const formatted = current.toFixed(decimals);
      setDisplay(suffix ? `${formatted}${suffix}` : formatted);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(targetValue);
        prevRef.current = targetValue;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, duration]);

  return display;
}

/**
 * Format the timestamp delta as a relative "time ago" string in Indonesian.
 */
function formatTimeAgoIndonesian(timestamp) {
  if (!timestamp) return "";
  const delta = Date.now() - timestamp;
  if (delta < 60000) return "baru saja";
  const minutes = Math.floor(delta / 60000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(delta / 3600000);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(delta / 86400000);
  return `${days} hari lalu`;
}

/**
 * MacroIndicatorCard — Individual glassmorphic card with
 * animated counter, sparkline, status dot, and tooltip.
 */
export default function MacroIndicatorCard({
  id,
  label,
  unit,
  icon,
  value,
  timestamp,
  isLive,
  scenarioId,
  sparklineData,
  crisisMode,
}) {
  const effectiveScenario = crisisMode
    ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
    : (scenarioId || "EQUILIBRIUM");
  const config = SCENARIO_CONFIG[effectiveScenario] || SCENARIO_CONFIG.EQUILIBRIUM;
  const glow = {
    color: config.color,
    shadow: config.colorGlow,
  };
  const isActive = isLive;
  const [isChanging, setIsChanging] = useState(false);
  const prevValueRef = useRef(value);

  // Detect value changes for glow pulse
  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsChanging(true);
      prevValueRef.current = value;
      const timer = setTimeout(() => setIsChanging(false), 700);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const animatedValue = useCountUp(String(value), 800);

  // NEW — reads from dedicated deltaMap slice
  const deltaInfo = useRootStore((s) => s.deltaMap[id]);
  const delta     = deltaInfo?.delta     ?? 0;
  const direction = deltaInfo?.direction ?? 'flat';

  const triggerRefresh = useRootStore((s) => s.triggerRefresh);
  const status         = useRootStore((s) => s.endpointStatus[id]);

  return (
    <div
      className="card-tier-2 relative overflow-hidden scenario-transition"
      style={{
        borderColor: isActive || isChanging ? `${glow.color}33` : undefined,
        boxShadow: isActive || isChanging ? `0 8px 32px var(--as-bg-tertiary), 0 0 20px ${glow.shadow}` : undefined,
      }}
    >
      {/* Glow aura pseudo-element replacement */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glow.color}15 0%, transparent 70%)`,
          opacity: isActive || isChanging ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />

      {/* Header: Icon, Label, Status Dot, Tooltip */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex items-center gap-2">
            <div className="text-[9px] font-mono tracking-[0.2em] uppercase"
                 style={{ color: 'var(--as-text-dim)' }}>
              {label}
            </div>
            <MacroTooltip indicatorId={id}>?</MacroTooltip>
          </div>
        </div>
        {/* Status badge - Only show if LIVE */}
        {isLive && (
          <span className="text-[8px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1.5"
                style={{ background: 'var(--as-bg-tertiary)',
                         color: '#10b981' }}>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#10b981', boxShadow: `0 0 4px #10b981` }}
            />
            LIVE
          </span>
        )}
      </div>

      {/* Main Value — Animated */}
      <div
        className={`text-[32px] font-black font-mono tracking-tighter tabular-nums leading-none mb-1 relative z-10 ${isChanging ? "value-updated" : ""}`}
        style={{ color: glow.color }}
      >
        {animatedValue}
      </div>

      {/* Unit label */}
      <div className="text-[9px] font-mono mb-6 relative z-10" style={{ color: 'var(--as-text-dim)' }}>
        {unit}
      </div>

      {/* Sparkline */}
      <div className="relative z-10 -mx-2">
        <MicroSparkline
          data={sparklineData}
          color={glow.color}
          width={undefined}
          height={64}
          showArea={true}
        />
      </div>

      {/* Footer: Delta Badge + Last Updated */}
      <div className="flex items-center justify-between mt-4 pt-4 relative z-10"
           style={{ borderTop: '1px solid var(--as-border-secondary)' }}>
        <span
          className="text-[9px] font-mono font-bold tabular-nums"
          style={{
            color: direction === 'up'   ? '#10b981'
                 : direction === 'down' ? '#ef4444'
                 : 'var(--as-text-tertiary)',
          }}
        >
          {direction === 'up' ? '▲ ' : direction === 'down' ? '▼ ' : ''}
          {delta !== 0 ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)}%` : '—'}
        </span>
        <div className="text-[8px] font-mono font-light text-[var(--as-text-tertiary)] flex flex-col items-end">
          <span>vs periode lalu</span>
          {(() => {
            const isStale = !timestamp || (Date.now() - timestamp) > 3600000;
            const isFetching = status === "fetching";
            
            if (isStale || isFetching) {
              return (
                <div className="flex items-center gap-1.5 mt-1 text-amber-500/90 font-medium">
                  <span>Data dari cache — klik untuk refresh</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (triggerRefresh) triggerRefresh();
                    }}
                    disabled={isFetching}
                    title={isFetching ? "Sedang menyegarkan..." : "Refresh data"}
                    className="p-1 hover:bg-neutral-850 dark:hover:bg-neutral-800/80 rounded transition-colors duration-200 cursor-pointer flex items-center justify-center active:scale-90 disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={isFetching ? "animate-spin text-amber-500" : "animate-pulse text-amber-500"} />
                  </button>
                </div>
              );
            } else {
              return (
                <span className="mt-1 opacity-65 text-emerald-500/80 font-medium">
                  Diperbarui {formatTimeAgoIndonesian(timestamp)}
                </span>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
