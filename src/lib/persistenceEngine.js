// src/lib/persistenceEngine.js
// IndexedDB persistence using idb-keyval
// Stores: scenarioId, custom weights, calculator inputs, last sync
// Non-blocking: all operations are async, never block UI

import { get, set, del, keys } from 'idb-keyval';

const DB_PREFIX    = 'alphashield_v33_';
const SCHEMA_VER   = '3.3.0';
const MAX_AGE_MS   = 7 * 24 * 60 * 60 * 1000; // 7 days

// Schema for persisted portfolio state
export const PERSIST_KEYS = {
  SCENARIO:        DB_PREFIX + 'scenario',
  WEIGHTS:         DB_PREFIX + 'weights',
  CALCULATOR:      DB_PREFIX + 'calculator',
  MACRO_INPUTS:    DB_PREFIX + 'macro_inputs',
  LAST_ACTIVE:     DB_PREFIX + 'last_active',
  SCHEMA_VERSION:  DB_PREFIX + 'schema_ver',
};

// Write session state — async, non-blocking
export async function persistSessionState(state) {
  try {
    await set(PERSIST_KEYS.SCENARIO,    { data: state.scenarioId,   savedAt: Date.now(), version: SCHEMA_VER });
    await set(PERSIST_KEYS.WEIGHTS,     { data: state.weights,      savedAt: Date.now(), version: SCHEMA_VER });
    await set(PERSIST_KEYS.CALCULATOR,  { data: state.calculator,   savedAt: Date.now(), version: SCHEMA_VER });
    await set(PERSIST_KEYS.LAST_ACTIVE, { data: Date.now(),         savedAt: Date.now(), version: SCHEMA_VER });
  } catch (err) {
    // IndexedDB unavailable (private mode, storage quota) — silent fail
    console.warn('[Persistence] Write failed:', err.message);
  }
}

// Read session state — returns null if expired or schema mismatch
export async function loadSessionState() {
  try {
    // Check schema version first
    const schemaRec = await get(PERSIST_KEYS.SCHEMA_VERSION);
    if (schemaRec?.data !== SCHEMA_VER) {
      // Schema changed — clear old data
      await clearSessionState();
      await set(PERSIST_KEYS.SCHEMA_VERSION, {
        data: SCHEMA_VER, savedAt: Date.now(), version: SCHEMA_VER
      });
      return null;
    }

    const lastActive = await get(PERSIST_KEYS.LAST_ACTIVE);
    if (!lastActive) return null;

    // Check if data is too old
    const age = Date.now() - (lastActive.data ?? 0);
    if (age > MAX_AGE_MS) {
      await clearSessionState();
      return null;
    }

    const [scenarioRec, weightsRec, calculatorRec] = await Promise.all([
      get(PERSIST_KEYS.SCENARIO),
      get(PERSIST_KEYS.WEIGHTS),
      get(PERSIST_KEYS.CALCULATOR),
    ]);

    const result = {};
    if (scenarioRec?.data)   result.scenarioId  = scenarioRec.data;
    if (weightsRec?.data)    result.weights      = weightsRec.data;
    if (calculatorRec?.data) result.calculator   = calculatorRec.data;

    // Return null if nothing meaningful was saved
    if (!Object.keys(result).length) return null;

    return {
      ...result,
      lastActiveAt: lastActive.data,
      ageMinutes:   Math.floor(age / 60_000),
    };
  } catch (err) {
    console.warn('[Persistence] Read failed:', err.message);
    return null;
  }
}

// Clear all persisted state
export async function clearSessionState() {
  try {
    await Promise.all(Object.values(PERSIST_KEYS).map(k => del(k)));
  } catch (err) {
    console.warn('[Persistence] Clear failed:', err.message);
  }
}

// Check if a saved session exists (fast check)
export async function hasSavedSession() {
  try {
    const lastActive = await get(PERSIST_KEYS.LAST_ACTIVE);
    if (!lastActive?.data) return false;
    const age = Date.now() - lastActive.data;
    return age < MAX_AGE_MS;
  } catch {
    return false;
  }
}
