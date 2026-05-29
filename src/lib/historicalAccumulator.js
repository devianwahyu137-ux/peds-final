// src/lib/historicalAccumulator.js
// IndexedDB time-series accumulator for sparkline historical data
// Stores last 20 data points per metric key
// Uses raw idb-keyval for lightweight access
// Never blocks main thread — all operations async

import { get, set, del } from 'idb-keyval';

const ACCUMULATOR_PREFIX = 'alphashield_hist_v1_';
const MAX_HISTORY_POINTS = 20;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours max retention

/**
 * appendDataPoint
 * Adds a new value to the historical series for a given metric key.
 * Automatically trims to MAX_HISTORY_POINTS.
 * Silently fails if IndexedDB unavailable.
 *
 * @param {string} key   - metric identifier e.g. "gs10", "dxy", "usdIdr"
 * @param {number} value - numeric value to store
 * @param {number} timestamp - unix ms timestamp
 */
export async function appendDataPoint(key, value, timestamp = Date.now()) {
  if (typeof value !== 'number' || !isFinite(value)) return;

  const storeKey = ACCUMULATOR_PREFIX + key;
  try {
    const existing = await get(storeKey);
    const history  = Array.isArray(existing) ? existing : [];

    // Filter out entries older than MAX_AGE_MS
    const cutoff  = Date.now() - MAX_AGE_MS;
    const filtered = history.filter(entry => entry.t > cutoff);

    // Avoid duplicate timestamps (same polling cycle)
    const lastEntry = filtered[filtered.length - 1];
    if (lastEntry && Math.abs(lastEntry.t - timestamp) < 30_000) {
      // Update last entry instead of adding duplicate
      filtered[filtered.length - 1] = { v: value, t: timestamp };
    } else {
      filtered.push({ v: value, t: timestamp });
    }

    // Trim to max points
    const trimmed = filtered.slice(-MAX_HISTORY_POINTS);
    await set(storeKey, trimmed);
  } catch {
    // ignore
  }
}

/**
 * getHistoricalSeries
 * Returns array of { v, t } objects for sparkline rendering.
 * Returns preset fallback data if history is empty.
 *
 * @param {string} key - metric identifier
 * @param {number[]} fallbackPreset - array of numbers for empty state
 * @returns {Promise}
 */
export async function getHistoricalSeries(key, fallbackPreset = []) {
  const storeKey = ACCUMULATOR_PREFIX + key;
  try {
    const existing = await get(storeKey);
    if (Array.isArray(existing) && existing.length >= 3) {
      return existing;
    }
    // Not enough real data — return preset as synthetic history
    const now = Date.now();
    return fallbackPreset.map((v, i) => ({
      v,
      t: now - (fallbackPreset.length - 1 - i) * 15 * 60_000, // 15m intervals
    }));
  } catch {
    const now = Date.now();
    return fallbackPreset.map((v, i) => ({
      v,
      t: now - (fallbackPreset.length - 1 - i) * 15 * 60_000,
    }));
  }
}

/**
 * computeSparklineValues
 * Extracts just the numeric values array for SVG sparkline rendering.
 *
 * @param {string} key
 * @param {number[]} fallbackPreset
 * @returns {Promise}
 */
export async function computeSparklineValues(key, fallbackPreset = []) {
  const series = await getHistoricalSeries(key, fallbackPreset);
  return series.map(entry => entry.v);
}

/**
 * clearAllHistory
 * Wipes all accumulated history — useful for reset/debug.
 */
export async function clearAllHistory() {
  const METRIC_KEYS = [
    'gs10', 'dxy', 'fedFunds', 'ihsg', 'xauUsd',
    'usdIdr', 'bi_macro_biRate', 'bi_macro_cpi', 'sbn_yields',
  ];
  try {
    await Promise.all(
      METRIC_KEYS.map(k => del(ACCUMULATOR_PREFIX + k))
    );
  } catch {
    // ignore
  }
}
