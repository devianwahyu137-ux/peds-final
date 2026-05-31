import { useState, useEffect, useRef } from "react";
import MicroSparkline from "./MicroSparkline";
import MacroTooltip from "./MacroTooltip";
import { useRootStore } from "@/stores/rootStore";

/**
 * Glow color map per scenario — smooth transitions via inline style.
 */
const GLOW_MAP = {
  EQUILIBRIUM:     { color: "#10b981", shadow: "rgba(16,185,129,0.20)" },
  TIGHTENING:      { color: "#f59e0b", shadow: "rgba(245,158,11,0.18)" },
  CURRENCY_STRESS: { color: "#ef4444", shadow: "rgba(239,68,68,0.20)" },
};

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
 * Format the timestamp delta as a relative "time ago" string.
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const delta = Date.now() - timestamp;
  if (delta < 60000) return "just now";
  if (delta < 3600000) return `${Math.floor(delta / 60000)}m ago`;
  if (delta < 86400000) return `${Math.floor(delta / 3600000)}h ago`;
  return `${Math.floor(delta / 86400000)}d ago`;
}

/**
 * MacroIndicatorCard — Individual glassmorphic card with
 * animated counter, sparkline, status dot, and tooltip.
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   unit: string,
 *   icon: string,
 *   value: number|string,
 *   timestamp: number,
 *   status: string,
 *   scenarioId: string,
 *   sparklineData: number[],
 *   crisisMode: string|null,
 * }} props
 */
export default function MacroIndicatorCard({
  id,
  label,
  unit,
  icon,
  value,
  timestamp,
  status,
  scenarioId,
  sparklineData,
  crisisMode,
}) {
  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : (scenarioId || "EQUILIBRIUM");
  const glow = GLOW_MAP[effectiveScenario] || GLOW_MAP.EQUILIBRIUM;
  const isActive = status === "ok" || status === "fetching";
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

  // Format display value based on unit type
  let displayValue;
  if (typeof value === "number" && !isNaN(value)) {
    if (unit === "IDR") {
      displayValue = value.toLocaleString("id-ID");
    } else if (unit === "pts") {
      displayValue = value.toFixed(2);
    } else {
      displayValue = value.toFixed(2) + "%";
    }
  } else {
    displayValue = String(value || "—");
  }

  const animatedValue = useCountUp(displayValue, 800);

  // Status dot color
  const statusColor = {
    ok: "#10b981",
    fetching: "#f59e0b",
    stale: "#f59e0b",
    fallback: "#ef4444",
    failed: "#ef4444",
  }[status] || "var(--as-text-tertiary)";

  // NEW — reads from dedicated deltaMap slice
  const deltaInfo = useRootStore((s) => s.deltaMap[id]);
  const delta     = deltaInfo?.delta     ?? 0;
  const direction = deltaInfo?.direction ?? 'flat';

  return (
    <div
      className="relative rounded-2xl overflow-hidden scenario-transition"
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        background: "var(--as-bg-secondary)",
        border: "1px solid var(--as-border-primary)",
        boxShadow: isActive || isChanging
          ? `0 8px 32px var(--as-bg-tertiary), 0 0 20px ${glow.shadow}`
          : "0 8px 32px var(--as-bg-tertiary)",
        borderColor: isActive || isChanging
          ? `${glow.color}33`
          : "var(--as-border-primary)",
      }}
    >
      {/* Glow aura pseudo-element replacement */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${glow.color}15 0%, transparent 70%)`,
          opacity: isActive || isChanging ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col gap-2">
        {/* Header: Icon, Label, Status Dot, Tooltip */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="text-[10px] uppercase tracking-widest text-[var(--as-text-dim)] font-sans font-semibold">
              {label}
            </span>
            <MacroTooltip indicatorId={id}>?</MacroTooltip>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 4px ${statusColor}` }}
            />
            <span className="text-[8px] font-mono text-neutral-600 uppercase">{status || "idle"}</span>
          </div>
        </div>

        {/* Main Value — Animated */}
        <div
          className={`text-4xl font-black font-mono tracking-tighter tabular-nums ${isChanging ? "value-updated" : ""}`}
          style={{ color: glow.color }}
        >
          {animatedValue}
        </div>

        {/* Unit label */}
        <div className="text-[9px] font-mono font-light text-[var(--as-text-dim)] mt-0.5">{unit}</div>

        {/* Sparkline */}
        <div className="mt-3 mb-2">
          <MicroSparkline
            data={sparklineData}
            color={glow.color}
            width={120}
            height={36}
            showArea={true}
          />
        </div>

        {/* Footer: Delta Badge + Last Updated */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="text-[9px] font-mono font-bold tabular-nums"
              style={{
                color: direction === 'up'   ? '#10b981'
                     : direction === 'down' ? '#ef4444'
                     : 'var(--as-text-tertiary)',
              }}
            >
              {direction === 'up'   ? '▲' : direction === 'down' ? '▼' : '—'}
              {' '}
              {delta !== 0
                ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`
                : 'tidak berubah'
              }
            </span>
            <span className="text-[8px] font-mono font-light text-[var(--as-text-tertiary)]">
              vs periode lalu
            </span>
          </div>
          <span className="text-[9px] font-mono font-light text-[var(--as-text-tertiary)] mt-2">
            {formatTimeAgo(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
