/**
 * SharedComponents.jsx
 *
 * Shared UI primitives extracted from AlphaShield.jsx.
 * Used by PortfolioPage, HomePage, and other pages.
 * DOES NOT contain any business logic or store mutations.
 */

import { useState, useEffect, useRef } from "react";

// ── ACCENT CONFIGURATION ────────────────────────────────────────────────────────

export const ACCENT = {
  emerald: {
    neon: "#10ffaa", glow: "rgba(16,255,170,0.25)", glowStrong: "rgba(16,255,170,0.5)",
    border: "border-emerald-500/40", text: "text-emerald-400", textBright: "text-emerald-300",
    bg: "bg-emerald-500/10", gradFrom: "from-emerald-900/30", gradTo: "to-emerald-950/10",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40", dot: "bg-emerald-400"
  },
  amber: {
    neon: "#ffcc00", glow: "rgba(255,204,0,0.2)", glowStrong: "rgba(255,204,0,0.45)",
    border: "border-amber-500/40", text: "text-amber-400", textBright: "text-amber-300",
    bg: "bg-amber-500/10", gradFrom: "from-amber-900/30", gradTo: "to-amber-950/10",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40", dot: "bg-amber-400"
  },
  red: {
    neon: "#ff3c3c", glow: "rgba(255,60,60,0.2)", glowStrong: "rgba(255,60,60,0.45)",
    border: "border-red-500/40", text: "text-red-400", textBright: "text-red-300",
    bg: "bg-red-500/10", gradFrom: "from-red-900/30", gradTo: "to-red-950/10",
    badge: "bg-red-500/20 text-red-300 border border-red-500/40", dot: "bg-red-400"
  }
};

// ── ASSET CONFIGURATION ─────────────────────────────────────────────────────────

export const ASSET_CONFIG = {
  stocks: { label: "EQUITIES", sublabel: "Stocks", icon: "📈", color: "#3b82f6", colorDim: "rgba(59,130,246,0.15)" },
  bonds: { label: "FIXED INCOME", sublabel: "Bonds", icon: "🏛️", color: "#a78bfa", colorDim: "rgba(167,139,250,0.15)" },
  gold: { label: "PRECIOUS METALS", sublabel: "Gold", icon: "🥇", color: "#fbbf24", colorDim: "rgba(251,191,36,0.15)" },
  cash: { label: "LIQUIDITY", sublabel: "Cash / USD", icon: "💵", color: "#34d399", colorDim: "rgba(52,211,153,0.15)" }
};

// ── ANIMATED NUMBER ─────────────────────────────────────────────────────────────

export function AnimatedNumber({ value, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const start = Date.now();
    const duration = 600;
    const startVal = parseFloat(String(prev.current).replace(/[^0-9.]/g, ""));
    const endVal = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    if (isNaN(startVal) || isNaN(endVal)) {
      setDisplay(value);
      prev.current = value;
      return;
    }

    const raf = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;
      const decimals = (String(value).split(".")[1] || "").length;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(raf);
      else {
        setDisplay(value);
        prev.current = value;
      }
    };
    requestAnimationFrame(raf);
  }, [value]);

  return <span>{prefix}{display}{suffix}</span>;
}

// ── ALLOCATION ROW ──────────────────────────────────────────────────────────────

export function AllocationRow({ assetKey, pct }) {
  const cfg = ASSET_CONFIG[assetKey];
  return (
    <div className="flex items-center gap-4 w-full font-mono text-xs">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ background: cfg.colorDim, border: `1px solid ${cfg.color}33` }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <span className="text-[10px] font-bold tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-[10px] text-neutral-600 ml-2">{cfg.sublabel}</span>
          </div>
          <span className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-900 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
        </div>
      </div>
    </div>
  );
}

// ── SCENARIO BUTTON ─────────────────────────────────────────────────────────────

export function ScenarioButton({ scenario, isActive, onClick }) {
  const acc = ACCENT[scenario.accent];
  return (
    <button onClick={onClick} className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${isActive ? `${acc.bg} ${acc.border} ring-1 ring-${scenario.accent}-500/20` : "bg-neutral-900/40 border-neutral-850 hover:border-neutral-700/60"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isActive ? acc.neon : "#444" }} />
          <div>
            <div className={`text-xs font-mono tracking-widest uppercase font-bold ${isActive ? acc.text : "text-neutral-500"}`}>{scenario.id}</div>
            <div className={`text-[11px] mt-0.5 ${isActive ? acc.textBright : "text-neutral-600"}`}>{scenario.label}</div>
          </div>
        </div>
        <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isActive ? acc.badge : "border-neutral-700/40 text-neutral-600"}`}>
          {scenario.theme}
        </div>
      </div>
    </button>
  );
}

// ── DONUT CHART ─────────────────────────────────────────────────────────────────

export function DonutChart({ accentColor, hovered, setHovered, animPct, analytics }) {
  const size = 260;
  const cx = size / 2; const cy = size / 2;
  const R = 96; const r = 62;
  const total = animPct.stocks + animPct.bonds + animPct.gold + animPct.cash;
  const keys = ["stocks", "bonds", "gold", "cash"];

  let cumulativeAngle = -90;
  const arcs = keys.map((key) => {
    const pct = total > 0 ? animPct[key] / total : 0;
    const angle = pct * 360;
    const startAngle = cumulativeAngle; cumulativeAngle += angle;
    const endAngle = cumulativeAngle;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const x1 = cx + R * Math.cos(toRad(startAngle)); const y1 = cy + R * Math.sin(toRad(startAngle));
    const x2 = cx + R * Math.cos(toRad(endAngle)); const y2 = cy + R * Math.sin(toRad(endAngle));
    const ix1 = cx + r * Math.cos(toRad(startAngle)); const iy1 = cy + r * Math.sin(toRad(startAngle));
    const ix2 = cx + r * Math.cos(toRad(endAngle)); const iy2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    const cfg = ASSET_CONFIG[key];
    const isHov = hovered === key;

    return {
      key, cfg, isHov, pct: animPct[key],
      path: angle > 0.5 ? `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${largeArc} 0 ${ix1} ${iy1} Z` : null,
      lx: cx + ((R + r) / 2) * Math.cos(toRad(startAngle + angle / 2)),
      ly: cy + ((R + r) / 2) * Math.sin(toRad(startAngle + angle / 2))
    };
  });

  const acc = ACCENT[accentColor];

  // Analytics values from store — NEVER hardcoded
  const sharpe = analytics?.sharpeRatio ?? 0;
  const beta = analytics?.portfolioBeta ?? 0;

  return (
    <div className="relative flex flex-col items-center justify-center font-mono shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <circle cx={cx} cy={cy} r={(R + r) / 2} fill="none" stroke="#ffffff08" strokeWidth={R - r} />
        {arcs.map(({ key, cfg, path, isHov, pct, lx, ly }) =>
          path ? (
            <g
              key={key}
              className="svg-segment"
              style={{
                transform: isHov ? "scale(1.05)" : "scale(1)",
                transformOrigin: `${cx}px ${cy}px`,
                filter: isHov ? `brightness(1.15) drop-shadow(0 0 8px ${cfg.color})` : "none",
              }}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
            >
              <path d={path} fill={cfg.color} fillOpacity={isHov ? "1" : "0.8"} stroke="#000" strokeWidth="2" />
              {pct >= 10 && (
                <text x={lx} y={ly + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" style={{ pointerEvents: "none" }}>{Math.round(pct)}%</text>
              )}
            </g>
          ) : null
        )}
        <circle cx={cx} cy={cy} r={r - 4} fill="#050505" stroke={acc.neon} strokeWidth="1" strokeOpacity="0.3" />

        {/* Center Overlay: Sharpe + Beta from store / Asset detail on hover */}
        {hovered ? (
          <>
            <text x={cx} y={cy - 12} textAnchor="middle" fontSize="9" fill="#888" letterSpacing="1" style={{ transition: "opacity 150ms ease" }}>{ASSET_CONFIG[hovered].label}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="20" fontWeight="900" fill={ASSET_CONFIG[hovered].color} style={{ transition: "opacity 150ms ease" }}>{Math.round(animPct[hovered])}%</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 18} textAnchor="middle" fontSize="9" fill="#555" letterSpacing="2">SHARPE RATIO</text>
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="900" fill={acc.neon}>{sharpe.toFixed(2)}</text>
            <line x1={cx - 20} y1={cy + 6} x2={cx + 20} y2={cy + 6} stroke="#333" strokeWidth="0.5" />
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="#555" letterSpacing="2">PORTFOLIO β</text>
            <text x={cx} y={cy + 32} textAnchor="middle" fontSize="14" fontWeight="900" fill={acc.neon}>{beta.toFixed(2)}</text>
          </>
        )}
      </svg>
    </div>
  );
}

// ── METRIC WITH CONTEXT ─────────────────────────────────────────────────────────

/**
 * Human-readable metric card with Indonesian interpretation text.
 */
export function MetricWithContext({ label, value, unit, interpretation, color }) {
  return (
    <div className="border border-neutral-900 p-3 rounded-lg bg-black/20 font-mono space-y-1">
      <div className="text-[8px] text-neutral-600 uppercase tracking-widest">{label}</div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>
        {value}{unit}
      </div>
      <div className="text-[9px] text-neutral-600 leading-relaxed">
        {interpretation}
      </div>
    </div>
  );
}

/**
 * Dynamic interpretation generators for portfolio analytics.
 */
export function getSharpeInterpretation(sharpe) {
  if (sharpe >= 1.5) return "Sangat efisien — return tinggi untuk risiko yang diambil";
  if (sharpe >= 1.0) return "Efisien — portofolio memberi reward yang layak atas risiko";
  if (sharpe >= 0.5) return "Cukup — masih akseptabel, ada ruang untuk optimasi";
  return "Rendah — pertimbangkan rebalancing untuk meningkatkan efisiensi";
}

export function getBetaInterpretation(beta) {
  if (beta < 0.3)  return "Sangat defensif — bergerak lambat mengikuti pasar";
  if (beta < 0.7)  return "Defensif — kurang volatile dibanding IHSG";
  if (beta < 1.0)  return "Moderat — mengikuti pasar dengan sedikit redaman";
  return "Agresif — bergerak lebih kencang dari IHSG";
}

export function getMddInterpretation(mdd) {
  const pct = Math.abs(mdd * 100);
  if (pct < 5)  return "Risiko penurunan sangat rendah — portofolio sangat stabil";
  if (pct < 10) return "Penurunan moderat — masih dalam batas toleransi normal";
  if (pct < 20) return "Potensi koreksi signifikan — pastikan ada buffer likuiditas";
  return "Drawdown tinggi — pertimbangkan proteksi atau diversifikasi lebih lanjut";
}

export function getVolInterpretation(vol) {
  const pct = vol * 100;
  if (pct < 5)  return "Volatilitas sangat rendah — pergerakan stabil dan terprediksi";
  if (pct < 10) return "Fluktuasi moderat — tipikal untuk portofolio seimbang";
  if (pct < 15) return "Cukup volatile — nilainya bisa bergerak cukup lebar per bulan";
  return "Sangat volatile — siap mental untuk fluktuasi tajam harian";
}
