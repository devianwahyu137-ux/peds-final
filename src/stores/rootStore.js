// src/stores/rootStore.js
// Unified flat store — no slice imports, no circular dependencies
// All state in one place, selectors in separate file

import { create } from 'zustand';
import { immer  } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { runMPTEngine, generateCovarianceMatrix, computeShockedReturns } from '@/lib/mptEngine';

export const APP_VERSION = 'v3.8';


// ── SCENARIO DEFAULTS ─────────────────────────────────────────
// VERIFIED DATA — May 30, 2026
// Sources: Bank Indonesia RDG 19-20 Mei 2026, BPS, Trading Economics
export const SCENARIOS = {
  EQUILIBRIUM: {
    id: "EQUILIBRIUM",
    label: "Soft Landing Base",
    theme: "Aman",
    accent: "emerald",
    biRate: 4.75, inflation: 2.50, usdIdr: 15850, sbn10y: 6.40, dxy: 103.50, us10y: 4.10, ihsg: 7096,
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
    biRate: 5.25, inflation: 3.48, usdIdr: 16800, sbn10y: 6.71, dxy: 104.50, us10y: 4.40, ihsg: 6170,
    weights: { stocks: 15, bonds: 45, gold: 15, cash: 25 },
    ledger: [
      "[⚠️] DEBT_EXPOSURE : Scale back retail equities to 15%. High capital costs squeeze corporate margins.",
      "[🏛️] FIXED_INCOME : Rotate into SBN (ORI/SR/FR) to lock in risk-free yields above policy rate."
    ]
  },
  CURRENCY_STRESS: {
    id: "CURRENCY_STRESS",
    label: "Capital Flight Stress",
    theme: "Crisis Mode",
    accent: "red",
    biRate: 5.25, inflation: 3.80, usdIdr: 17700, sbn10y: 6.71, dxy: 104.50, us10y: 4.40, ihsg: 5850,
    weights: { stocks: 5, bonds: 15, gold: 45, cash: 35 },
    ledger: [
      "[🚨] WEALTH_PRESERVATION : Shift 45% of liquid capital into Physical Gold to hedge against domestic inflation spiral.",
      "[💵] FOREIGN_RESERVES : Convert remaining Rupiah cash into USD/hard currency to survive devaluation."
    ]
  },
  HIPERINFLASI: {
    id: "HIPERINFLASI",
    label: "Extreme Inflation Shock",
    theme: "Stress Test",
    accent: "red",
    biRate: 8.50, inflation: 15.00, usdIdr: 18500, sbn10y: 9.20, dxy: 108.00, us10y: 5.20, ihsg: 5200,
    weights: { stocks: 5, bonds: 10, gold: 60, cash: 25 },
    ledger: [
      "[🔥] INFLATION_SHOCK : Purchasing power collapsing. Shift 60% to Gold immediately.",
      "[⚠️] CASH_DRAG : Avoid holding IDR. High inflation erodes nominal yields."
    ]
  },
  RUPIAH_CRASH: {
    id: "RUPIAH_CRASH",
    label: "Currency Collapse",
    theme: "Stress Test",
    accent: "amber",
    biRate: 7.00, inflation: 8.50, usdIdr: 20000, sbn10y: 8.50, dxy: 110.00, us10y: 4.80, ihsg: 5500,
    weights: { stocks: 10, bonds: 15, gold: 40, cash: 35 },
    ledger: [
      "[💵] USD_HEDGE : Rupiah touching 20,000. Maintain high liquidity in foreign currencies.",
      "[📉] EQUITY_FLIGHT : Equities at high risk due to imported inflation squeezing margins."
    ]
  }
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
// CRITICAL: Must also produce expectedReturns + covMatrix for Monte Carlo


function safeRunMPT(scenarioId, macroInputs, weights) {
  try {
    if (!macroInputs || !weights || !scenarioId) return NULL_ANALYTICS;
    const decWeights = toDecimalWeights(weights);
    const decMacro   = toDecimalMacro(macroInputs);
    const result = runMPTEngine(decWeights, scenarioId, decMacro);
    if (!result) return NULL_ANALYTICS;

    // Generate expectedReturns + covMatrix for Monte Carlo engine
    const shockedReturns = result.shockedReturns ?? computeShockedReturns(scenarioId, decMacro);
    const covObj = generateCovarianceMatrix();
    const assets = ['stocks', 'bonds', 'gold', 'cash'];
    const covMatrix = assets.map(a1 => assets.map(a2 => covObj[a1]?.[a2] ?? 0));

    // Merge in legacy aliases so both old and new UI patterns work
    return {
      ...result,
      sharpe:               result.sharpeRatio ?? 0,
      beta:                 result.portfolioBeta ?? 0,
      portfolioStdDev:      result.portfolioVolatility ?? 0,
      estimatedMaxDrawdown: result.maxDrawdown ?? 0,
      expectedReturns:      shockedReturns,
      covMatrix:            covMatrix,
    };
  } catch (err) {
    console.error('[AlphaShield] MPT compute error:', err.message);
    return NULL_ANALYTICS;
  }
}

// Compute initial analytics synchronously on store creation
const INITIAL_MACRO  = SCENARIO_DEFAULTS.TIGHTENING;
const INITIAL_WEIGHTS = SCENARIO_DEFAULTS.TIGHTENING.weights;
const INITIAL_ANALYTICS = safeRunMPT('TIGHTENING', INITIAL_MACRO, INITIAL_WEIGHTS);

// ── ROOT STORE ────────────────────────────────────────────────
export const useRootStore = create(
  devtools(
    immer((set, get) => ({

      // ── SCENARIO STATE ──────────────────────────────────────
      scenarioId:    'TIGHTENING',
      crisisMode:    null,
      macroInputs:   INITIAL_MACRO,
      weights:       INITIAL_WEIGHTS,
      actualWeights: null,
      macro: {
        biRate: SCENARIO_DEFAULTS.TIGHTENING.biRate,
        inflasi: SCENARIO_DEFAULTS.TIGHTENING.inflation,
        usdIdr: SCENARIO_DEFAULTS.TIGHTENING.usdIdr,
        dxy: SCENARIO_DEFAULTS.TIGHTENING.dxy,
        us10y: SCENARIO_DEFAULTS.TIGHTENING.us10y,
        ihsg: SCENARIO_DEFAULTS.TIGHTENING.ihsg,
        gold: 2342
      },

      // ── ANALYTICS STATE ────────────────────────────────────
      analytics:     INITIAL_ANALYTICS,

      // ── MACRO DATA STATE ───────────────────────────────────
      liveData:      {},
      endpointStatus: INITIAL_STATUS,
      deltaMap:      {},
      lastSyncAt:    null,
      triggerRefresh: null,

      // ── UI STATE ───────────────────────────────────────────
      activeTab:     'home',
      releaseWindow: { isHot: false, windowId: null },

      // ── SCENARIO ACTIONS ───────────────────────────────────
      setScenario: (id) => {
        const defaults = SCENARIO_DEFAULTS[id];
        if (!defaults) return;
        set((state) => {
          state.scenarioId  = id;
          state.weights     = defaults.weights;
          state.actualWeights = null;
          state.crisisMode  = null;

          const liveUsdIdr = state.liveData.usdIdr?.v;
          const liveGold = state.liveData.xauUsd?.v;

          state.macroInputs = {
            ...defaults,
            usdIdr: liveUsdIdr ?? defaults.usdIdr,
          };
          if (liveGold) {
            state.macroInputs.gold = liveGold;
          }

          state.macro = {
            biRate: defaults.biRate,
            inflasi: defaults.inflation,
            usdIdr: liveUsdIdr ?? defaults.usdIdr,
            dxy: defaults.dxy,
            us10y: defaults.us10y,
            ihsg: defaults.ihsg,
            gold: liveGold ?? 2342
          };
        });

        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      setCrisisMode: (mode) => {
        set((state) => {
          state.crisisMode = mode;
          state.actualWeights = null;
          let defaults;
          if (mode) {
            const mappedId = mode === "HYPERINFLATION" ? "HIPERINFLASI" : mode;
            defaults = SCENARIO_DEFAULTS[mappedId];
          } else {
            defaults = SCENARIO_DEFAULTS[state.scenarioId];
          }
          if (defaults) {
            const liveUsdIdr = state.liveData.usdIdr?.v;
            const liveGold = state.liveData.xauUsd?.v;

            state.macroInputs = {
              ...defaults,
              usdIdr: liveUsdIdr ?? defaults.usdIdr,
            };
            if (liveGold) {
              state.macroInputs.gold = liveGold;
            }
            state.weights     = defaults.weights;

            state.macro = {
              biRate: defaults.biRate,
              inflasi: defaults.inflation,
              usdIdr: liveUsdIdr ?? defaults.usdIdr,
              dxy: defaults.dxy,
              us10y: defaults.us10y,
              ihsg: defaults.ihsg,
              gold: liveGold ?? 2342
            };
          }
        });
        const { scenarioId, macroInputs, weights, crisisMode } = get();
        const effectiveScenarioId = crisisMode
          ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
          : scenarioId;
        const newAnalytics = safeRunMPT(effectiveScenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      setMacroInput: (key, value) => {
        set((state) => {
          state.macroInputs = {
            ...state.macroInputs,
            [key]: parseFloat(value) || 0,
          };
          const mappedKey = key === "inflation" ? "inflasi" : key;
          state.macro = {
            ...state.macro,
            [mappedKey]: parseFloat(value) || 0
          };
        });
        const { scenarioId, macroInputs, weights } = get();
        const newAnalytics = safeRunMPT(scenarioId, macroInputs, weights);
        set((state) => { state.analytics = newAnalytics; });
      },

      setActualWeight: (asset, pct) => {
        set((state) => {
          if (!state.actualWeights) {
            state.actualWeights = { ...state.weights };
          }
          state.actualWeights[asset] = parseFloat(pct) || 0;
        });
      },

      setActualWeightsBulk: (newActualWeights) => {
        set((state) => {
          state.actualWeights = newActualWeights;
        });
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

      setTriggerRefresh: (fn) => {
        set((state) => {
          state.triggerRefresh = fn;
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
    { name: 'AlphaShield-v3.6' }
  )
);

// ── NAMED CONVENIENCE EXPORTS ─────────────────────────────────
// All old store names now point to rootStore
// Zero breaking changes for existing component imports
export const useAlphaShieldStore = useRootStore;
export const useDataStore        = useRootStore;
export const useNavigationStore  = useRootStore;
