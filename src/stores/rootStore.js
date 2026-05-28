// src/stores/rootStore.js
// Unified root store combining all slices via Zustand immer middleware
// This is the SINGLE store — all slices share one state tree
// Replaces the old monolithic store files

import { create } from 'zustand';
import { immer  } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

import { createScenarioSlice  } from './slices/scenarioSlice.js';
import { createAnalyticsSlice } from './slices/analyticsSlice.js';
import { createMacroDataSlice } from './slices/macroDataSlice.js';
import { createUiSlice        } from './slices/uiSlice.js';

export const useRootStore = create(
  devtools(
    immer((set, get) => ({
      // Compose all slices into unified state tree
      ...createScenarioSlice(set, get),
      ...createAnalyticsSlice(set, get),
      ...createMacroDataSlice(set, get),
      ...createUiSlice(set, get),

      // Cross-slice action: setScenario must also trigger recompute
      // Override setScenario from scenarioSlice to chain recompute
      setScenario: (id) => {
        const scenarioDefs = {
          EQUILIBRIUM:     { biRate: 5.50, inflation: 2.8,  usdIdr: 15850,
                             weights: { stocks: 40, bonds: 30, gold: 10, cash: 20 } },
          TIGHTENING:      { biRate: 6.75, inflation: 4.2,  usdIdr: 16250,
                             weights: { stocks: 15, bonds: 45, gold: 15, cash: 25 } },
          CURRENCY_STRESS: { biRate: 7.50, inflation: 5.8,  usdIdr: 17150,
                             weights: { stocks: 5,  bonds: 15, gold: 45, cash: 35 } },
        };
        const defaults = scenarioDefs[id];
        if (!defaults) return;

        set((state) => {
          state.scenarioId  = id;
          state.macroInputs = defaults;
          state.weights     = defaults.weights;
        });

        // Chain: recompute analytics after scenario state is set
        get().recomputeAnalytics();
      },

      // Cross-slice: setWeight must also trigger recompute
      setWeight: (asset, pct) => {
        set((state) => {
          state.weights = {
            ...state.weights,
            [asset]: parseFloat(pct) || 0,
          };
        });
        get().recomputeAnalytics();
      },

      setWeightBulk: (newWeights) => {
        set((state) => { state.weights = { ...newWeights }; });
        get().recomputeAnalytics();
      },

      setMacroInput: (key, value) => {
        set((state) => {
          state.macroInputs = {
            ...state.macroInputs,
            [key]: parseFloat(value) || 0,
          };
        });
        get().recomputeAnalytics();
      },
    })),
    { name: 'AlphaShield-v3.4' }
  )
);

// Named convenience exports — components import these, not useRootStore
// This allows future slice extraction without changing component imports
export const useAlphaShieldStore = useRootStore;
export const useDataStore        = useRootStore;
export const useNavigationStore  = useRootStore;
