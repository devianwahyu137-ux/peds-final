import { create } from "zustand";
import { runMPTEngine } from "../lib/mptEngine";

// Static Scenario Baseline Config
export const SCENARIOS = {
  EQUILIBRIUM: {
    id: "EQUILIBRIUM",
    label: "Konsensus Bank Indonesia",
    theme: "Safe",
    accent: "emerald",
    metrics: { biRate: 5.50, inflation: 2.80, usdIdr: 15.850, sbn10y: 6.60, dxy: 101.20 },
    allocation: { stocks: 40, bonds: 30, gold: 10, cash: 20 },
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
    metrics: { biRate: 6.75, inflation: 4.20, usdIdr: 16.250, sbn10y: 7.35, dxy: 104.50 },
    allocation: { stocks: 15, bonds: 45, gold: 15, cash: 25 },
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
    metrics: { biRate: 7.50, inflation: 5.80, usdIdr: 17.150, sbn10y: 7.90, dxy: 106.80 },
    allocation: { stocks: 5, bonds: 15, gold: 45, cash: 35 },
    ledger: [
      "[🚨] WEALTH_PRESERVATION : Shift 45% of liquid capital into Physical Gold to hedge against domestic inflation.",
      "[💵] FOREIGN_RESERVES : Convert remaining Rupiah cash into USD to survive currency devaluation."
    ]
  }
};

// Helper to scale input data from 0-100 down to decimal fractions 0-1
const getDecimalMacroInputs = (inputs) => ({
  biRate: (inputs.biRate || 0) / 100,
  inflation: (inputs.inflation || 0) / 100,
  usdIdr: inputs.usdIdr || 0, // already in thousands format (15.850)
  sbn10y: (inputs.sbn10y || 0) / 100,
  dxy: inputs.dxy || 0
});

const getDecimalWeights = (weights) => ({
  stocks: (weights.stocks || 0) / 100,
  bonds: (weights.bonds || 0) / 100,
  gold: (weights.gold || 0) / 100,
  cash: (weights.cash || 0) / 100
});

// Central MPT calculator wrapper
const calculateStoreMPT = (weights, scenarioId, macroInputs) => {
  const decWeights = getDecimalWeights(weights);
  const decMacro = getDecimalMacroInputs(macroInputs);
  return runMPTEngine(decWeights, scenarioId, decMacro);
};

export const useAlphaShieldStore = create((set, get) => ({
  scenarioId: "EQUILIBRIUM",
  crisisMode: null, // "HYPERINFLATION" | "RUPIAH_CRASH" | null
  
  // Weights (scale 0-100)
  targetWeights: { ...SCENARIOS.EQUILIBRIUM.allocation },
  actualWeights: { ...SCENARIOS.EQUILIBRIUM.allocation },

  // Macro variables (scale 0-100, usdIdr as scale 15.850)
  macroInputs: { ...SCENARIOS.EQUILIBRIUM.metrics },

  // Live stream metadata
  liveData: {},
  endpointStatus: {},
  releaseWindow: { interval: 3600000, windowId: null, isHot: false },

  // Recalculated analytics
  targetAnalytics: calculateStoreMPT(
    SCENARIOS.EQUILIBRIUM.allocation,
    "EQUILIBRIUM",
    SCENARIOS.EQUILIBRIUM.metrics
  ),
  actualAnalytics: calculateStoreMPT(
    SCENARIOS.EQUILIBRIUM.allocation,
    "EQUILIBRIUM",
    SCENARIOS.EQUILIBRIUM.metrics
  ),
  analytics: {
    target: calculateStoreMPT(SCENARIOS.EQUILIBRIUM.allocation, "EQUILIBRIUM", SCENARIOS.EQUILIBRIUM.metrics),
    actual: calculateStoreMPT(SCENARIOS.EQUILIBRIUM.allocation, "EQUILIBRIUM", SCENARIOS.EQUILIBRIUM.metrics)
  },

  // Actions
  setScenario: (id) => {
    const sc = SCENARIOS[id] || SCENARIOS.EQUILIBRIUM;
    const currentCrisis = get().crisisMode;
    
    // Determine macro inputs based on scenario & active crisis overrides
    let newMetrics = { ...sc.metrics };
    let newAllocation = { ...sc.allocation };
    
    if (currentCrisis === "HYPERINFLATION") {
      newMetrics = { ...newMetrics, inflation: 12.40, biRate: 10.50, sbn10y: 9.80 };
      newAllocation = { stocks: 2, bonds: 8, gold: 60, cash: 30 };
    } else if (currentCrisis === "RUPIAH_CRASH") {
      newMetrics = { ...newMetrics, usdIdr: 17.450, dxy: 109.20 };
      newAllocation = { stocks: 0, bonds: 10, gold: 50, cash: 40 };
    }

    set({
      scenarioId: id,
      targetWeights: newAllocation,
      actualWeights: newAllocation, // sync actualWeights to baseline target allocation
      macroInputs: newMetrics,
    });
    get().recalculate();
  },

  setCrisisMode: (crisis) => {
    const activeScenario = SCENARIOS[get().scenarioId];
    let newMetrics = { ...activeScenario.metrics };
    let newAllocation = { ...activeScenario.allocation };

    if (crisis === "HYPERINFLATION") {
      newMetrics = { ...newMetrics, inflation: 12.40, biRate: 10.50, sbn10y: 9.80 };
      newAllocation = { stocks: 2, bonds: 8, gold: 60, cash: 30 };
    } else if (crisis === "RUPIAH_CRASH") {
      newMetrics = { ...newMetrics, usdIdr: 17.450, dxy: 109.20 };
      newAllocation = { stocks: 0, bonds: 10, gold: 50, cash: 40 };
    }

    set({
      crisisMode: crisis,
      targetWeights: newAllocation,
      actualWeights: newAllocation, // sync actualWeights on crisis activation
      macroInputs: newMetrics
    });
    get().recalculate();
  },

  setMacroInput: (key, value) => {
    const updatedMacro = { ...get().macroInputs, [key]: parseFloat(value) || 0 };
    set({ macroInputs: updatedMacro });
    get().recalculate();
  },

  setActualWeight: (key, value) => {
    const updatedActual = { ...get().actualWeights, [key]: parseFloat(value) || 0 };
    set({ actualWeights: updatedActual });
    get().recalculate();
  },

  setEquityWeight: (equityWeight) => {
    const target = get().targetWeights;
    const remaining = 100 - equityWeight;
    const otherTargetTotal = Math.max(target.bonds + target.gold + target.cash, 1);
    
    const actualWeights = {
      stocks: equityWeight,
      bonds: remaining * (target.bonds / otherTargetTotal),
      gold: remaining * (target.gold / otherTargetTotal),
      cash: remaining * (target.cash / otherTargetTotal)
    };
    
    set({ actualWeights });
    get().recalculate();
  },

  setLiveMetric: (key, result) => {
    const current = get().liveData[key];
    // Primitive equality guard: if value and structure are identical, bypass set()
    if (current !== undefined && current !== null) {
      // For object payloads with v and t properties
      if (typeof current === "object" && typeof result === "object") {
        if (current.v === result?.v && current.t === result?.t) return;
      }
      // For primitive payloads (numbers, strings)
      if (typeof current !== "object" && current === result) return;
    }
    const updatedLive = { ...get().liveData, [key]: result };
    set({ liveData: updatedLive });
  },

  setEndpointStatus: (key, status) => {
    // String equality guard: skip if status is unchanged
    if (get().endpointStatus[key] === status) return;
    const updatedStatus = { ...get().endpointStatus, [key]: status };
    set({ endpointStatus: updatedStatus });
  },

  setWeight: (asset, pct) => {
    const updatedActual = { ...get().actualWeights, [asset]: parseFloat(pct) || 0 };
    set({ actualWeights: updatedActual });
    get().recalculate();
  },

  setReleaseWindow: (windowData) => {
    const current = get().releaseWindow;
    // Full equality guard: skip if all properties are identical
    if (
      current.interval === windowData.interval &&
      current.windowId === windowData.windowId &&
      current.isHot === windowData.isHot
    ) return;
    set({ releaseWindow: windowData });
  },

  // Central recalculation trigger
  recalculate: () => {
    const state = get();
    const targetAnalytics = calculateStoreMPT(state.targetWeights, state.scenarioId, state.macroInputs);
    const actualAnalytics = calculateStoreMPT(state.actualWeights, state.scenarioId, state.macroInputs);
    set({ 
      targetAnalytics, 
      actualAnalytics,
      analytics: {
        target: targetAnalytics,
        actual: actualAnalytics
      }
    });
  }
}));

export const useDataStore = useAlphaShieldStore;
