// src/lib/portfolioContextBuilder.js
// Builds a rich context string injected into every AI chat request
// Gives the AI model full awareness of current portfolio state
// Called before every API request — zero external dependencies

import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';

const ASSET_LABELS = {
  stocks: 'Ekuitas/Saham IDX',
  bonds:  'Obligasi Negara (SBN)',
  gold:   'Emas Fisik',
  cash:   'Kas / USD',
};

/**
 * buildPortfolioContext
 * Creates a comprehensive context string for the AI system prompt.
 * This is injected before every user message.
 *
 * @param {object} params
 * @returns {string} - formatted context for AI system prompt
 */
export function buildPortfolioContext({
  scenarioId,
  weights,
  analytics,
  macroInputs,
  liveData,
}) {
  const config = SCENARIO_CONFIG[scenarioId] ?? SCENARIO_CONFIG.TIGHTENING;

  // Normalize analytics values
  const sharpe    = analytics?.sharpe ?? 0;
  const beta      = analytics?.beta   ?? 0;
  const mdd       = analytics?.estimatedMaxDrawdown ?? 0;
  const rawStdDev = analytics?.portfolioStdDev ?? 0;
  const stdDev    = rawStdDev < 1 && rawStdDev > 0 ? rawStdDev * 100 : rawStdDev;
  const rawReturn = analytics?.portfolioReturn ?? 0;
  const portReturn = rawReturn < 1 && rawReturn > 0 ? rawReturn * 100 : rawReturn;

  // Build allocation string
  const allocationStr = Object.entries(weights ?? {})
    .map(([asset, pct]) => `${ASSET_LABELS[asset] ?? asset}: ${pct}%`)
    .join(', ');

  // Live macro data
  const biRate   = liveData?.bi_macro?.biRate   ?? macroInputs?.biRate    ?? 5.25;
  const inflasi  = liveData?.bi_macro?.cpi      ?? macroInputs?.inflation ?? 3.48;
  const usdIdr   = liveData?.usdIdr?.v          ?? macroInputs?.usdIdr    ?? 17700;
  const ihsg     = liveData?.ihsg?.v             ?? 6170;
  const sbn10y   = liveData?.sbn_yields?.y10     ?? 6.71;
  const dxy      = liveData?.dxy?.v              ?? 104.5;

  return `
KONTEKS PORTOFOLIO ALPHASHIELD — DATA REAL-TIME
================================================

SKENARIO MAKRO AKTIF: ${scenarioId} (${config.label})
LEVEL RISIKO: ${config.riskLevel ?? 'SEDANG'}

ALOKASI PORTOFOLIO SAAT INI:
${allocationStr}

ANALISIS MPT ENGINE:
- Sharpe Ratio: ${sharpe.toFixed(2)} σ
- Portfolio Beta: ${beta.toFixed(2)} β  
- Estimasi Max Drawdown: -${Math.abs(mdd).toFixed(1)}%
- Volatilitas Portofolio: ${stdDev > 0 ? stdDev.toFixed(1) : 'N/A'}%
- Expected Return: ${portReturn > 0 ? portReturn.toFixed(1) : 'N/A'}%

INDIKATOR MAKROEKONOMI INDONESIA (MEI 2026):
- BI Rate: ${biRate}% (NAIK 50bps dari 4.75% — RDG 19-20 Mei 2026)
- Inflasi YoY: ${inflasi}% (di atas target BI 2.5±1%)
- USD/IDR: ${usdIdr.toLocaleString('id-ID')} (mendekati rekor terlemah)
- IHSG: ${ihsg.toLocaleString('id-ID')} (turun 11.8% di Mei 2026)
- SBN 10Y Yield: ${sbn10y}% (sideways range 6.547-6.957%)
- DXY Index: ${dxy} pts

KONTEKS GEOPOLITIK:
- Konflik Timur Tengah → lonjakan harga minyak → inflasi impor
- Capital outflow dari Emerging Markets termasuk Indonesia
- Fed Funds Rate 3.75% — The Fed masih hati-hati

INSTRUKSI UNTUK AI:
Kamu adalah asisten analisis portofolio AlphaShield yang sangat
ahli. Gunakan data di atas sebagai konteks utama untuk setiap
jawaban. Jawab dalam Bahasa Indonesia yang jelas dan mudah
dipahami oleh investor ritel, tapi sertakan terminologi teknis
yang relevan. Jika user bertanya tentang portofolio mereka,
selalu referensikan angka spesifik di atas (Sharpe, alokasi, dll).
Selalu ingatkan bahwa ini adalah simulasi edukasi berbasis MPT,
bukan rekomendasi investasi resmi.
`.trim();
}

/**
 * buildSuggestedQuestions
 * Returns contextually relevant suggested questions based on
 * current scenario and portfolio state.
 */
export function buildSuggestedQuestions(scenarioId, analytics) {
  const sharpe = analytics?.sharpe ?? 0;

  const baseQuestions = [
    'Evaluasi efisiensi portofolio saya sekarang',
    'Apa dampak BI Rate 5.25% terhadap alokasi ini?',
  ];

  const scenarioQuestions = {
    EQUILIBRIUM: [
      'Saham apa yang paling menarik di kondisi ekspansi?',
      'Apakah saya perlu menambah alokasi obligasi?',
    ],
    TIGHTENING: [
      'SBN tenor berapa yang paling optimal saat ini?',
      'Apakah BBCA masih layak hold di kondisi pengetatan?',
      'Bagaimana dampak kenaikan BI Rate ke Sharpe Ratio saya?',
    ],
    CURRENCY_STRESS: [
      'Berapa persen emas fisik yang ideal untuk hedging Rupiah?',
      'Apakah USD deposito lebih baik dari reksa dana pasar uang?',
      'Strategi exit dari saham domestik yang paling aman?',
    ],
  };

  const sharpQuestions = sharpe < 0.5
    ? ['Bagaimana cara meningkatkan Sharpe Ratio portofolio ini?']
    : [];

  return [
    ...baseQuestions,
    ...(scenarioQuestions[scenarioId] ?? []),
    ...sharpQuestions,
  ].slice(0, 4); // max 4 suggestions
}
