// Run with: node scratch_all_scores.js
const ASSET_VOL = {
  stocks: 0.18,
  bonds: 0.06,
  gold: 0.15,
  cash: 0.01
};

const EXPECTED_RETURNS = {
  EQUILIBRIUM: { stocks: 0.185, bonds: 0.072, gold: 0.08, cash: 0.035 },
  TIGHTENING: { stocks: 0.095, bonds: 0.085, gold: 0.10, cash: 0.045 },
  CURRENCY_STRESS: { stocks: 0.030, bonds: 0.065, gold: 0.18, cash: 0.050 },
  HIPERINFLASI: { stocks: 0.030, bonds: 0.065, gold: 0.18, cash: 0.050 }, // fallback
  RUPIAH_CRASH: { stocks: 0.030, bonds: 0.065, gold: 0.18, cash: 0.050 }  // fallback
};

const CORR_MATRIX = {
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

const EQUILIBRIUM_BASES = {
  biRate: 5.50,
  inflation: 2.80,
  usdIdr: 15.850
};

const ELASTICITY = {
  stocks: { biRate: -0.015, inflation: -0.01, usdIdr: -0.005 },
  bonds:  { biRate: -0.005, inflation: -0.015, usdIdr: -0.002 },
  gold:   { biRate: -0.002, inflation: 0.025, usdIdr: 0.012 },
  cash:   { biRate: 0.004, inflation: -0.001, usdIdr: 0.006 }
};

function computeShockedReturns(scenarioId, macroInputs) {
  const baseReturns = EXPECTED_RETURNS[scenarioId] || EXPECTED_RETURNS.EQUILIBRIUM;
  const shocked = {};

  const biRateVal = macroInputs.biRate * 100;
  const inflationVal = macroInputs.inflation * 100;
  const usdIdrVal = macroInputs.usdIdr;

  const biRateDev = biRateVal - EQUILIBRIUM_BASES.biRate;
  const inflationDev = inflationVal - EQUILIBRIUM_BASES.inflation;
  const usdIdrDev = usdIdrVal - EQUILIBRIUM_BASES.usdIdr;

  for (const asset of Object.keys(baseReturns)) {
    const shock = (ELASTICITY[asset].biRate * biRateDev) +
                  (ELASTICITY[asset].inflation * inflationDev) +
                  (ELASTICITY[asset].usdIdr * usdIdrDev);
    shocked[asset] = Math.max(-0.20, baseReturns[asset] + shock);
  }

  return shocked;
}

function generateCovarianceMatrix() {
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

function runMPTEngine(weights, scenarioId, macroInputs) {
  const assets = ["stocks", "bonds", "gold", "cash"];
  const totalW = assets.reduce((sum, a) => sum + (weights[a] || 0), 0);
  const w = {};
  assets.forEach(a => {
    w[a] = totalW > 0 ? (weights[a] || 0) / totalW : 0;
  });

  const returns = computeShockedReturns(scenarioId, macroInputs);
  const pReturn = assets.reduce((sum, a) => sum + w[a] * returns[a], 0);

  const cov = generateCovarianceMatrix();
  let pVariance = 0;
  for (let i = 0; i < assets.length; i++) {
    for (let j = 0; j < assets.length; j++) {
      pVariance += w[assets[i]] * w[assets[j]] * cov[assets[i]][assets[j]];
    }
  }

  const pVol = Math.sqrt(pVariance);
  const sbnYield = macroInputs.sbn10y;
  const riskFreeRate = Math.max(0, sbnYield - 0.015);
  const sharpe = pVol <= 0 ? 0 : (pReturn - riskFreeRate) / pVol;

  const betas = { stocks: 1.0, bonds: 0.15, gold: 0.05, cash: 0.0 };
  const pBeta = assets.reduce((sum, a) => sum + w[a] * betas[a], 0);
  const maxDrawdown = -(pVol * 1.65);

  return {
    portfolioReturn: pReturn,
    portfolioVolatility: pVol,
    sharpeRatio: sharpe,
    portfolioBeta: pBeta,
    maxDrawdown: maxDrawdown,
    riskFreeRate: riskFreeRate,
  };
}

function computeHealthScore(analytics, isAligned, isClose) {
  const sharpe = analytics.sharpeRatio;
  const stdDev = analytics.portfolioVolatility * 100;
  const mdd    = Math.abs(analytics.maxDrawdown * 100);
  const beta   = analytics.portfolioBeta;

  const efisiensi = sharpe >= 1.0 ? 20
                  : sharpe >= 0.7 ? 16
                  : sharpe >= 0.5 ? 12
                  : sharpe >= 0.3 ? 8
                  : 4;

  const stabilitas = stdDev < 5  ? 20
                   : stdDev < 8  ? 16
                   : stdDev < 12 ? 12
                   : stdDev < 18 ? 8
                   : 4;

  const perlindungan = mdd < 5  ? 20
                     : mdd < 10 ? 16
                     : mdd < 15 ? 12
                     : mdd < 25 ? 8
                     : 4;

  const diversifikasi = (beta >= 0.2 && beta <= 0.5) ? 20
                      : (beta > 0.5  && beta <= 0.8) ? 16
                      : (beta >= 0.1 && beta < 0.2)  ? 12
                      : (beta > 0.8  && beta <= 1.2)  ? 8
                      : 4;

  const skenario = isAligned ? 20
                 : isClose   ? 12
                 : 4;

  const scores = {
    efisiensi,
    stabilitas,
    perlindungan,
    diversifikasi,
    skenario,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return { scores, total };
}

const SCENARIOS = {
  EQUILIBRIUM: {
    biRate: 4.75, inflation: 2.50, usdIdr: 15850, sbn10y: 6.40,
    weights: { stocks: 40, bonds: 30, gold: 10, cash: 20 },
  },
  TIGHTENING: {
    biRate: 5.50, inflation: 3.08, usdIdr: 16800, sbn10y: 6.78,
    weights: { stocks: 15, bonds: 45, gold: 15, cash: 25 },
  },
  CURRENCY_STRESS: {
    biRate: 5.25, inflation: 3.80, usdIdr: 17700, sbn10y: 6.71,
    weights: { stocks: 5, bonds: 15, gold: 45, cash: 35 },
  },
  HIPERINFLASI: {
    biRate: 8.50, inflation: 15.00, usdIdr: 18500, sbn10y: 9.20,
    weights: { stocks: 5, bonds: 10, gold: 60, cash: 25 },
  },
  RUPIAH_CRASH: {
    biRate: 7.00, inflation: 8.50, usdIdr: 20000, sbn10y: 8.50,
    weights: { stocks: 10, bonds: 15, gold: 40, cash: 35 },
  }
};

console.log('Active | Recommended | Sharpe | Vol | Beta | MDD | Rf | Efisiensi | Stabilitas | Perlindungan | Diversifikasi | Skenario | Total');
for (const [activeSc, data] of Object.entries(SCENARIOS)) {
  for (const [recSc, recData] of Object.entries(SCENARIOS)) {
    const decMacro = {
      biRate: recData.biRate / 100,
      inflation: recData.inflation / 100,
      usdIdr: recData.usdIdr / 1000,
      sbn10y: recData.sbn10y / 100
    };
    const decWeights = {
      stocks: data.weights.stocks / 100,
      bonds: data.weights.bonds / 100,
      gold: data.weights.gold / 100,
      cash: data.weights.cash / 100
    };
    
    try {
      const result = runMPTEngine(decWeights, recSc, decMacro);
      const isAligned = activeSc === recSc;
      const isClose = (
        (activeSc === 'TIGHTENING' && recSc === 'CURRENCY_STRESS') ||
        (activeSc === 'CURRENCY_STRESS' && recSc === 'TIGHTENING')
      );
      
      const health = computeHealthScore(result, isAligned, isClose);
      console.log(`${activeSc} | ${recSc} | ${result.sharpeRatio.toFixed(3)} | ${(result.portfolioVolatility*100).toFixed(2)}% | ${result.portfolioBeta.toFixed(3)} | ${(result.maxDrawdown*100).toFixed(2)}% | ${(result.riskFreeRate*100).toFixed(2)}% | ${health.scores.efisiensi} | ${health.scores.stabilitas} | ${health.scores.perlindungan} | ${health.scores.diversifikasi} | ${health.scores.skenario} | ${health.total}`);
    } catch (e) {
      // ignore
    }
  }
}
