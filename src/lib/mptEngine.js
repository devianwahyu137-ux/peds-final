// Quantitative portfolio optimization engine for AlphaShield

// Empirical volatilities (scale 0-1)
export const ASSET_VOL = {
  stocks: 0.18,
  bonds: 0.06,
  gold: 0.15,
  cash: 0.01
};

// Baseline returns for each scenario (scale 0-1)
export const EXPECTED_RETURNS = {
  EQUILIBRIUM: { stocks: 0.185, bonds: 0.072, gold: 0.08, cash: 0.035 },
  TIGHTENING: { stocks: 0.095, bonds: 0.085, gold: 0.10, cash: 0.045 },
  CURRENCY_STRESS: { stocks: 0.030, bonds: 0.065, gold: 0.18, cash: 0.050 }
};

// Pairwise correlation matrix
export const CORR_MATRIX = {
  stocks_stocks: 1.0,
  stocks_bonds: 0.20,
  stocks_gold: -0.10,
  stocks_cash: 0.05,
  bonds_stocks: 0.20,
  bonds_bonds: 1.0,
  bonds_gold: 0.15,
  bonds_cash: 0.10,
  gold_stocks: -0.10,
  gold_bonds: 0.15,
  gold_gold: 1.0,
  gold_cash: 0.02,
  cash_stocks: 0.05,
  cash_bonds: 0.10,
  cash_gold: 0.02,
  cash_cash: 1.0
};

// Macro baseline equilibrium figures (scale 0-100 in % or absolute for usdIdr)
const EQUILIBRIUM_BASES = {
  biRate: 5.50,
  inflation: 2.80,
  usdIdr: 15.850 // in thousands
};

// Elasticity coefficients: Change in asset return per unit deviation of macro inputs
const ELASTICITY = {
  stocks: { biRate: -0.015, inflation: -0.01, usdIdr: -0.005 },
  bonds:  { biRate: -0.005, inflation: -0.015, usdIdr: -0.002 },
  gold:   { biRate: -0.002, inflation: 0.025, usdIdr: 0.012 },
  cash:   { biRate: 0.004, inflation: -0.001, usdIdr: 0.006 }
};

/**
 * Computes asset returns adjusted by macroeconomic deviations from equilibrium and DXY live multipliers
 */
export function computeShockedReturns(scenarioId, macroInputs) {
  const baseReturns = EXPECTED_RETURNS[scenarioId] || EXPECTED_RETURNS.EQUILIBRIUM;
  const shocked = {};

  // Extract current values. If inputs are in decimal fractions (0-1), scale them up for elasticity comparison
  const biRateVal = macroInputs.biRate * 100;
  const inflationVal = macroInputs.inflation * 100;
  const usdIdrVal = macroInputs.usdIdr; // Spot rate in thousands

  const biRateDev = biRateVal - EQUILIBRIUM_BASES.biRate;
  const inflationDev = inflationVal - EQUILIBRIUM_BASES.inflation;
  const usdIdrDev = usdIdrVal - EQUILIBRIUM_BASES.usdIdr;

  const dxyAdjMap = {
    stocks: macroInputs.dxyEquityAdj || 0,
    bonds: macroInputs.dxyBondsAdj || 0,
    gold: macroInputs.dxyGoldAdj || 0,
    cash: macroInputs.dxyCashAdj || 0
  };

  for (const asset of Object.keys(baseReturns)) {
    const shock = (ELASTICITY[asset].biRate * biRateDev) +
                  (ELASTICITY[asset].inflation * inflationDev) +
                  (ELASTICITY[asset].usdIdr * usdIdrDev);
    const dxyAdj = dxyAdjMap[asset] || 0;
    // Allow returns to drop to -20% to model extreme stress regimes
    shocked[asset] = Math.max(-0.20, baseReturns[asset] + shock + dxyAdj);
  }

  return shocked;
}

/**
 * Generates the covariance matrix of assets
 */
export function generateCovarianceMatrix() {
  const assets = ["stocks", "bonds", "gold", "cash"];
  const cov = {};

  for (let i = 0; i < assets.length; i++) {
    const a1 = assets[i];
    cov[a1] = {};
    for (let j = 0; j < assets.length; j++) {
      const a2 = assets[j];
      const corr = CORR_MATRIX[`${a1}_${a2}`] || 0;
      cov[a1][a2] = ASSET_VOL[a1] * ASSET_VOL[a2] * corr;
    }
  }
  return cov;
}

/**
 * Calculates the Sharpe Ratio: (Return - RiskFree) / Volatility
 */
export function computeSharpeRatio(portfolioReturn, portfolioVol, riskFreeRate) {
  if (portfolioVol <= 0) return 0;
  return (portfolioReturn - riskFreeRate) / portfolioVol;
}

/**
 * Runs the Markowitz Modern Portfolio Theory analytics engine
 */
export function runMPTEngine(weights, scenarioId, macroInputs) {
  const assets = ["stocks", "bonds", "gold", "cash"];
  
  // Normalize weights to sum to 1
  const totalW = assets.reduce((sum, a) => sum + (weights[a] || 0), 0);
  const w = {};
  assets.forEach(a => {
    w[a] = totalW > 0 ? (weights[a] || 0) / totalW : 0;
  });

  // Calculate shocked returns
  const returns = computeShockedReturns(scenarioId, macroInputs);
  
  // Compute portfolio return
  const pReturn = assets.reduce((sum, a) => sum + w[a] * returns[a], 0);

  // Compute portfolio variance
  const cov = generateCovarianceMatrix();
  let pVariance = 0;
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      pVariance += w[assets[i]] * w[assets[j]] * cov[assets[i]][assets[j]];
    }
  }

  const pVol = Math.sqrt(pVariance);

  // Risk-free rate is SBN 10Y yield minus 150bps term premium
  const sbnYield = macroInputs.sbn10y; // in scale 0-1
  const riskFreeRate = Math.max(0, sbnYield - 0.015);

  const sharpe = computeSharpeRatio(pReturn, pVol, riskFreeRate);

  // Portfolio Beta
  const betas = { stocks: 1.0, bonds: 0.15, gold: 0.05, cash: 0.0 };
  const pBeta = assets.reduce((sum, a) => sum + w[a] * betas[a], 0);

  // Max drawdown proxy (95% VaR proxy)
  const maxDrawdown = -(pVol * 1.65);

  return {
    portfolioReturn: pReturn,
    portfolioVolatility: pVol,
    sharpeRatio: sharpe,
    portfolioBeta: pBeta,
    maxDrawdown: maxDrawdown,
    riskFreeRate: riskFreeRate,
    shockedReturns: returns
  };
}

// Institutional exports and aliases
export const ASSETS = ["stocks", "bonds", "gold", "cash"];
export { 
  CORR_MATRIX as BASE_CORR, 
  ASSET_VOL as BASE_SIGMA, 
  generateCovarianceMatrix as buildCovarianceMatrix 
};
