// src/stores/selectors.js
// Memoized selector library — prevents unnecessary re-renders
// Components import individual selectors instead of raw state slices
// Each selector is stable between renders unless its specific data changes

import { useRootStore } from './rootStore.js';
import { shallow } from 'zustand/shallow';
export { SCENARIOS } from './slices/scenarioSlice.js';

// ── SCENARIO SELECTORS ────────────────────────────────────────
export const useScenarioId    = () => useRootStore((s) => s.scenarioId);
export const useMacroInputs   = () => useRootStore((s) => s.macroInputs);
export const useWeights       = () => useRootStore((s) => s.weights);
export const useSetScenario   = () => useRootStore((s) => s.setScenario);
export const useSetWeight     = () => useRootStore((s) => s.setWeight);
export const useSetWeightBulk = () => useRootStore((s) => s.setWeightBulk);
export const useSetMacroInput = () => useRootStore((s) => s.setMacroInput);

// ── ANALYTICS SELECTORS ───────────────────────────────────────
export const useAnalytics        = () => useRootStore((s) => s.analytics);
export const useSharpeRatio      = () => useRootStore((s) => s.analytics?.sharpe);
export const usePortfolioBeta    = () => useRootStore((s) => s.analytics?.beta);
export const usePortfolioStdDev  = () => useRootStore((s) => s.analytics?.portfolioStdDev);
export const useMaxDrawdown      = () => useRootStore((s) => s.analytics?.estimatedMaxDrawdown);
export const usePortfolioReturn  = () => useRootStore((s) => s.analytics?.portfolioReturn);
export const useExpectedReturns  = () => useRootStore((s) => s.analytics?.expectedReturns);
export const useCovMatrix        = () => useRootStore((s) => s.analytics?.covMatrix);

// ── MACRO DATA SELECTORS ──────────────────────────────────────
export const useLiveData         = () => useRootStore((s) => s.liveData);
export const useEndpointStatus   = () => useRootStore((s) => s.endpointStatus);
export const useDeltaMap         = () => useRootStore((s) => s.deltaMap);
export const useLastSyncAt       = () => useRootStore((s) => s.lastSyncAt);
export const useSetLiveMetric    = () => useRootStore((s) => s.setLiveMetric);
export const useSetEndpointStatus = () => useRootStore((s) => s.setEndpointStatus);

// Granular per-endpoint selectors — maximum isolation
export const useLiveMetric    = (key) => useRootStore((s) => s.liveData[key]);
export const useEndpointStat  = (key) => useRootStore((s) => s.endpointStatus[key]);
export const useDeltaForKey   = (key) => useRootStore((s) => s.deltaMap[key]);

// Multi-value selector with shallow equality
export const useAnalyticsSummary = () => useRootStore(
  (s) => ({
    sharpe:    s.analytics?.sharpe,
    beta:      s.analytics?.beta,
    stdDev:    s.analytics?.portfolioStdDev,
    mdd:       s.analytics?.estimatedMaxDrawdown,
    portReturn: s.analytics?.portfolioReturn,
  }),
  shallow
);

// ── UI SELECTORS ──────────────────────────────────────────────
export const useActiveTab       = () => useRootStore((s) => s.activeTab);
export const useSetActiveTab    = () => useRootStore((s) => s.setActiveTab);
export const useReleaseWindow   = () => useRootStore((s) => s.releaseWindow);
export const useSetReleaseWindow = () => useRootStore((s) => s.setReleaseWindow);
export const useCrisisMode      = () => useRootStore((s) => s.crisisMode);
export const useSetCrisisMode   = () => useRootStore((s) => s.setCrisisMode);
