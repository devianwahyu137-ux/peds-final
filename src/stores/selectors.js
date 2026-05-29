// src/stores/selectors.js
// Granular selectors for optimal render isolation
// Import these instead of raw useRootStore when possible

import { useRootStore } from './rootStore';
import { shallow } from 'zustand/shallow';

// ── SCENARIO ──────────────────────────────────────────────────
export const useScenarioId    = () => useRootStore((s) => s.scenarioId);
export const useMacroInputs   = () => useRootStore((s) => s.macroInputs);
export const useWeights       = () => useRootStore((s) => s.weights);
export const useSetScenario   = () => useRootStore((s) => s.setScenario);
export const useSetWeight     = () => useRootStore((s) => s.setWeight);
export const useSetWeightBulk = () => useRootStore((s) => s.setWeightBulk);
export const useSetMacroInput = () => useRootStore((s) => s.setMacroInput);

// ── ANALYTICS ─────────────────────────────────────────────────
export const useAnalytics = () => useRootStore((s) => s.analytics);

export const useAnalyticsSummary = () => useRootStore(
  (s) => ({
    sharpe:      s.analytics?.sharpe       ?? 0,
    beta:        s.analytics?.beta         ?? 0,
    stdDev:      s.analytics?.portfolioStdDev ?? 0,
    mdd:         s.analytics?.estimatedMaxDrawdown ?? 0,
    portReturn:  s.analytics?.portfolioReturn ?? 0,
  }),
  shallow
);

export const useSharpeRatio     = () => useRootStore((s) => s.analytics?.sharpe       ?? 0);
export const usePortfolioBeta   = () => useRootStore((s) => s.analytics?.beta         ?? 0);
export const usePortfolioStdDev = () => useRootStore((s) => s.analytics?.portfolioStdDev ?? 0);
export const useMaxDrawdown     = () => useRootStore((s) => s.analytics?.estimatedMaxDrawdown ?? 0);
export const usePortfolioReturn = () => useRootStore((s) => s.analytics?.portfolioReturn ?? 0);
export const useExpectedReturns = () => useRootStore((s) => s.analytics?.expectedReturns ?? {});
export const useCovMatrix       = () => useRootStore((s) => s.analytics?.covMatrix ?? []);

// ── MACRO DATA ────────────────────────────────────────────────
export const useLiveData          = () => useRootStore((s) => s.liveData);
export const useEndpointStatus    = () => useRootStore((s) => s.endpointStatus);
export const useDeltaMap          = () => useRootStore((s) => s.deltaMap);
export const useLastSyncAt        = () => useRootStore((s) => s.lastSyncAt);
export const useSetLiveMetric     = () => useRootStore((s) => s.setLiveMetric);
export const useSetEndpointStatus = () => useRootStore((s) => s.setEndpointStatus);

// Per-endpoint granular selectors
export const useLiveMetric    = (key) => useRootStore((s) => s.liveData[key]);
export const useEndpointStat  = (key) => useRootStore((s) => s.endpointStatus[key]);
export const useDeltaForKey   = (key) => useRootStore((s) => s.deltaMap[key]);

// ── UI ────────────────────────────────────────────────────────
export const useActiveTab        = () => useRootStore((s) => s.activeTab);
export const useSetActiveTab     = () => useRootStore((s) => s.setActiveTab);
export const useReleaseWindow    = () => useRootStore((s) => s.releaseWindow);
export const useSetReleaseWindow = () => useRootStore((s) => s.setReleaseWindow);
