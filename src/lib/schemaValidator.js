/**
 * AlphaShield Schema Validator
 *
 * Universal Schema Validator — transforms API response variations
 * into a lean unified format { v, d, t, src, ok }
 * Never throws, always returns a valid object or null.
 *
 * @module schemaValidator
 */

export const LEAN_SCHEMA_VERSION = 3;

/**
 * validateAndNormalize
 * Accepts raw API response in any format,
 * extracts valid value, and returns lean schema or null.
 *
 * @param {any} raw        - raw response from API
 * @param {string} type    - endpoint type: "fred" | "av_quote" | "av_fx" | "edge"
 * @param {string} srcKey  - source identifier: "gs10" | "ihsg" | "biMacro" etc.
 * @returns {object|null}  - lean schema or null
 */
export function validateAndNormalize(raw, type, srcKey) {
  try {
    if (!raw || typeof raw !== "object") return null;

    let value = null;
    let delta = 0;

    switch (type) {
      case "fred": {
        // FRED: { observations: [{ value: "4.40", date: "2024-01-15" }] }
        // Edge case: FRED uses string "." for missing data
        const obs = raw?.observations;
        if (!Array.isArray(obs) || obs.length === 0) return null;
        const lastObs = obs[obs.length - 1];
        if (!lastObs || lastObs.value === "." || lastObs.value === "") return null;
        value = parseFloat(lastObs.value);
        break;
      }

      case "av_quote": {
        // Alpha Vantage Global Quote — two possible structures:
        // { "Global Quote": { "05. price": "7100.00" } }
        // { "Global Quote": { price: "7100.00" } }
        const q = raw?.["Global Quote"] ?? raw?.globalQuote ?? {};
        value = parseFloat(
          q["05. price"] ??
          q["price"] ??
          q["4. close"] ??
          null
        );
        const rawDelta = q["10. change percent"] ?? q["changePct"] ?? "0";
        delta = parseFloat(String(rawDelta).replace("%", "")) || 0;
        break;
      }

      case "av_fx": {
        // Alpha Vantage FX — two possible structures:
        // { "Realtime Currency Exchange Rate": { "5. Exchange Rate": "15950" } }
        const r = raw?.["Realtime Currency Exchange Rate"] ??
                  raw?.realtimeCurrencyExchangeRate ?? {};
        value = parseFloat(
          r["5. Exchange Rate"] ??
          r["exchangeRate"] ??
          null
        );
        break;
      }

      case "edge": {
        // Supabase Edge Function — our own format, more flexible
        if (raw.biRate !== undefined) {
          return {
            biRate: parseFloat(raw.biRate) || 0,
            cpi:    parseFloat(raw.cpi)    || 0,
            v:      parseFloat(raw.biRate) || 0,
            d:      0,
            t:      raw.timestamp ? new Date(raw.timestamp).getTime() : Date.now(),
            src:    "edge",
            ok:     !raw.error,
            _raw:   raw,
          };
        }
        if (raw.y10 !== undefined) {
          return {
            y1:  parseFloat(raw.y1)  || 0,
            y3:  parseFloat(raw.y3)  || 0,
            y5:  parseFloat(raw.y5)  || 0,
            y10: parseFloat(raw.y10) || 0,
            v:   parseFloat(raw.y10) || 0,
            d:   0,
            t:   Date.now(),
            src: "edge",
            ok:  true,
          };
        }
        // Single-value edge response
        if (raw.value !== undefined) {
          return {
            v:   parseFloat(raw.value) || 0,
            d:   0,
            t:   Date.now(),
            src: "edge",
            ok:  !raw.error,
          };
        }
        return null;
      }

      default:
        return null;
    }

    // Final validation: value must be finite and not NaN
    if (!isFinite(value) || isNaN(value)) return null;

    return {
      v:   value,
      d:   isFinite(delta) ? delta : 0,
      t:   Date.now(),
      src: type,
      ok:  true,
    };

  } catch (err) {
    // Validator must never throw to caller
    console.warn(`[SchemaValidator] Failed for ${srcKey}:`, err.message);
    return null;
  }
}

/**
 * isLivePayload
 * Checks whether payload qualifies as "LIVE" vs "STALE/FALLBACK"
 */
export function isLivePayload(payload) {
  if (!payload) return false;
  if (payload.ok === false) return false;
  if (payload.src === "static_fallback") return false;
  if (payload.src === "stale_cache") return false;
  // Data is fresh if less than 30 minutes old
  const ageMs = Date.now() - (payload.t ?? 0);
  return ageMs < 30 * 60 * 1000;
}

/**
 * getPayloadStatus
 * Returns a single status string for any payload shape.
 * Replaces multi-branch if/else logic in the store.
 *
 * @param {object|null} payload
 * @returns {"ok"|"stale"|"fallback"|"idle"}
 */
export function getPayloadStatus(payload) {
  if (!payload) return "idle";
  if (isLivePayload(payload)) return "ok";
  if (payload.src === "stale_cache") return "stale";
  if (payload.src === "static_fallback") return "fallback";
  // Payload exists but doesn't match any known live/stale/fallback pattern
  if (payload.ok === true) return "ok";
  return "fallback";
}
