// src/lib/deltaCalculator.js
// Accurate delta percentage computation between current and previous values
// Fixes the persistent "0.00%" bug on all sparkline cards
// Uses in-memory previous value registry (survives component re-renders
// because it's module-level, not component-level state)

// Module-level registry — persists across component re-renders
// Key: metric key string, Value: { v: number, t: number }
const PREVIOUS_REGISTRY = new Map();

// Minimum time between delta updates (prevents flicker)
const MIN_UPDATE_INTERVAL_MS = 60_000; // 1 minute

/**
 * computeDelta
 * Computes percentage change between current and registered previous value.
 * Updates registry after comparison.
 *
 * @param {string} key     - metric identifier
 * @param {number} current - current value
 * @param {number} timestamp - unix ms (from payload.t)
 * @returns {{ delta: number, deltaFormatted: string, direction: 'up'|'down'|'flat' }}
 */
export function computeDelta(key, current, timestamp = Date.now()) {
  if (typeof current !== 'number' || !isFinite(current)) {
    return { delta: 0, deltaFormatted: '0.00%', direction: 'flat' };
  }

  const prev = PREVIOUS_REGISTRY.get(key);

  if (!prev || typeof prev.v !== 'number') {
    // First time seeing this key — register and return flat
    PREVIOUS_REGISTRY.set(key, { v: current, t: timestamp });
    return { delta: 0, deltaFormatted: '0.00%', direction: 'flat' };
  }

  // Skip update if too recent (prevents 0% from same poll cycle)
  const timeSinceUpdate = timestamp - prev.t;
  if (timeSinceUpdate < MIN_UPDATE_INTERVAL_MS && prev.v === current) {
    // Value unchanged — return stored delta
    const storedDelta = PREVIOUS_REGISTRY.get(key + '_delta') ?? 0;
    return formatDeltaResult(storedDelta);
  }

  // Compute percentage change
  const delta = prev.v !== 0
    ? ((current - prev.v) / Math.abs(prev.v)) * 100
    : 0;

  // Update registry with new value
  PREVIOUS_REGISTRY.set(key, { v: current, t: timestamp });
  PREVIOUS_REGISTRY.set(key + '_delta', delta);

  return formatDeltaResult(delta);
}

function formatDeltaResult(delta) {
  const rounded   = Math.round(delta * 100) / 100;
  const direction = rounded > 0.01 ? 'up' : rounded < -0.01 ? 'down' : 'flat';
  const prefix    = rounded > 0 ? '+' : '';
  return {
    delta:          rounded,
    deltaFormatted: `${prefix}${rounded.toFixed(2)}%`,
    direction,
  };
}

/**
 * seedPreviousValue
 * Pre-populate registry with a known previous value.
 * Called during initial data load from cache.
 */
export function seedPreviousValue(key, value, timestamp) {
  if (typeof value === 'number' && isFinite(value)) {
    PREVIOUS_REGISTRY.set(key, { v: value, t: timestamp });
  }
}

/**
 * getPreviousValue
 * Returns the registered previous value for debugging.
 */
export function getPreviousValue(key) {
  return PREVIOUS_REGISTRY.get(key) ?? null;
}

/**
 * resetRegistry
 * Clears all previous values — use on scenario change.
 */
export function resetRegistry() {
  PREVIOUS_REGISTRY.clear();
}
