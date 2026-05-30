import { useState, useEffect } from "react";
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import MasterDetailLayout from "./components/MasterDetailLayout";
import SovereignYieldCurve from "./components/SovereignYieldCurve";
import SectorRotationCards from "./components/SectorRotationCards";
import DriftMonitor from "./components/DriftMonitor";
import RebalancingCalculator from "./components/RebalancingCalculator";
import { useLiveMarketData } from "./hooks/useLiveMarketData";
import MacroIndicatorCards from "./components/MacroIndicatorCards";
import MacroNewsCards from "./components/MacroNewsCards";

// Accent style configurations
const ACCENT = {
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

const ASSET_CONFIG = {
  stocks: { label: "EQUITIES", sublabel: "Stocks", icon: <TrendingUp size={16} className="text-emerald-400" />, color: "#3b82f6", colorDim: "rgba(59,130,246,0.15)" },
  bonds: { label: "FIXED INCOME", sublabel: "Bonds", icon: <Landmark size={16} className="text-indigo-400" />, color: "#a78bfa", colorDim: "rgba(167,139,250,0.15)" },
  gold: { label: "PRECIOUS METALS", sublabel: "Gold", icon: <Coins size={16} className="text-amber-400" />, color: "#fbbf24", colorDim: "rgba(251,191,36,0.15)" },
  cash: { label: "LIQUIDITY", sublabel: "Cash / USD", icon: <Wallet size={16} className="text-emerald-400" />, color: "#34d399", colorDim: "rgba(52,211,153,0.15)" }
};


function AllocationRow({ assetKey, pct }) {
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

function ScenarioButton({ scenario, isActive, onClick }) {
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

/**
 * DonutChart with center overlay showing Sharpe + Beta from store analytics.
 * On segment hover: shows asset name + percentage instead.
 * SVG segments use svg-segment CSS class for proper transform-box.
 */
function DonutChart({ accentColor, hovered, setHovered, animPct, analytics }) {
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

        {/* ── Center Overlay: Sharpe + Beta from store / Asset detail on hover ── */}
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

export default function AlphaShield() {
  useLiveMarketData(); // Start background live market data polling cycle
  const [activeTab, setActiveTab] = useState("portfolio");
  const [timestamp, setTimestamp] = useState("");
  const [hoveredAsset, setHoveredAsset] = useState(null);

  // Subscribe directly to useDataStore central slice
  const {
    scenarioId,
    crisisMode,
    targetWeights,
    macroInputs,
    targetAnalytics,
    setScenario,
    setCrisisMode
  } = useRootStore();

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimestamp(`${d.toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })} | ${d.toLocaleTimeString("id-ID")} WIB`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const baseScenario = SCENARIOS[scenarioId] || SCENARIOS.EQUILIBRIUM;
  const currentAccent = crisisMode ? "red" : baseScenario.accent;
  
  const acc = ACCENT[currentAccent];

  // Donut chart animations
  const [animPct, setAnimPct] = useState({ stocks: 0, bonds: 0, gold: 0, cash: 0 });
  useEffect(() => {
    const handle = setTimeout(() => {
      setAnimPct({ ...targetWeights });
    }, 0);
    return () => clearTimeout(handle);
  }, [targetWeights]);

  return (
    <div className="flex min-h-screen bg-black text-white font-mono antialiased">
      
      {/* SIDEBAR NAVIGATION AREA */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950 p-5 flex flex-col justify-between hidden lg:flex shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-2 pb-4 border-b border-neutral-900">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center font-bold text-xs" style={{ color: acc.neon, border: `1px solid ${acc.neon}33` }}>α</div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider">AlphaShield</div>
              <div className="text-[9px] text-neutral-600 tracking-widest uppercase">PEDS CORE SYSTEM v3.0</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { id: "portfolio", label: "PORTFOLIO_MATRIX", icon: <LineChart size={16} className="text-blue-400" /> },
              { id: "macro", label: "MACRO_INTELLIGENCE", icon: "🌎" },
              { id: "rebalancing", label: "ASSET_REBALANCING", icon: <Settings2 size={16} className="text-slate-400" /> }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border flex items-center gap-2.5 transition-all cursor-pointer ${activeTab === item.id ? `bg-neutral-900 border-neutral-700/60 ${acc.text}` : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-300"}`}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[9px] text-neutral-700 tracking-wider border-t border-neutral-900 pt-4">SYSTEM_ONLINE // DEPLOYED</div>
      </aside>

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-1 overflow-y-auto pb-12">
        {/* Hardware-Accelerated Marquee Ticker */}
        <div className="w-full overflow-hidden bg-neutral-950/80 border-b border-neutral-900 py-2 flex items-center">
          <div className="animate-ticker-ha flex gap-8 text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
            <span>BBCA IDR 10.150 (+0.45%)</span>
            <span>BMRI IDR 6.850 (-0.20%)</span>
            <span>BBRI IDR 4.720 (0.00%)</span>
            <span>TLKM IDR 3.940 (+1.10%)</span>
            <span>SBN 10Y {(macroInputs.sbn10y || 0).toFixed(2)}%</span>
            <span>DXY {(macroInputs.dxy || 0).toFixed(2)}</span>
            <span>GOLD VAULT USD 2.342 (+1.15%)</span>
            <span>BI RATE {(macroInputs.biRate || 0).toFixed(2)}%</span>
            {/* Duplicate content to ensure seamless loop */}
            <span>BBCA IDR 10.150 (+0.45%)</span>
            <span>BMRI IDR 6.850 (-0.20%)</span>
            <span>BBRI IDR 4.720 (0.00%)</span>
            <span>TLKM IDR 3.940 (+1.10%)</span>
            <span>SBN 10Y {(macroInputs.sbn10y || 0).toFixed(2)}%</span>
            <span>DXY {(macroInputs.dxy || 0).toFixed(2)}</span>
            <span>GOLD VAULT USD 2.342 (+1.15%)</span>
            <span>BI RATE {(macroInputs.biRate || 0).toFixed(2)}%</span>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-neutral-900 pb-6 mb-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase">THE PEDS ALPHASHIELD <span style={{ color: acc.neon }}>// {activeTab}</span></h1>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Macro-Driven Personal Asset Allocation System</p>
            </div>
            <div className="text-[10px] text-neutral-600 tabular-nums">{timestamp}</div>
          </div>

          {/* TAB 1: PORTFOLIO MAIN BLOCK */}
          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Left Side: Scenario and Macro Indicators */}
                <div className="xl:col-span-5 space-y-4">
                  <div className="glass-card rounded-xl p-4">
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-3">Scenario Core Engine</div>
                    <div className="space-y-2">
                      {Object.values(SCENARIOS).map((sc) => (
                        <ScenarioButton
                          key={sc.id}
                          scenario={sc}
                          isActive={scenarioId === sc.id && !crisisMode}
                          onClick={() => setScenario(sc.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── GLASSMORPHIC MACRO INDICATOR CARDS ── */}
                  <MacroIndicatorCards />

                  <div className="border border-red-950 bg-red-950/5 rounded-xl p-4 space-y-2">
                    <div className="text-[9px] text-red-500 uppercase tracking-widest font-bold">Black Swan Stress Testing Array</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setCrisisMode(crisisMode === "HYPERINFLATION" ? null : "HYPERINFLATION")} className={`p-2 rounded border text-[10px] font-bold cursor-pointer transition-all ${crisisMode === "HYPERINFLATION" ? "bg-red-500/20 border-red-500 text-white" : "border-neutral-900 text-neutral-500"}`}>[ 🔥 HYPERINFLATION ]</button>
                      <button onClick={() => setCrisisMode(crisisMode === "RUPIAH_CRASH" ? null : "RUPIAH_CRASH")} className={`p-2 rounded border text-[10px] font-bold cursor-pointer transition-all ${crisisMode === "RUPIAH_CRASH" ? "bg-red-500/20 border-red-500 text-white" : "border-neutral-900 text-neutral-500"}`}>[ <AlertTriangle size={16} className="text-amber-500" /> RUPIAH CRASH ]</button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Donut Chart, Asset Weights list, and MPT Analytics */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="glass-card rounded-xl p-5 overflow-visible">
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-4">Asset Allocation Matrix</div>
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

                  <div className="glass-card rounded-xl p-4">
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-3">Calculated MPT Analytics Engine</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="border border-neutral-900 p-2.5 rounded bg-black/20 font-mono">
                        <div className="text-[8px] text-neutral-600 uppercase">Sharpe Ratio</div>
                        <div className="text-sm font-bold mt-1 text-emerald-400">{targetAnalytics.sharpeRatio.toFixed(2)} σ</div>
                      </div>
                      <div className="border border-neutral-900 p-2.5 rounded bg-black/20 font-mono">
                        <div className="text-[8px] text-neutral-600 uppercase">Portfolio Beta</div>
                        <div className="text-sm font-bold mt-1 text-emerald-400">{targetAnalytics.portfolioBeta.toFixed(2)} β</div>
                      </div>
                      <div className="border border-neutral-900 p-2.5 rounded bg-black/20 font-mono">
                        <div className="text-[8px] text-neutral-600 uppercase">Max Drawdown</div>
                        <div className="text-sm font-bold mt-1 text-red-400">{(targetAnalytics.maxDrawdown * 100).toFixed(1)}%</div>
                      </div>
                      <div className="border border-neutral-900 p-2.5 rounded bg-black/20 font-mono">
                        <div className="text-[8px] text-neutral-600 uppercase">Volatility</div>
                        <div className="text-sm font-bold mt-1 text-neutral-300">{(targetAnalytics.portfolioVolatility * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl p-4 font-mono text-[11px] space-y-2">
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Technical Execution Ledger</div>
                    {baseScenario.ledger.map((ledgerLine, ledgerIndex) => (
                      <div key={ledgerIndex} className="border-l-2 border-neutral-800 pl-3 text-neutral-400">{ledgerLine}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MACRO CURVES & CORRELATION + NEWS */}
          {activeTab === "macro" && (
            <>
              <SovereignYieldCurve />
              <MacroNewsCards />
            </>
          )}

          {/* TAB 3: REBALANCING LAYOUT */}
          {activeTab === "rebalancing" && (
            <MasterDetailLayout
              left={<SectorRotationCards />}
              center={<DriftMonitor />}
              right={<RebalancingCalculator />}
            />
          )}

          {/* GOVERNANCE COMPLIANCE FOOTER */}
          <footer className="border-t border-neutral-900 mt-12 py-6 text-center text-[9px] text-neutral-600 tracking-widest uppercase space-y-1">
            <div>EDUCATIONAL SIMULATION MODEL ONLY | NOT INVESTMENT ADVICE.</div>
            <div>COMPLIANT WITH OJK SIMULATION FRAMEWORK STANDARDS.</div>
            <div className="text-neutral-800 mt-2">PEDS ALPHASHIELD ENGINE v3.0 | ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES.</div>
          </footer>
        </div>
      </main>
    </div>
  );
}