import { BASE_SIGMA } from "./mptEngine.js";

/**
 * Resolve risk-free rate from live SBN 10Y yield or BI Rate fallback
 */
export function resolvRiskFreeRate(sbnYield10Y, biRate) {
  if (sbnYield10Y !== undefined && sbnYield10Y !== null && !isNaN(sbnYield10Y)) {
    return sbnYield10Y / 100;
  }
  const fallbackBi = (biRate !== undefined && biRate !== null) ? biRate : 5.50;
  return (fallbackBi / 100) + 0.015;
}

/**
 * Compute returns adjustment multipliers based on DXY index boundaries
 */
export function computeDxyRiskMultiplier(dxy) {
  if (dxy > 108.00) {
    return { stocks: -0.05, bonds: -0.03, gold: 0.04, cash: 0.02 };
  } else if (dxy > 104.50) {
    return { stocks: -0.02, bonds: -0.01, gold: 0.01, cash: 0.005 };
  }
  return { stocks: 0.0, bonds: 0.0, gold: 0.0, cash: 0.0 };
}

/**
 * Compute trend volatility multipliers based on inflation and gold trend fear indicators
 */
export function computeTrendsVolatilityAdjustment(inflasiTrend, emasTrend, baseSigma) {
  let factor = 1.0;
  const maxTrend = Math.max(inflasiTrend || 0, emasTrend || 0);
  if (maxTrend > 85) {
    factor = 1.30;
  } else if (maxTrend > 70) {
    factor = 1.15;
  }

  const adjusted = {};
  for (const asset of Object.keys(baseSigma)) {
    adjusted[asset] = baseSigma[asset] * factor;
  }
  return adjusted;
}

/**
 * Aggregate parameters for live MPT computations
 */
export function buildLiveEngineParams(liveData) {
  const dxyAdj = computeDxyRiskMultiplier(liveData.dxy);
  const riskFreeRate = resolvRiskFreeRate(liveData.sbnYield10Y, liveData.biRate);
  const adjSigma = computeTrendsVolatilityAdjustment(liveData.inflasiTrend, liveData.emasTrend, BASE_SIGMA);

  return {
    dxyEquityAdj: dxyAdj.stocks,
    dxyBondsAdj: dxyAdj.bonds,
    dxyGoldAdj: dxyAdj.gold,
    dxyCashAdj: dxyAdj.cash,
    riskFreeRate,
    adjustedVolatilities: adjSigma
  };
}
