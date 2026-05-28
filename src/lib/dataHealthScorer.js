// src/lib/dataHealthScorer.js
// Computes a unified 0-100 health score from all endpoint statuses
// Used by NavHealthIndicator to show single system health gauge

const STATUS_WEIGHTS = {
  ok:       100,
  stale:    50,
  fallback: 20,
  loading:  60,  // optimistic — might become ok
  idle:     0,
  error:    0,
};

// Endpoint importance weights (sum = 100)
const ENDPOINT_IMPORTANCE = {
  bi_macro:   25,  // BI Rate + CPI — most critical for IDR platform
  usdIdr:     20,  // USD/IDR spot
  ihsg:       15,  // IHSG
  dxy:        15,  // DXY
  gs10:       15,  // US 10Y Yield
  sbn_yields: 10,  // SBN yield curve
};

/**
 * computeHealthScore
 * Returns 0-100 weighted health score.
 *
 * @param {object} endpointStatus - { key: status } from dataStore
 * @returns {{ score: number, grade: string, color: string, label: string }}
 */
export function computeHealthScore(endpointStatus) {
  if (!endpointStatus || !Object.keys(endpointStatus).length) {
    return { score: 0, grade: 'F', color: '#ef4444', label: 'TIDAK AKTIF' };
  }

  let weightedScore = 0;
  let totalWeight   = 0;

  Object.entries(ENDPOINT_IMPORTANCE).forEach(([key, weight]) => {
    const status      = endpointStatus[key] ?? 'idle';
    const statusScore = STATUS_WEIGHTS[status] ?? 0;
    weightedScore    += statusScore * weight;
    totalWeight      += weight;
  });

  const score = totalWeight > 0
    ? Math.round(weightedScore / totalWeight)
    : 0;

  if (score >= 85) return { score, grade: 'A', color: '#10b981', label: 'OPTIMAL'   };
  if (score >= 65) return { score, grade: 'B', color: '#10b981', label: 'BAIK'      };
  if (score >= 45) return { score, grade: 'C', color: '#f59e0b', label: 'SEDANG'    };
  if (score >= 25) return { score, grade: 'D', color: '#f97316', label: 'TERBATAS'  };
  return                  { score, grade: 'F', color: '#ef4444', label: 'ESTIMASI'  };
}

/**
 * getLiveEndpointCount
 * Returns { live, total } count.
 */
export function getLiveEndpointCount(endpointStatus) {
  const keys  = Object.keys(ENDPOINT_IMPORTANCE);
  const live  = keys.filter(k => endpointStatus[k] === 'ok').length;
  return { live, total: keys.length };
}
