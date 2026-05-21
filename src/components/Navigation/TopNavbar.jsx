import { memo } from "react";
import { useNavigationStore } from "../../stores/navigationStore";
import { useDataStore } from "../../stores/alphaShieldStore";

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
  const activeTab  = useNavigationStore((s) => s.activeTab);
  const setTab     = useNavigationStore((s) => s.setTab);
  const scenarioId = useDataStore((s) => s.scenarioId);
  const crisisMode = useDataStore((s) => s.crisisMode);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const theme = SCENARIO_THEME[effectiveScenario] || SCENARIO_THEME.EQUILIBRIUM;

  return (
    <nav
      className="fixed top-8 left-0 right-0 z-40 border-b border-neutral-800/60"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {/* Risk Status Bar */}
      <div
        className="flex items-center justify-between px-6 py-1.5 border-b border-neutral-800/40"
        style={{ background: theme.bg }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
              style={{ backgroundColor: theme.color }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ backgroundColor: theme.color }}
            />
          </span>
          <span
            className="text-[9px] font-mono font-bold tracking-[0.2em]"
            style={{ color: theme.color }}
          >
            STATUS PORTOFOLIO: {theme.label}
          </span>
        </div>
        <span className="text-[9px] font-mono text-neutral-600 hidden sm:inline">
          AlphaShield PEDS Core System v3.1
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-stretch px-2 sm:px-4 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`
                flex flex-col items-start px-3 sm:px-4 py-3 border-b-2 transition-all duration-200
                cursor-pointer min-w-0 flex-1 text-left
                ${isActive
                  ? "bg-white/[0.02]"
                  : "border-transparent hover:border-neutral-700 hover:bg-white/[0.01]"
                }
              `}
              style={isActive ? { borderBottomColor: theme.color } : { borderBottomColor: "transparent" }}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-xs">{item.icon}</span>
                <span
                  className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase truncate"
                  style={{ color: isActive ? theme.color : "#525252" }}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-[8px] font-mono text-neutral-700 mt-0.5 hidden md:block">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
