import { memo } from "react";
import { useRootStore } from "@/stores/rootStore";

import { NavHealthIndicator } from "../NavHealthIndicator";

const NAV_ITEMS = [
  {
    id: "home",
    label: "BERANDA",
    sublabel: "Ringkasan Cepat",
    icon: "⚡",
  },
  {
    id: "market",
    label: "KONDISI PASAR",
    sublabel: "Makroekonomi Live",
    icon: "🌐",
  },
  {
    id: "portfolio",
    label: "PORTOFOLIOMU",
    sublabel: "Alokasi Aset",
    icon: "💼",
  },
  {
    id: "strategy",
    label: "STRATEGI",
    sublabel: "Rebalancing",
    icon: "⚖️",
  },
  {
    id: "analysis",
    label: "ANALISIS",
    sublabel: "Riset & Berita",
    icon: "📊",
  },
];

const SCENARIO_THEME = {
  EQUILIBRIUM:     { color: "#10b981", label: "AMAN",    bg: "rgba(16,185,129,0.08)"  },
  TIGHTENING:      { color: "#f59e0b", label: "WASPADA", bg: "rgba(245,158,11,0.08)"  },
  CURRENCY_STRESS: { color: "#ef4444", label: "KRISIS",  bg: "rgba(239,68,68,0.08)"   },
};

export const TopNavbar = memo(function TopNavbar() {
  const activeTab  = useRootStore((s) => s.activeTab);
  const setTab     = useRootStore((s) => s.setActiveTab);
  const scenarioId = useRootStore((s) => s.scenarioId);
  const crisisMode = useRootStore((s) => s.crisisMode);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const theme = SCENARIO_THEME[effectiveScenario] || SCENARIO_THEME.EQUILIBRIUM;

  return (
    <nav
      className="shrink-0 w-full z-40 border-b border-neutral-800/60"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {/* Risk Status Bar */}
      <div className="flex items-center justify-between px-4 md:px-6
                      py-1.5 border-b border-neutral-800/40"
           style={{ background: theme.bg, minHeight: '28px' }}>

        {/* Left: portfolio status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full
                         rounded-full opacity-50"
              style={{ backgroundColor: theme.color }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: theme.color }}
            />
          </span>
          <span
            className="text-[9px] font-mono font-bold tracking-[0.15em]
                       whitespace-nowrap"
            style={{ color: theme.color }}
          >
            STATUS PORTOFOLIO: {theme.label}
          </span>
        </div>

        {/* Right: health + system label + export button */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase border border-neutral-700/60 text-neutral-400 rounded hover:text-white hover:border-neutral-500 transition-colors cursor-pointer bg-neutral-900/40"
          >
            <span>🖨️</span> EXPORT TEAR SHEET
          </button>
          <NavHealthIndicator />
          <span className="text-[8px] font-mono text-neutral-700
                           tracking-widest hidden xl:block whitespace-nowrap">
            AlphaShield PEDS Core System v3.4
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-stretch overflow-x-auto
                      scrollbar-hide px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-start px-4 md:px-5 py-3
                         border-b-2 transition-all duration-200
                         cursor-pointer flex-shrink-0 text-left
                         min-w-[100px] md:min-w-0 md:flex-1"
              style={isActive
                ? { borderBottomColor: theme.color, background: 'rgba(255,255,255,0.015)' }
                : { borderBottomColor: 'transparent' }
              }
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs flex-shrink-0">{item.icon}</span>
                <span
                  className="text-[9px] md:text-[10px] font-mono font-bold
                             tracking-[0.1em] md:tracking-widest uppercase
                             whitespace-nowrap"
                  style={{ color: isActive ? theme.color : '#525252' }}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-mono
                               text-neutral-700 mt-0.5 hidden md:block
                               whitespace-nowrap">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
