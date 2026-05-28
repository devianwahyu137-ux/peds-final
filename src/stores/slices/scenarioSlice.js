// src/stores/slices/scenarioSlice.js
// Manages scenario selection and macro input overrides
// ISOLATED: changes here only re-render scenario subscribers

import { runMPTEngine } from '../../lib/mptEngine.js';

const SCENARIO_DEFAULTS = {
  EQUILIBRIUM: {
    biRate: 5.50, inflation: 2.8, usdIdr: 15850,
    weights: { stocks: 40, bonds: 30, gold: 10, cash: 20 },
  },
  TIGHTENING: {
    biRate: 6.75, inflation: 4.2, usdIdr: 16250,
    weights: { stocks: 15, bonds: 45, gold: 15, cash: 25 },
  },
  CURRENCY_STRESS: {
    biRate: 7.50, inflation: 5.8, usdIdr: 17150,
    weights: { stocks: 5,  bonds: 15, gold: 45, cash: 35 },
  },
};

export const SCENARIOS = SCENARIO_DEFAULTS;

export const createScenarioSlice = (set, get) => ({
  // State
  scenarioId:   'EQUILIBRIUM',
  macroInputs:  SCENARIO_DEFAULTS.EQUILIBRIUM,
  weights:      SCENARIO_DEFAULTS.EQUILIBRIUM.weights,
  scenarioDefaults: SCENARIO_DEFAULTS,

  // Actions
  setScenario: (id) => {
    const defaults = SCENARIO_DEFAULTS[id];
    if (!defaults) return;
    set((state) => {
      state.scenarioId  = id;
      state.macroInputs = defaults;
      state.weights     = defaults.weights;
    });
  },

  setMacroInput: (key, value) => {
    set((state) => {
      state.macroInputs = {
        ...state.macroInputs,
        [key]: parseFloat(value) || 0,
      };
    });
  },

  setWeight: (asset, pct) => {
    set((state) => {
      state.weights = {
        ...state.weights,
        [asset]: parseFloat(pct) || 0,
      };
    });
  },

  setWeightBulk: (newWeights) => {
    set((state) => {
      state.weights = { ...newWeights };
    });
  },

  getScenarioDefaults: (id) => {
    return SCENARIO_DEFAULTS[id] ?? SCENARIO_DEFAULTS.EQUILIBRIUM;
  },
});
