import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare, Globe, Briefcase, Zap, Bell, Download, Loader2 } from "lucide-react";
import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRootStore, APP_VERSION } from "@/stores/rootStore";
import { exportTearSheetPDF } from "@/lib/tearSheetExporter";
import { NavHealthIndicator } from "../NavHealthIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertSettings } from "@/components/AlertSystem/AlertSettings";
import { useTheme } from "@/hooks/useTheme";
import { SCENARIO_CONFIG } from "@/lib/scenarioPulse";
import { computeHealthScore } from "@/lib/healthScoreEngine";
import { getScenarioMismatch } from "@/lib/scenarioDetector";

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
    sublabel: "Riset & Catatan Makro",
    icon: <LineChart size={16} className="text-blue-400" />,
  },
];



export const TopNavbar = memo(function TopNavbar() {
  const activeTab   = useRootStore((s) => s.activeTab);
  const setTab      = useRootStore((s) => s.setActiveTab);
  const scenarioId  = useRootStore((s) => s.scenarioId);
  const crisisMode  = useRootStore((s) => s.crisisMode);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const liveData    = useRootStore((s) => s.liveData);

  const [isExporting, setIsExporting] = useState(false);
  const [exportMsg,   setExportMsg]   = useState('');
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false);
  const alertRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (alertRef.current && !alertRef.current.contains(e.target)) {
        setAlertSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Grab isDark from the global theme hook we just built
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  const effectiveScenario = crisisMode
    ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
    : scenarioId;
  const config = SCENARIO_CONFIG[effectiveScenario] || SCENARIO_CONFIG.EQUILIBRIUM;
  const theme = {
    color: config.color,
    label: config.riskBadge,
    bg: config.colorDim
  };

  // Build macro snapshot for mismatch detection
  const macroData = useMemo(() => ({
    biRate: liveData?.bi_macro?.biRate  ?? macroInputs?.biRate    ?? 5.50,
    cpi:    liveData?.bi_macro?.cpi     ?? macroInputs?.inflation ?? 3.08,
    usdIdr: liveData?.usdIdr?.v         ?? macroInputs?.usdIdr    ?? 17700,
    dxy:    liveData?.dxy?.v            ?? 104.5,
  }), [liveData, macroInputs]);

  // Compute mismatch for DIM 5
  const mismatch = useMemo(
    () => getScenarioMismatch(scenarioId, macroData),
    [scenarioId, macroData]
  );

  // Compute final health score & grade
  const portfolioHealth = useMemo(
    () => computeHealthScore({ analytics, mismatch }),
    [analytics, mismatch]
  );

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
      className="shrink-0 w-full relative z-[60] border-b border-slate-200 dark:border-neutral-800/60 transition-colors duration-300"
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "var(--as-navbar-bg)" }}
    >
      {/* Top Branding & Controls Bar */}
      <div className="flex items-center justify-between w-full px-6 py-3.5 border-b" style={{ background: 'var(--as-bg-page)', borderColor: 'var(--as-border-primary)' }}>

        {/* Left Section (Branding) */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
            <Shield className="text-indigo-400" size={24} />
          </div>
          <span className="font-bold tracking-wider text-sm uppercase hidden md:block" style={{ color: 'var(--as-text-primary)' }}>
            AlphaShield PEDS Core System {APP_VERSION}
          </span>
        </div>

        {/* Right Section (Controls & Status) */}
        <div className="flex items-center gap-6">
          {/* Status Portfolio */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                style={{ backgroundColor: portfolioHealth.grade.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: portfolioHealth.grade.color }}
              />
            </span>
            <span
              className="text-[10px] font-sans font-bold tracking-widest whitespace-nowrap"
              style={{ color: portfolioHealth.grade.color }}
            >
              STATUS PORTOFOLIO: {portfolioHealth.grade.label}
            </span>
          </div>

          <ThemeToggle />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-sans font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex-shrink-0"
              style={{
                background:  isExporting ? 'var(--as-bg-tertiary)' : 'rgba(16,185,129,0.10)',
                borderColor: isExporting ? '#333' : 'rgba(16,185,129,0.40)',
                color:       isExporting ? 'var(--as-text-tertiary)' : '#10b981',
              }}
            >
              <span className="flex items-center justify-center">{isExporting ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />}</span>
              <span>{isExporting ? 'GENERATING...' : 'DOWNLOAD TEAR SHEET'}</span>
            </button>
            {exportMsg && (
              <span className="text-[9px] font-sans hidden md:block" style={{ color: exportMsg.startsWith('✓') ? '#10b981' : '#ef4444' }}>
                {exportMsg}
              </span>
            )}
          </div>
          <div className="relative" ref={alertRef}>
            <button
              onClick={() => setAlertSettingsOpen(p => !p)}
              className="relative p-3 rounded-lg cursor-pointer transition-colors hover:text-white flex items-center justify-center min-w-[44px] min-h-[44px]"
              style={{ color: 'var(--as-text-dim)' }}
              title="Pengaturan Alert"
            >
              <Bell size={18} />
            </button>
            <AlertSettings
              isOpen={alertSettingsOpen}
              onClose={() => setAlertSettingsOpen(false)}
            />
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
                  className="text-[9px] md:text-[10px] font-sans font-bold
                             tracking-[0.1em] md:tracking-widest uppercase
                             whitespace-nowrap transition-colors duration-200"
                  style={{ color: isActive ? theme.color : 'var(--as-text-dim)' }}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-[7px] md:text-[8px] font-sans mt-0.5 hidden lg:block
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
              className="text-[9px] font-sans font-bold tracking-wider truncate max-w-full px-0.5 block text-center"
              style={{ color: isActive ? theme.color : 'var(--as-text-dim)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
    </>
  );
});
