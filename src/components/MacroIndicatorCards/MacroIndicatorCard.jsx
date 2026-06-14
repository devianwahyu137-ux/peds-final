import { useState, useEffect, useRef } from "react";
import MicroSparkline from "./MicroSparkline";
import MacroTooltip from "./MacroTooltip";
import { useRootStore } from "@/stores/rootStore";
import { SCENARIO_CONFIG } from "@/lib/scenarioPulse";
import { RefreshCw } from "lucide-react";
import { formatPercent, formatNumber, formatIDR } from "@/utils/format";



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

    const parseIndonesianNumber = (str) => {
      let s = String(str).trim();
      if (s.includes(",")) {
        s = s.replace(/\./g, "").replace(/,/g, ".");
      } else {
        const digitsAndDots = s.replace(/[^0-9.]/g, "");
        if (/\d+\.\d{3}$/.test(digitsAndDots)) {
          s = digitsAndDots.replace(/\./g, "");
        }
      }
      s = s.replace(/[^0-9.-]/g, "");
      return parseFloat(s);
    };

    const startVal = parseIndonesianNumber(prevRef.current);
    const endVal = parseIndonesianNumber(targetValue);

    if (isNaN(startVal) || isNaN(endVal)) {
      setDisplay(targetValue);
      prevRef.current = targetValue;
      return;
    }

    const strTarget = String(targetValue);
    const hasComma = strTarget.includes(",");
    const decimals = hasComma ? (strTarget.split(",")[1] || "").replace(/[^0-9]/g, "").length : 0;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;

      let formatted;
      if (hasComma) {
        formatted = formatNumber(current, decimals);
      } else {
        formatted = formatIDR(Math.round(current));
      }
      setDisplay(formatted);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-3 md:mb-6 relative z-10">
        <div className="flex items-center gap-1.5 md:gap-3">
          <span className="text-lg md:text-2xl shrink-0">{icon}</span>
          <div className="flex items-center gap-1 md:gap-2 min-w-0">
            <div className="text-[8px] md:text-[9px] font-sans tracking-[0.1em] md:tracking-[0.2em] uppercase truncate"
                 style={{ color: 'var(--as-text-dim)' }}>
              {label}
            </div>
            <MacroTooltip indicatorId={id}>?</MacroTooltip>
          </div>
        </div>
        {/* Status badge - Dynamic for LIVE and ESTIMASI indicators */}
        <span className="text-[7px] md:text-[8px] font-sans px-1.5 md:px-2 py-0.5 rounded-md flex items-center gap-1 md:gap-1.5 shrink-0 self-start md:self-auto"
              style={
                (id === "usdIdr" || id === "xauUsd")
                   ? (isLive 
                      ? { background: 'rgba(16,185,129,0.08)', color: '#10b981' } 
                      : { background: 'var(--as-bg-tertiary)', color: 'var(--as-text-dim)' })
                  : { background: 'var(--as-bg-tertiary)', color: 'var(--as-text-dim)' }
              }>
          {((id === "usdIdr" || id === "xauUsd") && isLive) && (
            <div
              className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 animate-pulse"
              style={{ boxShadow: `0 0 4px #10b981` }}
            />
          )}
          {(() => {
            if (id === "usdIdr" || id === "xauUsd") {
              return isLive ? (
                <>
                  <span className="hidden md:inline">LIVE (delay ~5 mnt)</span>
                  <span className="md:hidden">LIVE</span>
                </>
              ) : (
                <>
                  <span className="hidden md:inline">MEMUAT...</span>
                  <span className="md:hidden">LOAD...</span>
                </>
              );
            }
            return (
              <>
                <span className="hidden md:inline">ESTIMASI - per Juni 2026</span>
                <span className="md:hidden">ESTIMASI</span>
              </>
            );
          })()}
        </span>
      </div>

      {/* Main Value — Animated */}
      <div
        className={`text-[20px] md:text-[32px] font-black font-mono tracking-tighter tabular-nums leading-none mb-1 relative z-10 ${isChanging ? "value-updated" : ""}`}
        style={{ color: glow.color }}
      >
        {animatedValue}
      </div>

      {/* Unit label */}
      <div className="text-[8px] md:text-[9px] font-sans mb-3 md:mb-6 relative z-10" style={{ color: 'var(--as-text-dim)' }}>
        {unit}
      </div>

      {/* Sparkline */}
      <div className="relative z-10 -mx-2">
        <div className="hidden md:block">
          <MicroSparkline
            data={sparklineData}
            color={glow.color}
            width={undefined}
            height={64}
            showArea={true}
          />
        </div>
        <div className="md:hidden">
          <MicroSparkline
            data={sparklineData}
            color={glow.color}
            width={undefined}
            height={32}
            showArea={true}
          />
        </div>
      </div>

      {/* Footer: Delta Badge + Last Updated */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mt-2 md:mt-4 pt-2 md:pt-4 relative z-10 gap-1.5 md:gap-0"
           style={{ borderTop: '1px solid var(--as-border-secondary)' }}>
        <span
          className="text-[8px] md:text-[9px] font-mono font-bold tabular-nums shrink-0"
          style={{
            color: direction === 'up'   ? '#10b981'
                 : direction === 'down' ? '#ef4444'
                 : 'var(--as-text-tertiary)',
          }}
        >
          {direction === 'up' ? '▲ ' : direction === 'down' ? '▼ ' : ''}
          {delta !== 0 ? `${delta > 0 ? '+' : ''}${formatPercent(delta, 2)}` : '—'}
        </span>
        <div className="text-[7px] md:text-[8px] font-sans font-light text-[var(--as-text-tertiary)] flex flex-col items-start md:items-end w-full md:w-auto">
          <span>vs periode lalu</span>
          {(() => {
            const isLiveMetric = id === "usdIdr" || id === "xauUsd";
            const isFetching = status === "fetching";
            
            if (isLiveMetric) {
              const isStale = !timestamp || (Date.now() - timestamp) > 10 * 60 * 1000;
              if (isStale || isFetching) {
                return (
                  <div className="flex items-center gap-1 mt-1 text-amber-500/90 font-medium flex-wrap">
                    <span>Data dari cache — klik untuk refresh</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (triggerRefresh) triggerRefresh();
                      }}
                      disabled={isFetching}
                      title={isFetching ? "Sedang menyegarkan..." : "Refresh data"}
                      className="p-0.5 hover:bg-neutral-850 dark:hover:bg-neutral-800/80 rounded transition-colors duration-200 cursor-pointer flex items-center justify-center active:scale-90 disabled:opacity-50"
                    >
                      <RefreshCw size={8} className={isFetching ? "animate-spin text-amber-500" : "animate-pulse text-amber-500"} />
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
            } else {
              if (isFetching) {
                return (
                  <div className="flex items-center gap-1 mt-1 text-amber-500/90 font-medium">
                    <span>Memperbarui estimasi...</span>
                  </div>
                );
              }
              if (timestamp) {
                return (
                  <span className="mt-1 opacity-65 text-emerald-500/80 font-medium font-sans">
                    Diperbarui {formatTimeAgoIndonesian(timestamp)}
                  </span>
                );
              }
              return (
                <span className="mt-1 opacity-50 text-[var(--as-text-tertiary)] font-medium font-sans">
                  Estimasi Statis
                </span>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
