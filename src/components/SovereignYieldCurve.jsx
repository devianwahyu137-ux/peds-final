import React, { useState } from "react";
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare, Globe } from "lucide-react";
import { useRootStore } from "@/stores/rootStore";

const tenures = ["1Y", "3Y", "5Y", "10Y"];
const ustYields = [4.95, 4.60, 4.50, 4.45];

// Curve definitions per scenario (first three coordinates, 10Y is derived from active macroInputs.sbn10y)
const sbnMap = {
  EQUILIBRIUM: [5.80, 6.10, 6.35],       // Normal steepening curve
  TIGHTENING: [7.25, 7.28, 7.30],        // Flat array curve
  CURRENCY_STRESS: [8.50, 8.20, 8.00],   // Sharp curve inversion on short-end
};

const cL = ["IHSG", "SBN-10Y", "XAU/IDR", "USD/IDR"];

const cD = [
  [1.0, -0.45, -0.25, -0.55],
  [-0.45, 1.0, 0.15, 0.65],
  [-0.25, 0.15, 1.0, 0.85],
  [-0.55, 0.65, 0.85, 1.0]
];

const cI = {
  "0-1": "Yield SBN yang tinggi meningkatkan biaya modal pasar ekuitas (IHSG), memicu perpindahan dana asing dari instrumen saham ke pasar obligasi domestik.",
  "0-2": "Korelasi negatif lemah. Emas spot global bersaing secara relatif terhadap aset berisiko IHSG saat iklim investasi beralih ke penghindaran risiko (risk-off).",
  "0-3": "Depresiasi mata uang Rupiah secara historis menekan kinerja IHSG karena meningkatkan beban biaya impor emiten lokal dan memperlemah daya beli domestik.",
  "1-2": "Obligasi SBN dan emas fisik bersaing memperebutkan likuiditas safe-haven domestik, namun emas memiliki keuntungan sebagai penyimpan nilai tanpa risiko gagal bayar.",
  "1-3": "Pelemahan Rupiah terhadap USD memaksa Bank Indonesia mempertahankan yield SBN di tingkat yang relatif tinggi untuk menahan aliran modal keluar (outflow).",
  "2-3": "Harga emas dalam denominasi Rupiah (XAU/IDR) berkorelasi sangat kuat dan positif dengan pergerakan kurs USD/IDR, berfungsi sebagai lindung nilai devaluasi mata uang."
};

/**
 * Accent color map per scenario for glowing nodes.
 */
const ACCENT_MAP = {
  EQUILIBRIUM: "#10ffaa",
  TIGHTENING: "#ffcc00",
  CURRENCY_STRESS: "#ff3c3c",
};

const buildSmoothPath = (points) => {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.y;
    const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
    const cp2y = p1.y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return path;
};

const getCellColor = (val) => {
  if (val >= 0.5) return "#10ffaa";
  if (val >= 0.15) return "#34d399";
  if (val > -0.15) return "#555";
  if (val > -0.5) return "#fbbf24";
  return "#ff3c3c";
};

const SovereignYieldCurve = React.memo(function SovereignYieldCurve() {
  const { scenarioId, crisisMode, macroInputs } = useRootStore();
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredTenor, setHoveredTenor] = useState(null);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const accentColor = ACCENT_MAP[effectiveScenario] || ACCENT_MAP.EQUILIBRIUM;

  const sbn10y = typeof macroInputs?.sbn10y === 'number' && isFinite(macroInputs.sbn10y)
    ? macroInputs.sbn10y
    : 6.60; // fallback Equilibrium default
  const sbnBase = sbnMap[scenarioId] || sbnMap.EQUILIBRIUM;
  const sbnYields = [...sbnBase, sbn10y].map(
    v => (typeof v === 'number' && isFinite(v) ? v : 0)
  );

  // SVG Chart Setup
  const W = 520, H = 240, pL = 50, pR = 25, pT = 25, pB = 40;
  const cW = W - pL - pR, cH = H - pT - pB;
  const allYields = [...ustYields, ...sbnYields];
  const mn = Math.floor(Math.min(...allYields) - 0.5);
  const mx = Math.ceil(Math.max(...allYields) + 0.5);
  
  const xP = tenures.map((_, i) => pL + (i / 3) * cW);
  const tY = (v) => pT + ((mx - v) / (mx - mn)) * cH;

  const sbnPoints = sbnYields.map((v, i) => ({ x: xP[i], y: tY(v) }));
  const ustPoints = ustYields.map((v, i) => ({ x: xP[i], y: tY(v) }));

  const sbnBezier = buildSmoothPath(sbnPoints);
  const ustBezier = buildSmoothPath(ustPoints);

  const spread = (sbn10y ?? 0) - 4.45;

  // Build spread data for tooltip
  const spreadData = tenures.map((tenor, i) => ({
    tenor,
    sbn: (sbnYields[i] ?? 0).toFixed(2),
    ust: (ustYields[i] ?? 0).toFixed(2),
    spread: Math.round(((sbnYields[i] ?? 0) - (ustYields[i] ?? 0)) * 100), // in bps
  }));

  return (
    <div className="space-y-6">
      {/* Dynamic SBN vs UST Plot */}
      <div className="card-tier-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[var(--as-text-primary)]"><Globe size={18} className="text-blue-400" /><span className="font-bold tracking-wide text-sm uppercase">Sovereign Yield Curve Detector</span></div>
            <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider">Dynamic SBN vs UST Tenure Bezier Plot</p>
          </div>
          <div className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
            SPREAD 10Y: <span className="font-bold text-amber-400">+{(spread ?? 0).toFixed(2)}%</span>
          </div>
        </div>

        <div className="border border-slate-300 dark:border-neutral-800/50 rounded-lg bg-slate-50 dark:bg-black/40 p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
            {/* Grid Lines */}
            {[mn, mn + (mx - mn) * 0.25, mn + (mx - mn) * 0.5, mn + (mx - mn) * 0.75, mx].map((v, i) => (
              <g key={i}>
                <line x1={pL} y1={tY(v)} x2={W - pR} y2={tY(v)} stroke="#171717" strokeWidth="0.75" />
                <text x={pL - 8} y={tY(v) + 3} textAnchor="end" fontSize="8" fill="#555" fontFamily="monospace">{v.toFixed(2)}%</text>
              </g>
            ))}
            
            {/* Tenure Labels */}
            {tenures.map((t, i) => (
              <text key={t} x={xP[i]} y={H - 12} textAnchor="middle" fontSize="9" fill="#666" fontFamily="monospace">{t}</text>
            ))}

            {/* Bezier Curves */}
            <path d={ustBezier} fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="5 3" />
            <path d={sbnBezier} fill="none" stroke={accentColor} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 8px ${accentColor}66)` }} />

            {/* ── SBN Glowing Nodes ── */}
            {sbnPoints.map((pt, i) => {
              const tenor = tenures[i];
              const isHovered = hoveredTenor === tenor;

              return (
                <g
                  key={`sbn-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTenor(tenor)}
                  onMouseLeave={() => setHoveredTenor(null)}
                >
                  {/* Layer 1: outer glow ring — hover only */}
                  <circle
                    cx={pt.x} cy={pt.y} r={10}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={1}
                    strokeOpacity={isHovered ? 0.3 : 0}
                    style={{ transition: "stroke-opacity 200ms ease" }}
                  />

                  {/* Layer 2: middle pulse ring — animated ping */}
                  <circle
                    cx={pt.x} cy={pt.y} r={6}
                    fill={accentColor}
                    fillOpacity={0.15}
                    className={isHovered ? "animate-node-ping" : ""}
                  />

                  {/* Layer 3: core dot */}
                  <circle
                    cx={pt.x} cy={pt.y} r={4}
                    fill="#000"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
                  />

                  {/* Yield label */}
                  <text
                    x={pt.x} y={pt.y - 12}
                    textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace"
                    style={{ pointerEvents: "none" }}
                  >
                    {(sbnYields[i] ?? 0).toFixed(2)}%
                  </text>
                </g>
              );
            })}

            {/* UST Nodes (simple) */}
            {ustPoints.map((pt, i) => (
              <g key={`u-${i}`}>
                <circle cx={pt.x} cy={pt.y} r="3" fill="#6b7280" stroke="#000" strokeWidth="1" />
                <text x={pt.x} y={pt.y + 12} textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="monospace">{ustYields[i].toFixed(2)}%</text>
              </g>
            ))}

            {/* ── Floating Spread Tooltip ── */}
            {hoveredTenor && (() => {
              const idx = tenures.indexOf(hoveredTenor);
              const node = sbnPoints[idx];
              const sd = spreadData[idx];
              if (!node || !sd) return null;

              return (
                <foreignObject
                  x={node.x - 64}
                  y={node.y - 88}
                  width={128}
                  height={80}
                  style={{ overflow: "visible", pointerEvents: "none" }}
                >
                  <div
                    className="tooltip-animated"
                    style={{
                      background: "var(--as-bg-primary)",
                      border: "1px solid var(--as-border-primary)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      fontFamily: "monospace",
                    }}
                  >
                    <div style={{ fontSize: "9px", color: "var(--as-text-tertiary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {hoveredTenor} TENOR
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "900", color: accentColor, marginTop: "2px" }}>
                      SBN {sd.sbn}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#3b82f6", marginTop: "1px" }}>
                      UST {sd.ust}%
                    </div>
                    <div style={{
                      marginTop: "6px",
                      paddingTop: "6px",
                      borderTop: "1px solid var(--as-border-primary)",
                      fontSize: "10px",
                      color: sd.spread > 200 ? accentColor : "#f59e0b",
                    }}>
                      SPREAD +{sd.spread}bps
                    </div>
                  </div>
                </foreignObject>
              );
            })()}
          </svg>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 rounded" style={{ backgroundColor: accentColor }} /> SBN Indonesia</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-neutral-500" /> US Treasury</span>
          <span className="ml-auto text-neutral-700">ACTIVE: {scenarioId.toUpperCase()}</span>
        </div>
      </div>

      {/* 4x4 Correlation Matrix */}
      <div className="card-tier-2 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--as-text-primary)]"><ActivitySquare size={16} className="text-blue-400" /><span className="font-bold tracking-wide text-sm uppercase">Macro Correlation Matrix</span></div>
          <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider">Click cell for qualitative macro risk definition analysis</p>
        </div>

        <div className="overflow-x-auto">
          <table className="font-mono text-[11px] border-collapse mx-auto">
            <thead>
              <tr>
                <th className="p-2 w-20" />
                {cL.map(l => (
                  <th key={l} className="p-2 text-center text-slate-500 dark:text-neutral-400 font-bold w-20">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cL.map((row, ri) => (
                <tr key={row}>
                  <td className="p-2 text-right text-slate-500 dark:text-neutral-400 font-bold">{row}</td>
                  {cD[ri].map((val, ci) => {
                    const ck = ri < ci ? `${ri}-${ci}` : `${ci}-${ri}`;
                    const isDiag = ri === ci;
                    const isSelected = selectedCell === ck;
                    return (
                      <td
                        key={ci}
                        onClick={() => !isDiag && setSelectedCell(isSelected ? null : ck)}
                        className={`p-3 text-center font-bold cursor-pointer transition-all border border-slate-200 dark:border-neutral-900/40 rounded ${
                          isDiag ? "text-neutral-700 bg-transparent" : "hover:scale-[1.05]"
                        } ${isSelected ? "ring-2 ring-white/60 bg-white/5" : ""}`}
                        style={{
                          color: isDiag ? "#444" : getCellColor(val),
                          backgroundColor: isDiag ? "transparent" : `${getCellColor(val)}11`
                        }}
                      >
                        {isDiag ? "—" : val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCell && cI[selectedCell] && (
          <div className="p-4 bg-white dark:bg-neutral-900/40 border border-slate-300 dark:border-neutral-800 rounded-lg text-xs leading-relaxed text-slate-700 dark:text-neutral-300 font-mono animate-fadeIn">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">INTERPRETASI</span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500">Cell {selectedCell.split("-").map(i => cL[i]).join(" vs ")}</span>
            </div>
            <p>{cI[selectedCell]}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default SovereignYieldCurve;
