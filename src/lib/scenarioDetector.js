// src/lib/scenarioDetector.js
// Auto-detects the most appropriate macro scenario
// based on current live data or fallback data
// Returns confidence score and recommendation

import { formatNumber, formatPercent, formatIDR, formatPoints } from '../utils/format';

// Thresholds based on verified May 2026 conditions
const THRESHOLDS = {
  // BI Rate boundaries
  biRate: {
    equilibriumMax: 5.00,  // <= 5.00% → EQUILIBRIUM
    tighteningMax:  6.00,  // 5.00-6.00% → TIGHTENING
    // > 6.00% → CURRENCY_STRESS
  },
  // USD/IDR boundaries
  usdIdr: {
    equilibriumMax: 16000, // <= 16000 → EQUILIBRIUM
    tighteningMax:  17000, // 16000-17000 → TIGHTENING
    // > 17000 → CURRENCY_STRESS
  },
  // Inflation boundaries
  inflation: {
    equilibriumMax: 3.0,   // <= 3.0% → EQUILIBRIUM
    tighteningMax:  4.5,   // 3.0-4.5% → TIGHTENING
    // > 4.5% → CURRENCY_STRESS
  },
  // IHSG YTD decline
  ihsgDecline: {
    tighteningMin: -8,     // -8 to -15% → TIGHTENING
    stressMin:    -15,     // > -15% → CURRENCY_STRESS
  },
};

/**
 * detectOptimalScenario
 * Analyzes current macro data and returns the most appropriate
 * scenario with confidence score and reasoning.
 *
 * @param {object} macroData - { biRate, cpi, usdIdr, ihsg, dxy }
 * @returns {object} - { recommended, confidence, signals, mismatch }
 */
export function detectOptimalScenario(macroData) {
  const {
    biRate    = 5.25,
    cpi       = 3.48,
    usdIdr    = 17700,
    ihsg      = 6170,
    dxy       = 104.5,
  } = macroData;

  const scores = {
    EQUILIBRIUM:     0,
    TIGHTENING:      0,
    CURRENCY_STRESS: 0,
  };

  const signals = [];

  // ── BI Rate scoring ───────────────────────────────────────
  if (biRate <= THRESHOLDS.biRate.equilibriumMax) {
    scores.EQUILIBRIUM += 35;
    signals.push({
      indicator: 'BI Rate',
      value:     formatPercent(biRate, 2),
      verdict:   'EQUILIBRIUM',
      reason:    `BI Rate ${formatNumber(biRate, 2)}% menunjukkan kondisi akomodatif`,
      color:     '#10b981',
    });
  } else if (biRate <= THRESHOLDS.biRate.tighteningMax) {
    scores.TIGHTENING += 35;
    signals.push({
      indicator: 'BI Rate',
      value:     formatPercent(biRate, 2),
      verdict:   'TIGHTENING',
      reason:    `BI Rate ${formatNumber(biRate, 2)}% dalam zona pengetatan moneter`,
      color:     '#f59e0b',
    });
  } else {
    scores.CURRENCY_STRESS += 35;
    signals.push({
      indicator: 'BI Rate',
      value:     formatPercent(biRate, 2),
      verdict:   'CURRENCY_STRESS',
      reason:    `BI Rate ${formatNumber(biRate, 2)}% sangat tinggi — tekanan inflasi dan nilai tukar ekstrem`,
      color:     '#ef4444',
    });
  }

  // ── USD/IDR scoring ───────────────────────────────────────
  if (usdIdr <= THRESHOLDS.usdIdr.equilibriumMax) {
    scores.EQUILIBRIUM += 30;
    signals.push({
      indicator: 'USD/IDR',
      value:     formatIDR(usdIdr),
      verdict:   'EQUILIBRIUM',
      reason:    `Rupiah stabil di bawah 16.000 — zona aman`,
      color:     '#10b981',
    });
  } else if (usdIdr <= THRESHOLDS.usdIdr.tighteningMax) {
    scores.TIGHTENING += 30;
    signals.push({
      indicator: 'USD/IDR',
      value:     formatIDR(usdIdr),
      verdict:   'TIGHTENING',
      reason:    `Rupiah mulai tertekan di kisaran 16.000-17.000`,
      color:     '#f59e0b',
    });
  } else {
    scores.CURRENCY_STRESS += 30;
    signals.push({
      indicator: 'USD/IDR',
      value:     formatIDR(usdIdr),
      verdict:   'CURRENCY_STRESS',
      reason:    `Rupiah di atas 17.000 — zona krisis nilai tukar`,
      color:     '#ef4444',
    });
  }

  // ── Inflation scoring ─────────────────────────────────────
  if (cpi <= THRESHOLDS.inflation.equilibriumMax) {
    scores.EQUILIBRIUM += 20;
    signals.push({
      indicator: 'Inflasi YoY',
      value:     formatPercent(cpi, 2),
      verdict:   'EQUILIBRIUM',
      reason:    `Inflasi ${formatNumber(cpi, 2)}% terkendali dalam target BI`,
      color:     '#10b981',
    });
  } else if (cpi <= THRESHOLDS.inflation.tighteningMax) {
    scores.TIGHTENING += 20;
    signals.push({
      indicator: 'Inflasi YoY',
      value:     formatPercent(cpi, 2),
      verdict:   'TIGHTENING',
      reason:    `Inflasi ${formatNumber(cpi, 2)}% di atas target BI 2,5% — pengetatan diperlukan`,
      color:     '#f59e0b',
    });
  } else {
    scores.CURRENCY_STRESS += 20;
    signals.push({
      indicator: 'Inflasi YoY',
      value:     formatPercent(cpi, 2),
      verdict:   'CURRENCY_STRESS',
      reason:    `Inflasi ${formatNumber(cpi, 2)}% sangat tinggi — ancaman spiral inflasi`,
      color:     '#ef4444',
    });
  }

  // ── DXY scoring ───────────────────────────────────────────
  if (dxy > 106) {
    scores.CURRENCY_STRESS += 15;
    signals.push({
      indicator: 'DXY Index',
      value:     `${formatPoints(dxy)} pts`,
      verdict:   'CURRENCY_STRESS',
      reason:    `DXY ${formatPoints(dxy)} sangat kuat — tekanan capital outflow EM maksimal`,
      color:     '#ef4444',
    });
  } else if (dxy > 104) {
    scores.TIGHTENING += 15;
    signals.push({
      indicator: 'DXY Index',
      value:     `${formatPoints(dxy)} pts`,
      verdict:   'TIGHTENING',
      reason:    `DXY ${formatPoints(dxy)} di atas netral — USD menguat, EM tertekan`,
      color:     '#f59e0b',
    });
  } else {
    scores.EQUILIBRIUM += 15;
    signals.push({
      indicator: 'DXY Index',
      value:     `${dxy} pts`,
      verdict:   'EQUILIBRIUM',
      reason:    `DXY ${dxy} normal — tidak ada tekanan USD berlebihan`,
      color:     '#10b981',
    });
  }

  // ── Find recommended scenario ─────────────────────────────
  const recommended = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0];

  const totalScore  = scores[recommended];
  const confidence  = Math.min(100, Math.round(totalScore));

  return {
    recommended,
    confidence,
    signals,
    scores,
  };
}

/**
 * getScenarioMismatch
 * Compares active scenario vs recommended scenario
 * Returns mismatch info for banner display
 */
export function getScenarioMismatch(activeScenario, macroData) {
  const detection = detectOptimalScenario(macroData);
  const { recommended, confidence, signals, scores } = detection;

  const isAligned  = activeScenario === recommended;
  const isClose    = (
    (activeScenario === 'TIGHTENING' && recommended === 'CURRENCY_STRESS') ||
    (activeScenario === 'CURRENCY_STRESS' && recommended === 'TIGHTENING')
  );

  return {
    isAligned,
    isClose,
    recommended,
    confidence,
    signals,
    scores,
    active: activeScenario,
  };
}
