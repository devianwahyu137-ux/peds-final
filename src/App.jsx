// src/App.jsx — complete file
import { lazy, Suspense, Component } from 'react';
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
          <div className="text-[10px] font-mono text-red-500
                          tracking-widest uppercase">
            ⚠ ERROR MEMUAT HALAMAN
          </div>
          <div className="text-[9px] font-mono text-neutral-600
                          max-w-md text-center leading-relaxed">
            {this.state.error?.message ?? 'Unknown render error'}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="text-[9px] font-mono px-4 py-2 rounded-lg
                       border border-neutral-700 text-neutral-400
                       hover:border-neutral-500 cursor-pointer
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
        <div className="w-6 h-6 border border-neutral-700
                        border-t-emerald-500 rounded-full
                        animate-spin" />
        <div className="text-[9px] font-mono text-neutral-700
                        tracking-widest animate-pulse">
          MEMUAT MODUL...
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const activeTab = useRootStore((s) => s.activeTab);

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
    home:      <HomePage />,
    market:    <MarketPage />,
    portfolio: <PortfolioPage />,
    strategy:  <StrategyPage />,
    analysis:  <AnalysisPage />,
  };

  const CurrentPage = PAGE_MAP[activeTab] ?? <HomePage />;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Fixed ticker bar — z-50 */}
      <TickerBar />

      {/* Fixed top navbar — z-40, below ticker */}
      <TopNavbar />

      {/* Main content area
          Offset: ticker (32px) + navbar (72px) = 104px minimum
          Extra padding for safety on different screen sizes */}
      <main
        className="pt-[120px] px-4 md:px-6 lg:px-8
                   pb-16 max-w-[1400px] mx-auto
                   overflow-visible"
      >
        <PageErrorBoundary key={activeTab}>
          <Suspense fallback={<PageSkeleton />}>
            {CurrentPage}
          </Suspense>
        </PageErrorBoundary>
      </main>

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