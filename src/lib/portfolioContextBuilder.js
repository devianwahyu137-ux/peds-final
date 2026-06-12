// src/lib/portfolioContextBuilder.js
// Builds a rich context string injected into every AI chat request
// Gives the AI model full awareness of current portfolio state
// Called before every API request — zero external dependencies

import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { formatNumber, formatIDR, formatPoints } from '@/utils/format';

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
  const sharpe = analytics?.sharpeRatio ?? analytics?.sharpe ?? 0;
  const beta = analytics?.portfolioBeta ?? analytics?.beta ?? 0;
  const mdd = analytics?.maxDrawdown ?? analytics?.estimatedMaxDrawdown ?? 0;
  const vol = analytics?.portfolioVolatility ?? analytics?.portfolioStdDev ?? 0;
  
  const mddPct = Math.abs(mdd) < 1 ? mdd * 100 : mdd;
  const volatilityPct = Math.abs(vol) < 1 ? vol * 100 : vol;
  const rawReturn = analytics?.portfolioReturn ?? 0;
  const portReturn = rawReturn < 1 && rawReturn > 0 ? rawReturn * 100 : rawReturn;

  // Build allocation string
  const allocationStr = Object.entries(weights ?? {})
    .map(([asset, pct]) => `${ASSET_LABELS[asset] ?? asset}: ${pct}%`)
    .join(', ');

  // Dynamic values with fallback to hardcoded actual macro values
  const actualBiRate = macroInputs?.biRate ?? 5.25;
  const actualUsdIdr = macroInputs?.usdIdr ?? 17700;
  const actualIhsg = macroInputs?.ihsg ?? 6170;
  const actualInflasi = macroInputs?.inflation ?? 3.48;
  const actualSbn10y = macroInputs?.sbn10y ?? 6.71;
  const actualDxy = macroInputs?.dxy ?? 104.50;

  return `
KONTEKS PORTOFOLIO ALPHASHIELD — DATA REAL-TIME
================================================

SKENARIO MAKRO AKTIF: ${scenarioId} (${config.label})
LEVEL RISIKO: ${config.riskLevel ?? 'SEDANG'}

ALOKASI PORTOFOLIO SAAT INI:
${allocationStr}

ANALISIS MPT ENGINE (DARI ANALYTICS STORE):
- Sharpe Ratio Terkini: ${formatNumber(sharpe, 2)}
- Portfolio Beta: ${formatNumber(beta, 2)}
- Max Drawdown: -${formatNumber(Math.abs(mddPct), 1)}%
- Volatilitas (Standard Deviation): ${formatNumber(volatilityPct, 2)}%
- Expected Return: ${formatNumber(portReturn, 2)}%

DATA MAKRO AKTUAL SAAT INI:
- BI Rate: ${formatNumber(actualBiRate, 2)}%
- USD/IDR: Rp ${formatIDR(actualUsdIdr)}
- IHSG: ${formatIDR(actualIhsg)}
- Inflasi: ${formatNumber(actualInflasi, 2)}%
- SBN 10Y: ${formatNumber(actualSbn10y, 2)}%
- DXY: ${formatPoints(actualDxy)}

INSTRUKSI UNTUK AI:
Anda adalah AlphaShield Quant Copilot — asisten analisis portofolio berbasis data makro Indonesia. Gunakan data di atas sebagai satu-satunya sumber kebenaran data portofolio.
Jika pengguna bertanya tentang "berapa Sharpe ratio portofoliomu?" atau metrik portofolio lainnya (Beta, Max Drawdown, Volatilitas, alokasi aset), Anda WAJIB menjawab dengan angka spesifik dari data di atas (misalnya, Sharpe Ratio: ${formatNumber(sharpe, 2)}). Jangan berikan jawaban generik.
Jawab dalam Bahasa Indonesia yang jelas, ringkas, dan professional. Selalu ingatkan bahwa ini adalah simulasi edukasi berbasis MPT, bukan rekomendasi investasi resmi.
`.trim();
}

/**
 * buildSuggestedQuestions
 * Returns contextually relevant suggested questions based on
 * current scenario and portfolio state.
 */
export function buildSuggestedQuestions(scenarioId, analytics) {
  const sharpe = analytics?.sharpeRatio ?? analytics?.sharpe ?? 0;

  const scenarioQuestions = {
    TIGHTENING: [
      "SBN tenor mana yang paling optimal sekarang?",
      "Bagaimana dampak BI Rate 5.25% ke portofolioku?",
      "Apakah BBCA masih layak di skenario ini?"
    ],
    CURRENCY_STRESS: [
      "Berapa persen emas yang ideal sekarang?",
      "Bagaimana cara konversi ke USD yang aman?"
    ],
    EQUILIBRIUM: [
      "Saham apa yang paling menarik di kondisi ekspansi?"
    ]
  };

  const effectiveScenario = (scenarioId === "HIPERINFLASI" || scenarioId === "RUPIAH_CRASH")
    ? "CURRENCY_STRESS"
    : scenarioId;

  const questions = [...(scenarioQuestions[effectiveScenario] ?? [])];

  // If Sharpe Ratio is low (typically < 1.0), add the question
  if (sharpe < 1.0) {
    questions.push("Bagaimana meningkatkan Sharpe Ratio portofoliomu?");
  }

  return questions;
}
