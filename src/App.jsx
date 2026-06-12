// src/App.jsx — complete file
import { lazy, Suspense, Component, useState } from 'react';
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore } from '@/stores/rootStore';
import { TickerBar }    from '@/components/Navigation/TickerBar';
import { TopNavbar }    from '@/components/Navigation/TopNavbar';
import { ScenarioBriefingOverlay }
  from '@/components/ScenarioBriefingOverlay';
import { SessionResumeBanner }
  from '@/components/SessionResumeBanner';
import { useScenarioPulse }
  from '@/hooks/useScenarioPulse';
import { usePortfolioPersistence }
  from '@/hooks/usePortfolioPersistence';
import { useLiveMarketData }
  from '@/hooks/useLiveMarketData';
import { useTheme } from '@/hooks/useTheme';

import FloatingCopilotTrigger from '@/components/FloatingCopilotTrigger';
import CopilotDrawer from '@/components/CopilotDrawer';
import { AlertBanner } from '@/components/AlertSystem/AlertBanner';

// Lazy load all pages
const HomePage      = lazy(() => import('@/pages/HomePage'));
const MarketPage    = lazy(() => import('@/pages/MarketPage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const StrategyPage  = lazy(() => import('@/pages/StrategyPage'));
const AnalysisPage  = lazy(() => import('@/pages/AnalysisPage'));

// Error boundary component — catches render errors per-page
class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[AlphaShield] Page render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center
                        min-h-[60vh] gap-4">
          <div className="text-[10px] font-sans text-red-500
                          tracking-widest uppercase">
            <AlertTriangle size={16} className="text-amber-500" /> ERROR MEMUAT HALAMAN
          </div>
          <div className="text-[9px] font-sans text-slate-600 dark:text-neutral-400
                          max-w-md text-center leading-relaxed">
            {this.state.error?.message ?? 'Unknown render error'}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="text-[9px] font-sans px-4 py-3 min-h-[44px] inline-flex items-center justify-center rounded-lg
                       border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-400
                       hover:border-slate-400 dark:hover:border-neutral-500 cursor-pointer
                       transition-colors"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border border-slate-200 dark:border-neutral-700
                        border-t-emerald-500 rounded-full
                        animate-spin" />
        <div className="text-[9px] font-sans text-slate-500 dark:text-neutral-700
                        tracking-widest animate-pulse">
          MEMUAT MODUL...
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useTheme();
  
  // Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState("");
  
  // Initialize mock chat history
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Halo! Saya AlphaShield Quant Copilot. Ada yang bisa saya bantu terkait analisis portofolio atau simulasi makro saat ini?' }
  ]);

  const activeTab = useRootStore((s) => s.activeTab);
  const scenarioIdGlobal = useRootStore((s) => s.scenarioId);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const targetAnalytics = useRootStore((s) => s.targetAnalytics || s.analytics || {});

  // Global hooks — run once at root
  useLiveMarketData();

  const {
    showOverlay,
    dismissOverlay,
    scenarioId,
  } = useScenarioPulse();

  const {
    savedSession,
    showBanner,
    resumeSession,
    dismissBanner,
    clearSession,
  } = usePortfolioPersistence();

  // Tab → Component mapping
  const PAGE_MAP = {
    home:      HomePage,
    market:    MarketPage,
    portfolio: PortfolioPage,
    strategy:  StrategyPage,
    analysis:  AnalysisPage,
  };

  const PageComponent = PAGE_MAP[activeTab] ?? HomePage;

  // STEALTH CONTEXT FUNCTION
  // This string will be prepended to user's prompt before sending to the future AI API
  const generateStealthContext = () => {
    const sr = targetAnalytics?.sharpeRatio ?? targetAnalytics?.sharpe ?? 0;
    const rate = macroInputs?.biRate ?? 5.50;
    return `[SYSTEM CONTEXT - DO NOT SHOW USER] Current Portfolio Status: ${scenarioIdGlobal}, BI Rate: ${rate.toFixed(2)}%, Sharpe Ratio: ${sr.toFixed(2)}`;
  };

  const handleCopilotSubmit = (text) => {
    // Append user message to chat history
    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);
    
    // Auto-open drawer if submitting from trigger capsule
    if (!isCopilotOpen) {
      setIsCopilotOpen(true);
    }
  };

  const handleSuggestionClick = (text) => {
    setCopilotInput(text);
    setIsCopilotOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[var(--as-bg-secondary)] dark:text-neutral-100 overflow-hidden transition-colors duration-300">

      {/* Fixed ticker bar — z-50 */}
      <div className="print:hidden shrink-0">
        <TickerBar />
      </div>

      {/* Fixed top navbar — z-[60], below ticker */}
      <div className="print:hidden shrink-0 relative z-[60]">
        <TopNavbar />
      </div>

      <main
        className="flex-1 overflow-y-auto pb-32 md:pb-24 pt-12 w-full max-w-[1600px] mx-auto
                   overflow-x-hidden px-4 md:px-6 lg:px-8
                   print:overflow-visible print:pt-0 print:px-0 print:pb-0 print:w-full print:block"
      >
        <AlertBanner />
        <PageErrorBoundary key={activeTab}>
          <Suspense fallback={<PageSkeleton />}>
            <div
              key={activeTab}
              className="w-full fade-in-up"
              style={{ animationDuration: '250ms' }}
            >
              <PageComponent />
            </div>
          </Suspense>
        </PageErrorBoundary>
      </main>

      {/* AlphaShield Copilot Trigger Capsule */}
      <div className="print:hidden">
        <FloatingCopilotTrigger 
          isVisible={!isCopilotOpen}
          onOpen={() => setIsCopilotOpen(true)}
          onSuggestionClick={handleSuggestionClick}
          inputValue={copilotInput}
          setInputValue={setCopilotInput}
          onSubmit={handleCopilotSubmit}
        />
      </div>

      {/* AlphaShield Copilot Right Drawer */}
      <div className="print:hidden">
        <CopilotDrawer 
          isOpen={isCopilotOpen} 
          onClose={() => setIsCopilotOpen(false)}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      </div>

      {/* Scenario briefing overlay */}
      <ScenarioBriefingOverlay
        scenarioId={scenarioId}
        isVisible={showOverlay}
        onDismiss={dismissOverlay}
      />

      {/* Session resume banner */}
      {showBanner && savedSession && (
        <SessionResumeBanner
          savedSession={savedSession}
          onResume={resumeSession}
          onDismiss={dismissBanner}
          onClear={clearSession}
        />
      )}
    </div>
  );
}