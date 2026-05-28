// src/stores/index.js
// Migration shim — re-exports everything from rootStore
// Existing components using old store imports continue working
// without modification during migration period

export { useRootStore, useAlphaShieldStore, useDataStore,
         useNavigationStore } from './rootStore.js';
export * from './selectors.js';
