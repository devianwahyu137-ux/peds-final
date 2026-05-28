/**
 * AlphaShield API Fetcher — Hardened with AbortController integration
 * 
 * Provides tiered data resolution (cache → network → stale → static fallback)
 * with sequential abort-aware fetching infrastructure for rate-limited APIs.
 * 
 * @module apiFetcher
 */

import { safeCacheRead, safeCacheWrite } from "./cache.js";
import { validateAndNormalize } from "./schemaValidator.js";
import { appendDataPoint }  from "../lib/historicalAccumulator.js";
import { computeDelta }     from "../lib/deltaCalculator.js";
import { scheduleRetry, cancelRetry } from "../lib/autoRetryEngine.js";

export const STATIC_FALLBACK = {
  gs10: 4.40,
  dxy: 104.20,
  fedFunds: 5.33,
  biRate: 6.00,
  cpi: 2.84,
  usdIdr: 15950,
  ihsg: 7100,
  xauUsd: 2320,
  sbnYield10Y: 7.05,
  inflasiTrend: 45,
  emasTrend: 50
};

export const EDGE_ENDPOINTS = {
  biRate: "https://laquzixkcxeswmlhsnxp.supabase.co/functions/v1/bi-rate-proxy",
  cpi: "https://laquzixkcxeswmlhsnxp.supabase.co/functions/v1/cpi-inflation-proxy"
};

/**
 * Fetch with timeout and optional external abort signal.
 * Merges external signal with internal timeout controller.
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000, externalSignal = null) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // If external signal is already aborted, abort immediately
  if (externalSignal?.aborted) {
    clearTimeout(id);
    controller.abort();
    throw new Error("Aborted");
  }

  // Wire up external signal to abort internal controller
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);

    if (response.status === 429) throw new Error("Rate Limit Exceeded (429)");
    if (response.status === 403) throw new Error("Forbidden (403)");
    if (response.status === 401) throw new Error("Unauthorized (401)");
    if (!response.ok) throw new Error(`HTTP Error (${response.status})`);

    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  } finally {
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

/**
 * Tiered fetch with fallback: Cache → Network → Stale Cache → Static Fallback
 */
export async function fetchWithFallback(cacheKey, url, transformer, ttlMs = 60000, staticFallback = null, externalSignal = null) {
  // Tier 1: Fresh cache check
  const cached = safeCacheRead(cacheKey);
  if (cached && !cached.isStale) {
    return { data: cached.data, status: "ok" };
  }

  // CORS Routing logic: BI Rate and CPI Inflation route through Supabase proxy
  let targetUrl = url;
  if (cacheKey === "biRate" || cacheKey === "cpi") {
    if (EDGE_ENDPOINTS[cacheKey]) {
      targetUrl = EDGE_ENDPOINTS[cacheKey];
    }
  }

  // Tier 2: Network Fetch
  try {
    const response = await fetchWithTimeout(targetUrl, {}, 8000, externalSignal);
    const rawData = await response.json();

    // Use custom transformer first, fall back to universal schema validator
    let transformed;
    if (transformer) {
      transformed = transformer(rawData);
    } else {
      const validated = validateAndNormalize(rawData, "edge", cacheKey);
      if (validated === null) {
        throw new Error("SCHEMA_VALIDATION_FAILED");
      }
      transformed = validated;
    }

    // Save to cache (non-blocking)
    safeCacheWrite(cacheKey, transformed, ttlMs);
    return { data: transformed, status: "ok" };
  } catch (error) {
    // If aborted, resolve cleanly without throwing to dead view components
    if (externalSignal?.aborted || error?.name === "AbortError") {
      const fallbackValue = cached?.data ?? (staticFallback !== null ? staticFallback : STATIC_FALLBACK[cacheKey]);
      return { data: fallbackValue, status: "aborted" };
    }

    console.warn(`Fetch failed for key: ${cacheKey}, error:`, error.message);

    // Tier 3: Fallback modes
    if (cached) {
      // Fall back to stale cache
      return { data: cached.data, status: "stale" };
    }

    // Fall back to static baseline
    const fallbackValue = staticFallback !== null ? staticFallback : STATIC_FALLBACK[cacheKey];
    return { data: fallbackValue, status: "fallback" };
  }
}

/**
 * Delay helper with abort awareness.
 * Resolves immediately if signal is aborted.
 */
function abortableDelay(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) { resolve(); return; }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => { clearTimeout(timer); resolve(); };
    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

/**
 * Sequential fetch pipeline with AbortController integration.
 * Executes tickers in order with strict exit gates between each step:
 *   FRED (0s) → IHSG (2s) → XAUUSD (12s) → USDIDR (12s) → BI Macro
 * 
 * Resolves cleanly on abort — never throws to dead view components.
 * 
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @param {Function} setLiveMetric - Store action to set live metric value
 * @param {Function} setEndpointStatus - Store action to set endpoint status
 * @param {Object} transformers - Map of transformer functions per ticker key
 */
export async function fetchSequentialWithAbort(signal, setLiveMetric, setEndpointStatus, transformers) {
  const fetchAndStore = async (key, url, transformer, ttlMs) => {
    if (signal.aborted) return;
    try {
      setEndpointStatus(key, "fetching");
      const res = await fetchWithFallback(key, url, transformer, ttlMs, null, signal);
      if (signal.aborted) return;
      
      const value = res.data;
      const status = res.status;
      const timestamp = Date.now();

      // Wire delta computation
      if (value != null && isFinite(value)) {
        const deltaInfo = computeDelta(key, value, timestamp);
        // Construct payload since res.data is just a number
        const payload = {
          v: value,
          t: timestamp,
          ok: status === "ok",
          src: status === "ok" ? "api" : (status === "stale" ? "stale_cache" : "static_fallback"),
          d: deltaInfo.delta,
          _dir: deltaInfo.direction
        };
        setLiveMetric(key, payload);

        // Accumulate to IndexedDB history (fire and forget)
        appendDataPoint(key, value, timestamp).catch(() => {});

        // Cancel any pending retry for this key since fetch succeeded
        if (status === "ok") {
          cancelRetry(key);
        }
      } else {
        setLiveMetric(key, value);
      }
      
      setEndpointStatus(key, status);

      // Schedule auto-retry for failed endpoints
      if (status === "fallback" || status === "stale" || status === "aborted") {
        const endpointType =
          key.startsWith('gs10') || key.startsWith('dxy') || key.startsWith('fed')
            ? 'fred'
            : key.startsWith('bi_') || key.startsWith('sbn')
              ? 'edge'
              : 'av';

        scheduleRetry(
          key,
          endpointType,
          () => fetchWithFallback(key, url, transformer, ttlMs, null), // Use generic fallback fetch for retry
          (k, successResult) => {
            const val = successResult.data;
            const ts = Date.now();
            if (val != null && isFinite(val)) {
                const retryDelta = computeDelta(k, val, ts);
                const retryPayload = {
                  v: val, t: ts, ok: true, src: "api_retry",
                  d: retryDelta.delta, _dir: retryDelta.direction
                };
                setLiveMetric(k, retryPayload);
                appendDataPoint(k, val, ts).catch(() => {});
                cancelRetry(k);
            }
            setEndpointStatus(k, 'ok');
          },
          (k) => {
            console.warn(`[AutoRetry] All retries exhausted for ${k}`);
          }
        );
      }
    } catch (e) {
      if (signal.aborted) return;
      console.error(`Failed fetching ${key}:`, e);
      setEndpointStatus(key, "failed");
    }
  };

  // ── FRED Block (0s delay) ────────────────────────────
  if (signal.aborted) return;
  await Promise.all([
    fetchAndStore("gs10", "https://api.stlouisfed.org/fred/series/observations?series_id=GS10&api_key=demo&file_type=json", transformers.fred, 900000),
    fetchAndStore("dxy", "https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS&api_key=demo&file_type=json", transformers.fred, 900000),
    fetchAndStore("fedFunds", "https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=demo&file_type=json", transformers.fred, 900000),
  ]);

  // ── Exit gate: Check abort before IHSG ────────────────
  if (signal.aborted) return;
  await abortableDelay(2000, signal);

  // ── IHSG (2s delay) ──────────────────────────────────
  if (signal.aborted) return;
  await fetchAndStore("ihsg", "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=^JKSE&apikey=demo", transformers.avQuote, 600000);

  // ── Exit gate: Check abort before XAUUSD ──────────────
  if (signal.aborted) return;
  await abortableDelay(12000, signal);

  // ── XAUUSD (12s delay frame gap) ─────────────────────
  if (signal.aborted) return;
  await fetchAndStore("xauUsd", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=demo", transformers.avExchangeRate, 600000);

  // ── Exit gate: Check abort before USDIDR ──────────────
  if (signal.aborted) return;
  await abortableDelay(12000, signal);

  // ── USDIDR (12s delay frame gap) ─────────────────────
  if (signal.aborted) return;
  await fetchAndStore("usdIdr", "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=IDR&apikey=demo", transformers.avExchangeRate, 600000);

  // ── Exit gate: Check abort before BI Macro ────────────
  if (signal.aborted) return;

  // ── BI Macro Block ───────────────────────────────────
  await Promise.all([
    fetchAndStore("biRate", EDGE_ENDPOINTS.biRate, transformers.biRate, 3600000),
    fetchAndStore("cpi", EDGE_ENDPOINTS.cpi, transformers.cpi, 3600000),
  ]);

  // ── Fallback triggers for assets without live endpoints ─
  if (signal.aborted) return;
  await Promise.all([
    fetchAndStore("sbnYield10Y", "", null, 3600000),
    fetchAndStore("inflasiTrend", "", null, 3600000),
    fetchAndStore("emasTrend", "", null, 3600000),
  ]);
}
