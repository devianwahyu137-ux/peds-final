import { lazy, Suspense } from "react";
import { TickerBar } from "./components/Navigation/TickerBar";
import { TopNavbar } from "./components/Navigation/TopNavbar";
import { useNavigationStore } from "./stores/navigationStore";
import { useLiveMarketData } from "./hooks/useLiveMarketData";
import { ScenarioBriefingOverlay } from "./components/ScenarioBriefingOverlay";
import { useScenarioPulse } from "./hooks/useScenarioPulse";
import { usePortfolioPersistence } from "./hooks/usePortfolioPersistence";
import { SessionResumeBanner } from "./components/SessionResumeBanner";

// Lazy load all pages for performance
const HomePage      = lazy(() => import("./pages/HomePage"));
const MarketPage    = lazy(() => import("./pages/MarketPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const StrategyPage  = lazy(() => import("./pages/StrategyPage"));
const AnalysisPage  = lazy(() => import("./pages/AnalysisPage"));

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-[10px] font-mono text-neutral-700 tracking-widest animate-pulse">
        LOADING MODULE...
      </div>
    </div>
  );
}

const PAGE_MAP = {
  home:      HomePage,
  market:    MarketPage,
  portfolio: PortfolioPage,
  strategy:  StrategyPage,
  analysis:  AnalysisPage,
};

export default function App() {
  const activeTab = useNavigationStore((s) => s.activeTab);

  // Activate live data polling — once at root
  useLiveMarketData();

  // Scenario Pulse Engine — overlay + transition state
  const { showOverlay, isTransitioning, dismissOverlay, scenarioId } =
    useScenarioPulse();

  // IndexedDB Persistence — auto-save + session resume
  const {
    savedSession,
    showBanner,
    resumeSession,
    dismissBanner,
    clearSession,
  } = usePortfolioPersistence();

  const ActivePage = PAGE_MAP[activeTab] || HomePage;

  return (
    <div className="min-h-screen bg-black text-white font-mono antialiased">
      {/* Ticker bar — fixed top, z-50 */}
      <TickerBar />

      {/* Top navbar — fixed, below ticker */}
      <TopNavbar />

      {/* Main content — offset for ticker (~32px) + navbar (~72px) */}
      <main className="pt-[112px] px-4 md:px-8 pb-12 max-w-7xl mx-auto overflow-visible">
        <Suspense fallback={<PageSkeleton />}>
          <ActivePage />
        </Suspense>

        {/* GOVERNANCE COMPLIANCE FOOTER */}
        <footer className="border-t border-neutral-900 mt-12 py-6 text-center text-[9px] text-neutral-600 tracking-widest uppercase space-y-1 font-mono">
          <div>EDUCATIONAL SIMULATION MODEL ONLY | NOT INVESTMENT ADVICE.</div>
          <div>COMPLIANT WITH OJK SIMULATION FRAMEWORK STANDARDS.</div>
          <div className="text-neutral-800 mt-2">PEDS ALPHASHIELD ENGINE v3.3 | ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES.</div>
        </footer>
      </main>

      {/* Scenario Pulse — briefing overlay on scenario change */}
      <ScenarioBriefingOverlay
        scenarioId={scenarioId}
        isVisible={showOverlay}
        onDismiss={dismissOverlay}
      />

      {/* Session Resume Banner — appears if saved portfolio state exists */}
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