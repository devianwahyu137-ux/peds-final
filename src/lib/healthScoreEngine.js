// src/lib/healthScoreEngine.js
// Computes 0-100 Portfolio Health Score from analytics
// Pure function — no side effects, no store access

/**
 * The 5 scoring dimensions — each contributes 0-20 points.
 */
export const HEALTH_DIMENSIONS = [
  {
    id:          'efisiensi',
    label:       'Efisiensi',
    icon:        '⚡',
    description: 'Kualitas return per unit risiko (Sharpe)',
  },
  {
    id:          'stabilitas',
    label:       'Stabilitas',
    icon:        '〰️',
    description: 'Tingkat volatilitas portofolio',
  },
  {
    id:          'perlindungan',
    label:       'Perlindungan',
    icon:        '🛡️',
    description: 'Ketahanan terhadap penurunan maksimal',
  },
  {
    id:          'diversifikasi',
    label:       'Diversifikasi',
    icon:        '🧭',
    description: 'Kesesuaian beta dengan tujuan defensif',
  },
  {
    id:          'skenario',
    label:       'Kesesuaian Makro',
    icon:        '🎯',
    description: 'Kecocokan alokasi dengan kondisi makro aktual',
  },
];

/**
 * computeHealthScore
 * Computes composite health score (0-100) from 5 dimensions.
 *
 * @param {object} params
 * @param {object} params.analytics  — from rootStore (sharpe, beta, etc.)
 * @param {object} params.mismatch   — from scenarioDetector
 * @returns {{ scores: object, total: number, grade: { label: string, color: string } }}
 */
export function computeHealthScore({ analytics, mismatch }) {
  const sharpe = analytics?.sharpe ?? 0;
  const rawStd = analytics?.portfolioStdDev ?? 0;
  const stdDev = rawStd < 1 && rawStd > 0 ? rawStd * 100 : rawStd;
  const mdd    = Math.abs(analytics?.estimatedMaxDrawdown ?? 0);
  const beta   = analytics?.beta ?? 0;

  // DIM 1 — Efisiensi (Sharpe Ratio)
  const efisiensi = sharpe >= 1.0 ? 20
                  : sharpe >= 0.7 ? 16
                  : sharpe >= 0.5 ? 12
                  : sharpe >= 0.3 ? 8
                  : 4;

  // DIM 2 — Stabilitas (Volatilitas)
  const stabilitas = stdDev < 5  ? 20
                   : stdDev < 8  ? 16
                   : stdDev < 12 ? 12
                   : stdDev < 18 ? 8
                   : 4;

  // DIM 3 — Perlindungan (Max Drawdown)
  const perlindungan = mdd < 5  ? 20
                     : mdd < 10 ? 16
                     : mdd < 15 ? 12
                     : mdd < 25 ? 8
                     : 4;

  // DIM 4 — Diversifikasi (Beta range)
  const diversifikasi = (beta >= 0.2 && beta <= 0.5) ? 20
                      : (beta > 0.5  && beta <= 0.8) ? 16
                      : (beta >= 0.1 && beta < 0.2)  ? 12
                      : (beta > 0.8  && beta <= 1.2)  ? 8
                      : 4;

  // DIM 5 — Kesesuaian Skenario
  const skenario = mismatch?.isAligned ? 20
                 : mismatch?.isClose   ? 12
                 : 4;

  const scores = {
    efisiensi,
    stabilitas,
    perlindungan,
    diversifikasi,
    skenario,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const GRADES = [
    { label: 'KRITIS',      color: '#ef4444' }, // 0
    { label: 'WASPADA',     color: '#f97316' }, // 1
    { label: 'CUKUP',       color: '#f59e0b' }, // 2
    { label: 'BAIK',        color: '#10b981' }, // 3
    { label: 'SANGAT BAIK', color: '#10b981' }  // 4
  ];

  let baseGradeIndex = total >= 85 ? 4
                     : total >= 70 ? 3
                     : total >= 55 ? 2
                     : total >= 40 ? 1
                     : 0;

  const minScore = Math.min(efisiensi, stabilitas, perlindungan, diversifikasi, skenario);
  let capIndex = 4;
  if (minScore <= 4) {
    capIndex = 1;
  } else if (minScore <= 8) {
    capIndex = 2;
  } else if (minScore <= 12) {
    capIndex = 3;
  }

  const finalGradeIndex = Math.min(baseGradeIndex, capIndex);
  const grade = GRADES[finalGradeIndex];

  let cappedBy = null;
  if (finalGradeIndex < baseGradeIndex) {
    const weakestDimId = Object.keys(scores).find(key => scores[key] === minScore);
    const dimMeta = HEALTH_DIMENSIONS.find(d => d.id === weakestDimId);
    cappedBy = dimMeta ? dimMeta.label : weakestDimId;
  }

  return { scores, total, grade, cappedBy };
}
