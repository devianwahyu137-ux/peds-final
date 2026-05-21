const PREFIX = "as_cache_";

/**
 * Write value to cache with TTL
 */
export function cacheSet(key, data, ttlMs) {
  try {
    const savedAt = Date.now();
    const expiresAt = savedAt + (ttlMs || 0);
    const payload = JSON.stringify({ data, savedAt, expiresAt });
    localStorage.setItem(`${PREFIX}${key}`, payload);
  } catch (e) {
    console.warn("cacheSet failed (storage quota exceeded or restricted):", e);
  }
}

/**
 * Read value from cache, evaluating stale status without eviction
 */
export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    const isStale = Date.now() > parsed.expiresAt;
    
    return {
      data: parsed.data,
      isStale
    };
  } catch (e) {
    console.error("cacheGet failed parsing payload:", e);
    return null;
  }
}

/**
 * Return operational state of all cached items
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
            ageMs: now - parsed.savedAt,
            isStale: now > parsed.expiresAt,
            remainingMs: Math.max(0, parsed.expiresAt - now)
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
