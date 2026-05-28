// src/stores/slices/analyticsSlice.js
// Manages MPT analytics output
// ISOLATED: only re-renders components that need analytics numbers
// runMPTEngine() is called here — the ONLY place in the app

import { runMPTEngine } from '../../lib/mptEngine.js';

const NULL_ANALYTICS = {
  sharpe:               0,
  portfolioReturn:      0,
  portfolioStdDev:      0,
  riskFreeRate:         0,
  beta:                 0,
  estimatedMaxDrawdown: 0,
  expectedReturns:      {},
  covMatrix:            [],
  weights:              {},
};

export const createAnalyticsSlice = (set, get) => ({
  // State
  analytics: NULL_ANALYTICS,

  // Actions
  recomputeAnalytics: () => {
    const { macroInputs, weights } = get();
    if (!macroInputs || !weights) return;

    try {
      const result = runMPTEngine(weights, get().scenarioId, macroInputs); // fixed argument order matching actual MPT
      set((state) => {
        state.analytics = result;
      });
    } catch (err) {
      console.error('[AnalyticsSlice] MPT computation failed:', err);
      // Keep last known good analytics — do not reset to null
    }
  },

  setAnalytics: (analytics) => {
    set((state) => {
      state.analytics = analytics;
    });
  },
});
