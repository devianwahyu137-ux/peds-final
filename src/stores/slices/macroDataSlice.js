// src/stores/slices/macroDataSlice.js
// Manages live external data, endpoint status, and delta tracking
// ISOLATED: API data changes only re-render data subscriber components

const INITIAL_ENDPOINT_STATUS = {
  gs10:       'idle',
  dxy:        'idle',
  fedFunds:   'idle',
  ihsg:       'idle',
  xauUsd:     'idle',
  usdIdr:     'idle',
  bi_macro:   'idle',
  sbn_yields: 'idle',
  trends:     'idle',
};

export const createMacroDataSlice = (set, get) => ({
  // State
  liveData:       {},
  endpointStatus: INITIAL_ENDPOINT_STATUS,
  deltaMap:       {},
  lastSyncAt:     null,

  // Actions
  setLiveMetric: (key, payload) => {
    set((state) => {
      // Equality check — skip if value identical
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
      } else if (payload.src === 'static_fallback') {
        state.endpointStatus[key] = 'fallback';
      } else if (payload.src === 'stale_cache') {
        state.endpointStatus[key] = 'stale';
      } else if (payload.ok === true && payload.v != null && isFinite(payload.v)) {
        state.endpointStatus[key] = 'ok';
      } else {
        state.endpointStatus[key] = 'fallback';
      }

      // Delta tracking
      if (payload?.d !== undefined) {
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

  setLastSyncAt: (ts) => {
    set((state) => { state.lastSyncAt = ts; });
  },
});
