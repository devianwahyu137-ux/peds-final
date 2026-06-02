import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare, Globe, Briefcase, Zap } from "lucide-react";
import { memo, useState, useEffect, useCallback } from "react";
import { useRootStore } from "@/stores/rootStore";
import { exportTearSheetPDF } from "@/lib/tearSheetExporter";
import { NavHealthIndicator } from "../NavHealthIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

const NAV_ITEMS = [
  {
    id: "home",
    label: "BERANDA",
    sublabel: "Ringkasan Cepat",
    icon: <Zap size={16} className="text-yellow-400" />,
  },
  {
    id: "market",
    label: "KONDISI PASAR",
    sublabel: "Makroekonomi Live",
    icon: <Globe size={16} className="text-blue-400" />,
  },
  {
    id: "portfolio",
    label: "PORTOFOLIOMU",
    sublabel: "Alokasi Aset",
    icon: <Briefcase size={16} className="text-amber-600" />,
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
  const activeTab   = useRootStore((s) => s.activeTab);
  const setTab      = useRootStore((s) => s.setActiveTab);
  const scenarioId  = useRootStore((s) => s.scenarioId);
  const crisisMode  = useRootStore((s) => s.crisisMode);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);

  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg,   setExportMsg]   = useState('');

  // Grab isDark from the global theme hook we just built
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const theme = SCENARIO_THEME[effectiveScenario] || SCENARIO_THEME.EQUILIBRIUM;

  const handleExport = useCallback(() => {
    exportTearSheetPDF({
      scenarioId,
      weights,
      analytics,
      macroInputs,
      onStart: () => { setIsExporting(true); setExportMsg(''); },
      onDone:  () => { setIsExporting(false); setExportMsg('✓ Tersimpan'); setTimeout(() => setExportMsg(''), 3000); },
      onError: (err) => { setIsExporting(false); setExportMsg(`✗ ${err}`); },
    });
  }, [scenarioId, weights, analytics, macroInputs]);

  return (
    <>
    <nav
      className="shrink-0 w-full z-40 border-b border-slate-200 dark:border-neutral-800/60 transition-colors duration-300"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "var(--as-navbar-bg)" }}
    >
      {/* Top Branding & Controls Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b" style={{ background: 'var(--as-bg-page)', borderColor: 'var(--as-border-primary)' }}>

        {/* Left Section (Branding) */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
            <Shield className="text-indigo-400" size={24} />
          </div>
          <span className="font-bold tracking-wider text-sm uppercase hidden md:block" style={{ color: 'var(--as-text-primary)' }}>
            AlphaShield PEDS Core System v3.8
          </span>
        </div>

        {/* Right Section (Controls & Status) */}
        <div className="flex items-center gap-6">
          {/* Status Portfolio */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                style={{ backgroundColor: theme.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: theme.color }}
              />
            </span>
            <span
              className="text-[10px] font-mono font-bold tracking-widest whitespace-nowrap"
              style={{ color: theme.color }}
            >
              STATUS PORTOFOLIO: {theme.label}
            </span>
          </div>

          <ThemeToggle />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex-shrink-0"
              style={{
                background:  isExporting ? 'var(--as-bg-tertiary)' : 'rgba(16,185,129,0.10)',
                borderColor: isExporting ? '#333' : 'rgba(16,185,129,0.40)',
                color:       isExporting ? 'var(--as-text-tertiary)' : '#10b981',
              }}
            >
              <span>{isExporting ? '⟳' : '⬇'}</span>
              <span>{isExporting ? 'GENERATING...' : 'DOWNLOAD TEAR SHEET'}</span>
            </button>
            {exportMsg && (
              <span className="text-[9px] font-mono hidden md:block" style={{ color: exportMsg.startsWith('✓') ? '#10b981' : '#ef4444' }}>
                {exportMsg}
              </span>
            )}
          </div>
          
          <NavHealthIndicator />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="hidden md:flex items-stretch overflow-x-auto scrollbar-hide px-2 whitespace-nowrap md:whitespace-normal">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-start px-4 md:px-6 py-3.5
                         transition-all duration-200
                         cursor-pointer flex-shrink-0 text-left
                         min-w-[100px] md:min-w-0 md:flex-1 hover:bg-slate-50 dark:hover:bg-transparent"
              style={{
                borderBottom: isActive ? `3px solid ${theme.color}` : '3px solid transparent',
                background: isActive ? 'var(--as-bg-hover)' : 'transparent',
                minHeight: '52px'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <span
                  className="text-[9px] md:text-[10px] font-mono font-bold
                             tracking-[0.1em] md:tracking-widest uppercase
                             whitespace-nowrap transition-colors duration-200"
                  style={{ color: isActive ? theme.color : 'var(--as-text-dim)' }}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-mono mt-0.5 hidden lg:block
                               whitespace-nowrap transition-colors duration-300"
                    style={{ color: 'var(--as-text-dim)' }}>
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    
    {/* ── MOBILE BOTTOM TAB BAR — md:hidden ── */}
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50
                 flex items-stretch border-t safe-area-pb"
      style={{
        background:   'var(--as-navbar-bg)',
        borderColor:  'var(--as-navbar-border)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className="flex-1 flex flex-col items-center justify-center
                       py-2.5 cursor-pointer transition-all duration-150
                       relative"
            style={{ minHeight: '56px' }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2
                           w-12 h-0.5 rounded-full"
                style={{ background: theme.color }}
              />
            )}

            {/* Icon */}
            <span className="text-lg mb-0.5">{item.icon}</span>

            {/* Label */}
            <span
              className="text-[9px] font-mono font-bold tracking-wider"
              style={{ color: isActive ? theme.color : 'var(--as-text-dim)' }}
            >
              {item.label.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </nav>
    </>
  );
});
