// src/stores/alphaShieldStore.js
// MIGRATION SHIM — forwards to unified rootStore
// Delete this file after all components migrate to src/stores/selectors.js
export { useAlphaShieldStore, useDataStore } from './rootStore.js';
export * from './selectors.js';
