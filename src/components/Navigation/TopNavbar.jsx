import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { useRootStore } from "@/stores/rootStore";
import { exportTearSheet } from "@/lib/tearSheetExporter";
import { TearSheetDocument } from "@/components/TearSheet/TearSheetDocument";
import { NavHealthIndicator } from "../NavHealthIndicator";
import { Sun, Moon } from "lucide-react";

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
    icon: <ActivitySquare size={16} className="text-slate-400" />,
  },
  {
    id: "analysis",
    label: "ANALISIS",
    sublabel: "Riset & Berita",
    icon: <LineChart size={16} className="text-blue-400" />,
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

  const [isExporting, setIsExporting] = useState(false);
  
  // Theme state management
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const theme = SCENARIO_THEME[effectiveScenario] || SCENARIO_THEME.EQUILIBRIUM;

  const handleExport = () => {
    exportTearSheet(
      'tear-sheet-render',
      'AlphaShield_TearSheet',
      () => setIsExporting(true),
      () => { setIsExporting(false); },
      (err) => { setIsExporting(false); console.error('[TearSheet]', err); }
    );
  };

  return (
    <nav
      className="shrink-0 w-full z-40 border-b border-slate-200 dark:border-neutral-800/60 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md transition-colors duration-300"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      {/* Risk Status Bar */}
      <div className="flex items-center justify-between px-4 md:px-6
                      py-1.5 border-b border-slate-200 dark:border-neutral-800/40 transition-colors duration-300"
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

        {/* Right: health + system label + theme toggle + export button */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-neutral-500 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase border rounded transition-all duration-200 cursor-pointer"
            style={{
              background:  isExporting ? 'rgba(0,0,0,0.4)' : 'rgba(16,185,129,0.08)',
              borderColor: isExporting ? '#333' : 'rgba(16,185,129,0.40)',
              color:       isExporting ? '#525252' : '#10b981',
              opacity:     isExporting ? 0.7 : 1,
            }}
          >
            {isExporting ? '⟳ GENERATING PDF...' : '⬇ DOWNLOAD TEAR SHEET'}
          </button>
          <NavHealthIndicator />
          <span className="text-[8px] font-mono text-slate-500 dark:text-neutral-700
                           tracking-widest hidden xl:block whitespace-nowrap transition-colors duration-300">
            AlphaShield PEDS Core System v3.6
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
                         min-w-[100px] md:min-w-0 md:flex-1 hover:bg-slate-50 dark:hover:bg-transparent"
              style={isActive
                ? { borderBottomColor: theme.color, background: isDarkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.02)' }
                : { borderBottomColor: 'transparent' }
              }
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs flex-shrink-0">{item.icon}</span>
                <span
                  className="text-[9px] md:text-[10px] font-mono font-bold
                             tracking-[0.1em] md:tracking-widest uppercase
                             whitespace-nowrap transition-colors duration-200"
                  style={{ color: isActive ? theme.color : (isDarkMode ? '#525252' : '#9ca3af') }}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-mono
                               text-slate-500 dark:text-neutral-700 mt-0.5 hidden md:block
                               whitespace-nowrap transition-colors duration-300">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hidden TearSheetDocument for PDF capture */}
      <TearSheetDocument />
    </nav>
  );
});
