// src/stores/rootStore.js
// Unified flat store — no slice imports, no circular dependencies
// All state in one place, selectors in separate file

import { create } from 'zustand';
import { immer  } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { runMPTEngine } from '@/lib/mptEngine';

// ── SCENARIO DEFAULTS ─────────────────────────────────────────
export const SCENARIOS = {
  EQUILIBRIUM: {
    id: "EQUILIBRIUM",
    label: "Soft Landing Base",
    theme: "Aman",
    accent: "emerald",
    biRate: 5.50, inflation: 2.8, usdIdr: 15850, sbn10y: 6.60, dxy: 101.20,
    weights: { stocks: 40, bonds: 30, gold: 10, cash: 20 },
    ledger: [
      "[📈] RISK_EQUITIES : Maintain 40% in top-tier banking & consumer staples for growth.",
      "[💼] SOVEREIGN_BONDS : Hold 30% in Government bonds to secure steady baseline yields."
    ]
  },
  TIGHTENING: {
    id: "TIGHTENING",
    label: "Hawkish Rate Expansion",
    theme: "Caution",
    accent: "amber",
    biRate: 6.75, inflation: 4.2, usdIdr: 16250, sbn10y: 7.35, dxy: 104.50,
    weights: { stocks: 15, bonds: 45, gold: 15, cash: 25 },
    ledger: [
      "[⚠️] DEBT_EXPOSURE : Scale back retail equities to 15%. High capital costs will squeeze corporate margins.",
      "[🏛️] FIXED_INCOME : Rotate into SBN (ORI/SR/FR) to lock in risk-free yields above 6.5%."
    ]
  },
  CURRENCY_STRESS: {
    id: "CURRENCY_STRESS",
    label: "Capital Flight Stress",
    theme: "Crisis Mode",
    accent: "red",
    biRate: 7.50, inflation: 5.8, usdIdr: 17150, sbn10y: 7.90, dxy: 106.80,
    weights: { stocks: 5, bonds: 15, gold: 45, cash: 35 },
    ledger: [
      "[🚨] WEALTH_PRESERVATION : Shift 45% of liquid capital into Physical Gold to hedge against domestic inflation.",
      "[💵] FOREIGN_RESERVES : Convert remaining Rupiah cash into USD to survive currency devaluation."
    ]
  },
};
const SCENARIO_DEFAULTS = SCENARIOS;

// ── NULL ANALYTICS (safe initial state) ───────────────────────
// Field names match runMPTEngine output exactly
const NULL_ANALYTICS = {
  sharpeRatio:          0,
  portfolioReturn:      0,
  portfolioVolatility:  0,
  riskFreeRate:         0,
  portfolioBeta:        0,
  maxDrawdown:          0,
  shockedReturns:       { stocks: 0, bonds: 0, gold: 0, cash: 0 },
  // Legacy aliases so old UI code still works
  sharpe:               0,
  beta:                 0,
  portfolioStdDev:      0,
  estimatedMaxDrawdown: 0,
  expectedReturns:      { stocks: 0, bonds: 0, gold: 0, cash: 0 },
  covMatrix:            [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
  weights:              { stocks: 0, bonds: 0, gold: 0, cash: 0 },
};

// ── INITIAL ENDPOINT STATUS ───────────────────────────────────
const INITIAL_STATUS = {
  gs10: 'idle', dxy: 'idle', fedFunds: 'idle',
  ihsg: 'idle', xauUsd: 'idle', usdIdr: 'idle',
  bi_macro: 'idle', sbn_yields: 'idle', trends: 'idle',
};

// ── DECIMAL MACRO CONVERTER ───────────────────────────────────
// runMPTEngine expects macroInputs in 0-1 scale:
//   biRate: 0.0550 (not 5.50), inflation: 0.028 (not 2.8)
//   usdIdr stays in thousands (15.850), sbn10y: 0.066 (not 6.60)
function toDecimalMacro(macro) {
  return {
    biRate:    (macro.biRate    || 0) / 100,
    inflation: (macro.inflation || 0) / 100,
    usdIdr:    (macro.usdIdr   || 0) / 1000, // convert 15850 → 15.850
    sbn10y:    (macro.sbn10y   || 0) / 100,
    dxy:       macro.dxy || 0,
    dxyEquityAdj: macro.dxyEquityAdj || 0,
    dxyBondsAdj:  macro.dxyBondsAdj  || 0,
    dxyGoldAdj:   macro.dxyGoldAdj   || 0,
    dxyCashAdj:   macro.dxyCashAdj   || 0,
  };
}

// Convert weights from 0-100 scale to 0-1 scale
function toDecimalWeights(w) {
  return {
    stocks: (w.stocks || 0) / 100,
    bonds:  (w.bonds  || 0) / 100,
    gold:   (w.gold   || 0) / 100,
    cash:   (w.cash   || 0) / 100,
  };
}

// ── SAFE MPT COMPUTE ──────────────────────────────────────────
// Wraps runMPTEngine with error boundary — never throws to UI
// runMPTEngine signature: (weights, scenarioId, macroInputs)
function safeRunMPT(scenarioId, macroInputs, weights) {
  try {
    if (!macroInputs || !weights || !scenarioId) return NULL_ANALYTICS;
    const decWeights = toDecimalWeights(weights);
    const decMacro   = toDecimalMacro(macroInputs);
    const result = runMPTEngine(decWeights, scenarioId, decMacro);
    if (!result) return NULL_ANALYTICS;
    // Merge in legacy aliases so both old and new UI patterns work
    return {
      ...result,
      sharpe:               result.sharpeRatio ?? 0,
      beta:                 result.portfolioBeta ?? 0,
      portfolioStdDev:      result.portfolioVolatility ?? 0,
      estimatedMaxDrawdown: result.maxDrawdown ?? 0,
      expectedReturns:      result.shockedReturns ?? {},
    };
  } catch (err) {
    console.error('[AlphaShield] MPT compute error:', err.message);
    return NULL_ANALYTICS;
  }
}

// Compute initial analytics synchronously on store creation
const INITIAL_MACRO  = SCENARIO_DEFAULTS.EQUILIBRIUM;
const INITIAL_WEIGHTS = SCENARIO_DEFAULTS.EQUILIBRIUM.weights;
const INITIAL_ANALYTICS = safeRunMPT('EQUILIBRIUM', INITIAL_MACRO, INITIAL_WEIGHTS);

// ── ROOT STORE ────────────────────────────────────────────────
export const useRootStore = create(
  devtools(
    immer((set, get) => ({

      // ── SCENARIO STATE ──────────────────────────────────────
      scenarioId:    'EQUILIBRIUM',
      macroInputs:   INITIAL_MACRO,
      weights:       INITIAL_WEIGHTS,

      // ── ANALYTICS STATE ────────────────────────────────────
      analytics:     INITIAL_ANALYTICS,

      // ── MACRO DATA STATE ───────────────────────────────────
      liveData:      {},
      endpointStatus: INITIAL_STATUS,
      deltaMap:      {},
      lastSyncAt:    null,

      // ── UI STATE ───────────────────────────────────────────
      activeTab:     'home',
      releaseWindow: { isHot: false, windowId: null },

      // ── SCENARIO ACTIONS ───────────────────────────────────
      setScenario: (id) => {
        const defaults = SCENARIO_DEFAULTS[id];
        if (!defaults) return;
        const newAnalytics = safeRunMPT(id, defaults, defaults.weights);
        set((state) => {
          state.scenarioId  = id;
          state.macroInputs = defaults;
          state.weights     = defaults.weights;
          state.analytics   = newAnalytics;
        });
      },

      setMacroInput: (key, value) => {
        set((state) => {
          state.macroInputs = {
            ...state.macroInputs,
            [key]: parseFloat(value) || 0,
          };
        });
        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      setWeight: (asset, pct) => {
        set((state) => {
          state.weights = {
            ...state.weights,
            [asset]: parseFloat(pct) || 0,
          };
        });
        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      setWeightBulk: (newWeights) => {
        set((state) => { state.weights = { ...newWeights }; });
        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      recomputeAnalytics: () => {
        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      getScenarioDefaults: (id) =>
        SCENARIO_DEFAULTS[id] ?? SCENARIO_DEFAULTS.EQUILIBRIUM,

      // ── MACRO DATA ACTIONS ─────────────────────────────────
      setLiveMetric: (key, payload) => {
        set((state) => {
          // Skip if identical value at same timestamp
          const existing = state.liveData[key];
          if (
            existing?.v === payload?.v &&
            existing?.t === payload?.t &&
            existing?.ok === payload?.ok
          ) return;

          state.liveData[key] = payload;
          state.lastSyncAt    = Date.now();

          // Atomic status update
          if (!payload) {
            state.endpointStatus[key] = 'idle';
          } else if (
            payload.ok === true &&
            payload.v != null &&
            isFinite(payload.v) &&
            payload.src !== 'static_fallback' &&
            payload.src !== 'stale_cache'
          ) {
            state.endpointStatus[key] = 'ok';
          } else if (payload.src === 'stale_cache') {
            state.endpointStatus[key] = 'stale';
          } else {
            state.endpointStatus[key] = 'fallback';
          }

          // Delta tracking
          if (payload?.d !== undefined && isFinite(payload.d)) {
            state.deltaMap[key] = {
              delta:     payload.d,
              direction: payload._dir ?? 'flat',
              updatedAt: Date.now(),
            };
          }
        });
      },

      setEndpointStatus: (key, status) => {
        set((state) => {
          if (state.endpointStatus[key] === status) return;
          state.endpointStatus[key] = status;
        });
      },

      // ── UI ACTIONS ─────────────────────────────────────────
      setActiveTab: (tab) => {
        set((state) => {
          if (state.activeTab === tab) return;
          state.activeTab = tab;
        });
      },

      setReleaseWindow: (windowData) => {
        set((state) => {
          state.releaseWindow = windowData;
        });
      },
    })),
    { name: 'AlphaShield-v3.4' }
  )
);

// ── NAMED CONVENIENCE EXPORTS ─────────────────────────────────
// All old store names now point to rootStore
// Zero breaking changes for existing component imports
export const useAlphaShieldStore = useRootStore;
export const useDataStore        = useRootStore;
export const useNavigationStore  = useRootStore;
