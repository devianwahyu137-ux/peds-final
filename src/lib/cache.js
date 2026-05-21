/**
 * AlphaShield Cache Controller v3
 * 
 * Compressed storage schema with non-blocking I/O, LRU eviction,
 * and structural schema version validation.
 * 
 * Schema structure (version 3):
 *   { v: value, d: delta_pct, t: unix_timestamp, src: string, ok: boolean, _sv: 3, _ex: expiresAt }
 * 
 * @module cache
 */

const PREFIX = "as_";
const SCHEMA_VERSION = 3;

/**
 * Schedule a callback using requestIdleCallback with a setTimeout fallback.
 * Prevents blocking main-thread paint operations.
 */
function scheduleIdle(callback) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * LRU eviction — removes the oldest cached entry by internal timestamp.
 * Scans all 'as_' prefixed keys, sorts by saved timestamp, and removes the oldest.
 */
export function evictOldestCacheEntry() {
  try {
    const entries = [];

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(PREFIX)) {
        try {
          const raw = localStorage.getItem(storageKey);
          const parsed = JSON.parse(raw);
          entries.push({ key: storageKey, t: parsed.t || 0 });
        } catch {
          // Corrupt entry — candidate for immediate removal
          entries.push({ key: storageKey, t: 0 });
        }
      }
    }

    if (entries.length === 0) return false;

    // Sort ascending by timestamp (oldest first)
    entries.sort((a, b) => a.t - b.t);
    localStorage.removeItem(entries[0].key);
    return true;
  } catch (e) {
    console.warn("evictOldestCacheEntry failed:", e);
    return false;
  }
}

/**
 * Write value to cache with TTL using non-blocking requestIdleCallback.
 * Automatically handles QuotaExceededError via LRU eviction loop.
 * 
 * @param {string} key - Cache key (without prefix)
 * @param {*} data - Value to cache
 * @param {number} ttlMs - Time-to-live in milliseconds
 */
export function safeCacheWrite(key, data, ttlMs) {
  scheduleIdle(() => {
    const now = Date.now();
    const payload = JSON.stringify({
      v: data,
      d: 0,
      t: now,
      src: "live",
      ok: true,
      _sv: SCHEMA_VERSION,
      _ex: now + (ttlMs || 0)
    });

    let retries = 5;
    while (retries > 0) {
      try {
        localStorage.setItem(`${PREFIX}${key}`, payload);
        return; // Success — exit
      } catch (e) {
        if (e?.name === "QuotaExceededError" || e?.code === 22) {
          const evicted = evictOldestCacheEntry();
          if (!evicted) {
            console.warn("safeCacheWrite: quota exceeded, no more entries to evict for key:", key);
            return;
          }
          retries--;
        } else {
          console.warn("safeCacheWrite failed for key:", key, e);
          return;
        }
      }
    }
  });
}

/**
 * Read value from cache with structural schema version validation.
 * Rejects entries that don't match SCHEMA_VERSION (locked to v3).
 * 
 * @param {string} key - Cache key (without prefix)
 * @returns {{ data: *, isStale: boolean } | null}
 */
export function safeCacheRead(key) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Schema version validation — reject outdated structures
    if (parsed._sv !== SCHEMA_VERSION) {
      localStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }

    const isStale = Date.now() > parsed._ex;

    return {
      data: parsed.v,
      isStale
    };
  } catch (e) {
    console.error("safeCacheRead failed parsing payload for key:", key, e);
    return null;
  }
}

/**
 * Return operational state of all cached items.
 */
export function cacheStatus() {
  const status = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(PREFIX)) {
        try {
          const raw = localStorage.getItem(storageKey);
          const parsed = JSON.parse(raw);
          const now = Date.now();
          const cleanKey = storageKey.slice(PREFIX.length);

          status[cleanKey] = {
            ageMs: now - (parsed.t || 0),
            isStale: now > (parsed._ex || 0),
            remainingMs: Math.max(0, (parsed._ex || 0) - now),
            schemaVersion: parsed._sv || 0
          };
        } catch (err) {
          console.debug("Failed parsing individual cache status key:", storageKey, err);
        }
      }
    }
  } catch (e) {
    console.debug("cacheStatus main iteration failed:", e);
  }
  return status;
}

// Backward-compatible aliases for existing consumers
export const cacheSet = safeCacheWrite;
export const cacheGet = safeCacheRead;
