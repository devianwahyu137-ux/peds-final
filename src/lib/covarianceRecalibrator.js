import { BASE_CORR, BASE_SIGMA, ASSETS } from "./mptEngine.js";
import { computeTrendsVolatilityAdjustment } from "./macroMappings.js";

/**
 * Recalibrate pairwise asset correlation matrix based on DXY, inflation, and gold trends
 */
export function recalibrateCorrelationMatrix(dxy, inflasiTrend, emasTrend) {
  const corr = {};
  
  // Initialize with baseline values
  for (const a1 of ASSETS) {
    corr[a1] = {};
    for (const a2 of ASSETS) {
      const key = `${a1}_${a2}`;
      corr[a1][a2] = BASE_CORR[key] !== undefined ? BASE_CORR[key] : 0;
    }
  }

  // 1. DXY Rule
  if (dxy > 106) {
    corr.stocks.bonds += 0.10;
    corr.bonds.stocks += 0.10;
  }

  // 2. Inflation Trend Rule
  if (inflasiTrend > 70) {
    corr.stocks.gold -= 0.12;
    corr.gold.stocks -= 0.12;

    corr.bonds.gold -= 0.08;
    corr.gold.bonds -= 0.08;

    corr.stocks.cash += 0.06;
    corr.cash.stocks += 0.06;
  }

  // 3. Emas Trend Rule (Commodity Decoupling)
  if (emasTrend > 75) {
    const others = ["stocks", "bonds", "cash"];
    for (const other of others) {
      const val = corr.gold[other];
      let newVal = val;
      if (val > 0) {
        newVal = Math.max(0, val - 0.05);
      } else if (val < 0) {
        newVal = Math.min(0, val + 0.05);
      }
      corr.gold[other] = newVal;
      corr[other].gold = newVal;
    }
  }

  // 4. Force diagonal to 1.0, clamp correlation boundaries, and enforce absolute symmetry
  for (const a1 of ASSETS) {
    for (const a2 of ASSETS) {
      if (a1 === a2) {
        corr[a1][a2] = 1.0;
      } else {
        const clampedVal = Math.max(-0.99, Math.min(0.99, corr[a1][a2]));
        corr[a1][a2] = clampedVal;
        corr[a2][a1] = clampedVal;
      }
    }
  }

  return corr;
}

/**
 * Aggregate the adjusted correlation matrix with the adjusted volatility vectors
 */
export function buildLiveCovarianceMatrix(liveData) {
  const adjSigma = computeTrendsVolatilityAdjustment(
    liveData.inflasiTrend,
    liveData.emasTrend,
    BASE_SIGMA
  );

  const adjCorr = recalibrateCorrelationMatrix(
    liveData.dxy,
    liveData.inflasiTrend,
    liveData.emasTrend
  );

  const cov = {};
  for (const a1 of ASSETS) {
    cov[a1] = {};
    for (const a2 of ASSETS) {
      cov[a1][a2] = adjSigma[a1] * adjSigma[a2] * adjCorr[a1][a2];
    }
  }

  return cov;
}
