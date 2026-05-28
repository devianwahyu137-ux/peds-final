// src/stores/slices/uiSlice.js
// Manages pure UI state: active tab, release window, overlays
// ISOLATED: UI changes never trigger analytics recomputation

export const createUiSlice = (set, get) => ({
  // State
  activeTab:      'home',
  releaseWindow:  { isHot: false, windowId: null, minutesLeft: null },
  showScenarioOverlay: false,
  crisisMode: null, // "HYPERINFLATION" | "RUPIAH_CRASH" | null

  // Actions
  setActiveTab: (tab) => {
    set((state) => {
      if (state.activeTab === tab) return;
      state.activeTab = tab;
    });
  },

  setReleaseWindow: (windowData) => {
    set((state) => {
      if (state.releaseWindow.windowId === windowData.windowId) return;
      state.releaseWindow = windowData;
    });
  },

  setShowScenarioOverlay: (show) => {
    set((state) => { state.showScenarioOverlay = show; });
  },

  setCrisisMode: (mode) => {
    set((state) => { state.crisisMode = mode; });
  }
});
