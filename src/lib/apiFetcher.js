import { cacheGet, cacheSet } from "./cache.js";

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

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
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
  }
}

export async function fetchWithFallback(cacheKey, url, transformer, ttlMs = 60000, staticFallback = null) {
  // Tier 1: Fresh cache check
  const cached = cacheGet(cacheKey);
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
    const response = await fetchWithTimeout(targetUrl);
    const rawData = await response.json();
    const transformed = transformer ? transformer(rawData) : rawData;
    
    // Save to cache
    cacheSet(cacheKey, transformed, ttlMs);
    return { data: transformed, status: "ok" };
  } catch (error) {
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
