// src/lib/monteCarloEngine.js
// Pure Monte Carlo simulation engine for portfolio path generation
// Runs 1,000 simulations × 252 trading days
// Uses geometric Brownian motion: dS = μdt + σ√dt × Z
// where Z ~ N(0,1) using Box-Muller transform
// Zero external dependencies

// ── Box-Muller transform for normal distribution sampling ──────
function boxMuller() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ── Single portfolio path simulation ──────────────────────────
function simulatePath(annualReturn, annualVolatility, days, initialValue) {
  const dt        = 1 / 252;
  const drift     = (annualReturn - 0.5 * annualVolatility ** 2) * dt;
  const diffusion = annualVolatility * Math.sqrt(dt);

  const path = new Float32Array(days + 1);
  path[0] = initialValue;

  for (let t = 1; t <= days; t++) {
    const z = boxMuller();
    path[t] = path[t - 1] * Math.exp(drift + diffusion * z);
  }
  return path;
}

// ── Generate percentile bands from simulation paths ────────────
function computePercentileBands(paths, percentiles = [5, 25, 50, 75, 95]) {
  const days     = paths[0].length;
  const numPaths = paths.length;
  const bands    = {};

  percentiles.forEach(p => { bands[p] = new Float32Array(days); });

  for (let t = 0; t < days; t++) {
    const dayValues = paths.map(path => path[t]).sort((a, b) => a - b);
    percentiles.forEach(p => {
      const idx = Math.floor((p / 100) * (numPaths - 1));
      bands[p][t] = dayValues[idx];
    });
  }
  return bands;
}

// ── Compute Efficient Frontier points ─────────────────────────
// Generates N random portfolios on the risk-return space
// to approximate the efficient frontier boundary
function generateFrontierPoints(
  expectedReturns,  // { stocks, bonds, gold, cash } — annualized decimal
  covMatrix,        // 2D array [4][4] covariance matrix
  numPoints = 300
) {
  const assets = ['stocks', 'bonds', 'gold', 'cash'];
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    // Generate random weights that sum to 1
    const raw     = assets.map(() => Math.random());
    const sum     = raw.reduce((a, b) => a + b, 0);
    const weights = raw.map(r => r / sum);

    // Portfolio expected return: w^T × E(R)
    const portReturn = assets.reduce(
      (acc, asset, idx) => acc + weights[idx] * (expectedReturns[asset] ?? 0),
      0
    );

    // Portfolio variance: w^T × Σ × w (double sum)
    let portVariance = 0;
    for (let a = 0; a < assets.length; a++) {
      for (let b = 0; b < assets.length; b++) {
        portVariance += weights[a] * weights[b] * covMatrix[a][b];
      }
    }
    const portStdDev = Math.sqrt(Math.max(0, portVariance));

    points.push({
      weights:    Object.fromEntries(assets.map((a, idx) => [a, weights[idx]])),
      returnPct:  Math.round(portReturn * 10000) / 100,   // in %
      riskPct:    Math.round(portStdDev * 10000) / 100,   // in %
      sharpe:     portStdDev > 0
                  ? Math.round(((portReturn - 0.055) / portStdDev) * 100) / 100
                  : 0,
    });
  }

  // Sort by risk for frontier visualization
  return points.sort((a, b) => a.riskPct - b.riskPct);
}

// ── MAIN EXPORT: runMonteCarloSimulation ───────────────────────
export function runMonteCarloSimulation({
  portfolioReturn,    // annualized percentage, e.g. 12 for 12%
  portfolioStdDev,    // annualized percentage, e.g. 8 for 8%
  initialCapital = 100_000_000,  // IDR
  numSimulations = 1000,
  horizonDays = 252,  // 1 trading year
  expectedReturns,    // { stocks, bonds, gold, cash } decimal
  covMatrix,          // 2D array [4][4]
}) {
  // Convert percentages to decimals for GBM formula
  const annRet = portfolioReturn / 100;
  const annVol = portfolioStdDev / 100;

  // Run all simulation paths
  const paths = [];
  for (let i = 0; i < numSimulations; i++) {
    paths.push(simulatePath(annRet, annVol, horizonDays, initialCapital));
  }

  // Compute percentile bands
  const bands = computePercentileBands(paths);

  // Final values distribution
  const finalValues = paths.map(p => p[horizonDays]).sort((a, b) => a - b);
  const median      = finalValues[Math.floor(numSimulations * 0.50)];
  const worstCase   = finalValues[Math.floor(numSimulations * 0.05)];
  const bestCase    = finalValues[Math.floor(numSimulations * 0.95)];

  // Probability of loss (final < initial)
  const lossCount  = finalValues.filter(v => v < initialCapital).length;
  const probOfLoss = Math.round((lossCount / numSimulations) * 100);

  // Efficient frontier points
  const frontierPoints = expectedReturns && covMatrix
    ? generateFrontierPoints(expectedReturns, covMatrix)
    : [];

  return {
    bands,          // percentile bands for path visualization
    finalValues,    // sorted array of all final values
    summary: {
      initialCapital,
      median:          Math.round(median),
      worstCase:       Math.round(worstCase),
      bestCase:        Math.round(bestCase),
      probOfLoss,
      medianReturnPct: Math.round(((median - initialCapital) / initialCapital) * 10000) / 100,
      worstReturnPct:  Math.round(((worstCase - initialCapital) / initialCapital) * 10000) / 100,
      bestReturnPct:   Math.round(((bestCase - initialCapital) / initialCapital) * 10000) / 100,
    },
    frontierPoints,
    horizonDays,
    numSimulations,
  };
}

// ── WORKER-SAFE EXPORTS ────────────────────────────────────────
export { generateFrontierPoints, computePercentileBands };
