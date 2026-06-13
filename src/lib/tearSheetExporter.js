// src/lib/tearSheetExporter.js
// Pure programmatic PDF generation using jsPDF drawing API
// Zero DOM capture — zero html2canvas — zero CSS dependency
// Output: clean A4 landscape institutional financial report (2 Pages)

import jsPDF from 'jspdf';
import { useRootStore, SCENARIOS, APP_VERSION } from '@/stores/rootStore';
import { formatNumber, formatIDR, formatPoints } from '@/utils/format';
import { HISTORICAL_CRISES } from '@/lib/backtestingData';
import {
  narrateSharpRatio,
  narrateBeta,
  narrateMaxDrawdown,
  narrateVolatility,
} from './portfolioNarrator';

// ── COLOR PALETTE ──────────────────────────────────────────────
const C = {
  black:       [0,   0,   0  ],
  darkGray:    [10,  10,  10 ],
  medGray:     [20,  20,  20 ],
  lightGray:   [38,  38,  38 ],
  textPrimary: [229, 229, 229],
  textSecond:  [163, 163, 163],
  textDim:     [82,  82,  82 ],
  emerald:     [16,  185, 129],
  amber:       [245, 158, 11 ],
  red:         [239, 68,  68 ],
  blue:        [59,  130, 246],
  violet:      [167, 139, 250],
  yellow:      [251, 191, 36 ],
  green:       [52,  211, 153],
};

// ── SCENARIO CONFIG ────────────────────────────────────────────
const SCENARIO_META = {
  EQUILIBRIUM: {
    label:     'Ekspansi Normal',
    riskLabel: 'RISIKO RENDAH',
    color:     C.emerald,
    badge:     'AMAN',
  },
  TIGHTENING: {
    label:     'Pengetatan Moneter',
    riskLabel: 'RISIKO SEDANG',
    color:     C.amber,
    badge:     'WASPADA',
  },
  CURRENCY_STRESS: {
    label:     'Tekanan Nilai Tukar',
    riskLabel: 'RISIKO TINGGI',
    color:     C.red,
    badge:     'KRISIS',
  },
  HIPERINFLASI: {
    label:     'Hiperinflasi',
    riskLabel: 'RISIKO EKSTREM',
    color:     C.red,
    badge:     'STRESS TEST',
  },
  RUPIAH_CRASH: {
    label:     'Rupiah Crash',
    riskLabel: 'RISIKO EKSTREM',
    color:     C.red,
    badge:     'STRESS TEST',
  },
};

const ASSET_COLORS = {
  stocks: C.blue,
  bonds:  C.violet,
  gold:   C.yellow,
  cash:   C.green,
};

const ASSET_LABELS = {
  stocks: 'Equities (IDX)',
  bonds:  'Fixed Income (SBN)',
  gold:   'Precious Metals (Gold)',
  cash:   'Liquidity (Cash / USD)',
};

const SCENARIO_STRATEGY = {
  EQUILIBRIUM: 'Maintain 40% allocation to top-tier IDX banking & consumer staples (BBCA, BMRI, ICBP) for growth. Hold 30% SBN FR series for baseline yield. 10% Physical Gold as portfolio insurance. 20% Liquidity buffer for opportunistic deployment.',
  TIGHTENING:  'Scale back equities to 15% — BI Rate 5.50% raises cost of capital. Rotate aggressively into SBN (ORI/SR/FR) to lock in risk-free yields. 15% Gold hedge against IDR pressure. 25% Cash for tactical redeployment when cycle turns.',
  CURRENCY_STRESS: 'WEALTH PRESERVATION MODE: 45% Physical Gold (XAU/IDR double-return: gold price + IDR depreciation). 35% USD/hard currency liquidity. Only 5% defensive commodity-exporter equities (ADRO, PTBA). 15% short-duration SBN (<1Y).',
  HIPERINFLASI: 'HIPERINFLASI STRESS TEST: Purchasing power collapsing. Shift 60% of liquid capital into Physical Gold immediately. Avoid holding IDR cash. Target high yield and safe-haven defensive assets.',
  RUPIAH_CRASH: 'CURRENCY COLLAPSE STRESS TEST: Convert all remaining Rupiah cash into USD/hard currency and Physical Gold to survive severe devaluation. Shift to international equities and USD assets.',
};

const SCENARIO_EXECUTIVE_SUMMARY = {
  EQUILIBRIUM: "Kondisi ekonomi makro domestik stabil dengan inflasi yang terkendali. Pertumbuhan PDB solid didukung suku bunga yang akomodatif. Portofolio berada pada alokasi optimal seimbang untuk menangkap peluang pertumbuhan tanpa menghadapi risiko volatilitas ekstrem.",
  TIGHTENING: "Bank Indonesia menaikkan suku bunga acuan untuk menjangkar ekspektasi inflasi. Likuiditas pasar cenderung mengetat, meningkatkan daya tarik instrumen pendapatan tetap dengan yield tinggi. Portofolio mengadopsi postur defensif dengan merotasi aset ke obligasi negara.",
  CURRENCY_STRESS: "Rupiah mengalami tekanan depresiasi signifikan terhadap USD akibat ketidakpastian eksternal. Risiko pelemahan nilai tukar mendominasi prospek pasar domestik. Strategi portofolio berfokus penuh pada perlindungan kekayaan melalui peningkatan alokasi emas fisik dan instrumen valuta asing.",
  HIPERINFLASI: "Skenario stress-test hiperinflasi ekstrem dengan lonjakan inflasi YoY mencapai 15.5% dan kenaikan suku bunga BI Rate drastis hingga 12.00%. Daya beli masyarakat tertekan hebat. Strategi defensif ekstrem memprioritaskan likuidasi rupiah dan beralih penuh ke safe-haven emas.",
  RUPIAH_CRASH: "Skenario stress-test krisis nilai tukar akut di mana USD/IDR menembus level psikologis 20.000 didorong penguatan indeks dolar DXY ke 110.00. Risiko sistemik pada ekuitas domestik sangat tinggi. Portofolio dialihkan penuh ke valas USD dan emas guna melindungi daya beli modal.",
};

const FALLBACK = {
  biRate:   5.50,
  cpi:      3.08,
  usdIdr:   17700,
  sbn10y:   6.78,
  gs10:     4.40,
  dxy:      104.50,
  gold:     2342,
  fedFunds: 3.75,
};

// ── STOCHASTIC CALCULATION HELPERS ─────────────────────────────
function stdNormalCDF(x) {
  const b1 =  0.319381530;
  const b2 = -0.356563782;
  const b3 =  1.781477937;
  const b4 = -1.821255978;
  const b5 =  1.330274429;
  const p  =  0.2316419;
  const c  =  0.39894228;
  
  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

function getHistoricalOutcome(crisis, scenarioId) {
  const targetScenario = ['HIPERINFLASI', 'RUPIAH_CRASH'].includes(scenarioId)
    ? 'CURRENCY_STRESS'
    : scenarioId;
  return crisis.portfolioOutcomes[targetScenario] ?? { returnPct: 0 };
}

// ── DRAW API HELPERS ───────────────────────────────────────────
function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function setTextColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function hRule(doc, y, x1, x2, rgb = C.lightGray, lw = 0.2) {
  setDraw(doc, rgb);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

function rRect(doc, x, y, w, h, r, fillRgb, strokeRgb = null) {
  setFill(doc, fillRgb);
  if (strokeRgb) {
    setDraw(doc, strokeRgb);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, r, r, strokeRgb ? 'FD' : 'F');
  } else {
    doc.roundedRect(x, y, w, h, r, r, 'F');
  }
}

function progressBar(doc, x, y, w, h, pct, barColor) {
  rRect(doc, x, y, w, h, 1, C.lightGray);
  const fillW = Math.max(2, (pct / 100) * w);
  rRect(doc, x, y, fillW, h, 1, barColor);
}

function wrapText(doc, text, maxWidth, fontSize) {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * exportTearSheetPDF
 * Programmatic PDF generation — Multi-page landscapes
 */
export async function exportTearSheetPDF({
  onStart      = () => {},
  onDone       = () => {},
  onError      = () => {},
} = {}) {
  onStart();

  try {
    // ── DATA EXTRACTION ────────────────────────────────────────
    const state = useRootStore.getState();
    const activeScenarioId = state.scenarioId || 'EQUILIBRIUM';
    const crisisMode = state.crisisMode;
    const weights = state.weights || { stocks: 40, bonds: 30, gold: 10, cash: 20 };
    const analytics = state.analytics || {};
    const macroInputs = state.macroInputs || {};
    const liveData = state.liveData || {};

    const effectiveScenarioId = crisisMode
      ? (crisisMode === 'HYPERINFLATION' ? 'HIPERINFLASI' : crisisMode)
      : activeScenarioId;

    const meta = SCENARIO_META[effectiveScenarioId] ?? SCENARIO_META.EQUILIBRIUM;
    const assets = ['stocks', 'bonds', 'gold', 'cash'];

    // Resolve macro indicators
    const biRateVal = macroInputs.biRate ?? FALLBACK.biRate;
    const cpiVal = macroInputs.inflation ?? FALLBACK.cpi;
    const usdIdrVal = macroInputs.usdIdr ?? FALLBACK.usdIdr;
    const sbnYield10YVal = macroInputs.sbn10y ?? FALLBACK.sbn10y;
    const gs10Val = macroInputs.us10y ?? macroInputs.gs10 ?? FALLBACK.gs10;
    const dxyVal = macroInputs.dxy ?? FALLBACK.dxy;
    const goldVal = state.macro.gold ?? liveData.xauUsd?.v ?? macroInputs.gold ?? FALLBACK.gold;
    const fedFundsVal = liveData.fedFunds?.v ?? FALLBACK.fedFunds;

    // Resolve MPT metrics
    const sharpe = analytics.sharpe ?? analytics.sharpeRatio ?? 0;
    const beta = analytics.beta ?? analytics.portfolioBeta ?? 0;
    const mdd = analytics.estimatedMaxDrawdown ?? analytics.maxDrawdown ?? 0;
    const stdDev = analytics.portfolioStdDev ?? analytics.portfolioVolatility ?? 0;
    const eReturn = analytics.portfolioReturn ?? 0;
    const rf = analytics.riskFreeRate ?? 0;

    // Normalize stdDev and return
    let stdDevPct = stdDev;
    if (stdDevPct > 0 && stdDevPct < 1) stdDevPct = stdDevPct * 100;
    const volFloor = {
      EQUILIBRIUM:     4.5,
      TIGHTENING:      3.8,
      CURRENCY_STRESS: 5.2,
      HIPERINFLASI:     6.5,
      RUPIAH_CRASH:     7.2,
    }[effectiveScenarioId] ?? 4.5;
    if (stdDevPct < 0.5) stdDevPct = volFloor;

    let eReturnPct = eReturn;
    if (eReturnPct > 0 && eReturnPct < 1) eReturnPct = eReturnPct * 100;
    const returnFloor = {
      EQUILIBRIUM:     8.5,
      TIGHTENING:      6.0,
      CURRENCY_STRESS: 4.5,
      HIPERINFLASI:     2.0,
      RUPIAH_CRASH:     1.5,
    }[effectiveScenarioId] ?? 6.0;
    if (eReturnPct < 0.5) eReturnPct = returnFloor;

    let rfPct = rf;
    if (rfPct > 0 && rfPct < 1) rfPct = rfPct * 100;
    if (rfPct === 0) rfPct = 5.50; // BI rate reference fallback

    // MPT Narrative interpretations
    const sharpeText = sharpe != null ? narrateSharpRatio(sharpe, effectiveScenarioId) : '';
    const betaText = beta != null ? narrateBeta(beta) : '';
    const mddText = mdd != null ? narrateMaxDrawdown(mdd * 100) : '';
    const volText = stdDevPct > 0 ? narrateVolatility(stdDevPct, effectiveScenarioId) : '';

    // Analytical Monte Carlo projections (Initial Capital 100 Juta)
    const mcCapital = 100_000_000;
    const mcMu = eReturnPct / 100;
    const mcSigma = stdDevPct / 100;

    const mcMult = {
      EQUILIBRIUM:     { mu: 1.0, sigma: 1.0 },
      TIGHTENING:      { mu: 0.8, sigma: 1.2 },
      CURRENCY_STRESS: { mu: 0.3, sigma: 2.5 },
      HIPERINFLASI:     { mu: 0.1, sigma: 3.0 },
      RUPIAH_CRASH:     { mu: 0.0, sigma: 3.5 },
    }[effectiveScenarioId] ?? { mu: 1.0, sigma: 1.0 };

    const finalMcMu = mcMu * mcMult.mu;
    const finalMcSigma = mcSigma * mcMult.sigma;

    const medianReturn = Math.exp(finalMcMu - 0.5 * finalMcSigma * finalMcSigma);
    const p5Return = Math.exp(finalMcMu - 0.5 * finalMcSigma * finalMcSigma - 1.645 * finalMcSigma);
    const p95Return = Math.exp(finalMcMu - 0.5 * finalMcSigma * finalMcSigma + 1.645 * finalMcSigma);

    const medianVal = mcCapital * medianReturn;
    const worstCaseVal = mcCapital * p5Return;
    const bestCaseVal = mcCapital * p95Return;

    const medianReturnPct = (medianReturn - 1) * 100;
    const worstReturnPct = (p5Return - 1) * 100;
    const bestReturnPct = (p95Return - 1) * 100;

    const z = -(finalMcMu - 0.5 * finalMcSigma * finalMcSigma) / finalMcSigma;
    const probOfLoss = stdNormalCDF(z) * 100;

    // ── PDF CANVAS SETUP ───────────────────────────────────────
    const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const PW   = 297; // page width
    const PH   = 210; // page height
    const ML   = 14;  // margin left
    const MR   = 14;  // margin right
    const CW   = PW - ML - MR; // content width

    const now  = new Date();
    const totalPages = 2;

    const drawHeader = (pageNum) => {
      setFill(doc, C.darkGray);
      doc.rect(0, 0, PW, 28, 'F');
      hRule(doc, 28, 0, PW, C.lightGray, 0.3);

      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textDim);
      doc.text('MACROSCOPE', ML, 8);

      doc.setFontSize(16);
      doc.setFont('courier', 'bold');
      setTextColor(doc, C.textPrimary);
      doc.text(pageNum === 1 ? 'PORTFOLIO TEAR SHEET (OVERVIEW)' : 'PORTFOLIO TEAR SHEET (STRESS & PROJECTIONS)', ML, 17);

      const dateStr = now.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textDim);
      doc.text(`Macro-Driven Asset Allocation Report  ·  ${dateStr}  ·  ${timeStr} WIB  ·  Page 0${pageNum}/0${totalPages}`, ML, 23.5);

      // Scenario Badge
      const badgeX = PW - MR - 48;
      rRect(doc, badgeX, 4, 48, 20, 2, C.darkGray, meta.color);
      doc.setFontSize(5.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textDim);
      doc.text('REZIM AKTIF', badgeX + 4, 9.5);
      doc.setFontSize(8.5);
      doc.setFont('courier', 'bold');
      setTextColor(doc, meta.color);
      doc.text(meta.badge, badgeX + 4, 15);
      doc.setFontSize(6.5);
      doc.setFont('courier', 'normal');
      doc.text(meta.riskLabel, badgeX + 4, 20.5);
    };

    const drawFooter = (pageNum) => {
      const footY = 196;
      hRule(doc, footY, ML, PW - MR, C.lightGray, 0.2);

      doc.setFontSize(5.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, [50, 50, 50]);
      const footerText =
        'EDUCATIONAL SIMULATION MODEL ONLY  ·  NOT INVESTMENT ADVICE  ·  ' +
        'INDEPENDENT EDUCATIONAL SIMULATION  ·  NOT AN OJK-REGISTERED OR OJK-SUPERVISED PRODUCT  ·  ' +
        `MACROSCOPE v${APP_VERSION}  ·  ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES  ·  ` +
        'DATA MAKRO ESTIMASI BERDASARKAN KONDISI PASAR JUNI 2026  ·  ' +
        'KONSULTASIKAN KEPUTUSAN INVESTASI DENGAN ADVISOR KEUANGAN TERDAFTAR OJK';
      const footLines = wrapText(doc, footerText, CW, 5.5);
      footLines.slice(0, 2).forEach((line, i) => {
        doc.text(line, ML, footY + 4 + i * 4, { align: 'left' });
      });

      doc.text(`0${pageNum} / 0${totalPages}`, PW - MR, footY + 6, { align: 'right' });
    };

    // ═══════════════════════════════════════════════════════════
    // ── PAGE 1: TELEMETRY & EFFICIENCY OVERVIEW ──
    // ═══════════════════════════════════════════════════════════
    setFill(doc, C.black);
    doc.rect(0, 0, PW, PH, 'F');
    drawHeader(1);

    // ── Executive Summary ──
    const execY = 32;
    rRect(doc, ML, execY, CW, 22, 2, C.darkGray, C.lightGray);
    doc.setFontSize(7);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('EXECUTIVE BRIEFING', ML + 4, execY + 5.5);

    const execSummaryText = SCENARIO_EXECUTIVE_SUMMARY[effectiveScenarioId] ?? SCENARIO_EXECUTIVE_SUMMARY.EQUILIBRIUM;
    const execLines = wrapText(doc, execSummaryText, CW - 10, 8);
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textSecond);
    let execLineY = execY + 11.5;
    execLines.slice(0, 2).forEach((line) => {
      doc.text(line, ML + 4, execLineY);
      execLineY += 5;
    });

    const colW = (CW - 10) / 2; // 129.5mm per column
    const col1X = ML;
    const col2X = ML + colW + 10;
    const contentY = 60;

    // ── COL 1 (LEFT): Macro Indicators ──
    let rowY = contentY;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('MACRO TELEMETRY INDICATORS', col1X, rowY);
    hRule(doc, rowY + 2.5, col1X, col1X + colW, C.lightGray);

    const macroData = [
      { label: 'BI Rate',         value: `${formatNumber(biRateVal, 2)}%` },
      { label: 'Inflasi',         value: `${formatNumber(cpiVal, 2)}%` },
      { label: 'USD/IDR',         value: `Rp ${formatIDR(usdIdrVal)}` },
      { label: 'SBN 10Y Yield',   value: `${formatNumber(sbnYield10YVal, 2)}%` },
      { label: 'US Treasury 10Y', value: `${formatNumber(gs10Val, 2)}%` },
      { label: 'DXY Index',       value: `${formatPoints(dxyVal)} pts` },
      { label: 'Gold Price',      value: `USD ${formatIDR(goldVal)}` },
      { label: 'Fed Funds Rate',  value: `${formatNumber(fedFundsVal, 2)}%` },
    ];

    rowY += 8;
    macroData.forEach(({ label, value }) => {
      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      doc.text(label, col1X, rowY);

      doc.setFont('courier', 'bold');
      setTextColor(doc, C.textPrimary);
      doc.text(value, col1X + colW, rowY, { align: 'right' });

      hRule(doc, rowY + 2, col1X, col1X + colW, [22, 22, 22]);
      rowY += 6.5;
    });

    // ── COL 1 (LEFT): Asset Allocation Matrix ──
    // Position dynamically under the macro indicators with a safe gap
    const allocY = rowY + 5.5;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('TARGET ASSET ALLOCATION MATRIX', col1X, allocY);
    hRule(doc, allocY + 2.5, col1X, col1X + colW, C.lightGray);

    let assetY = allocY + 8;
    assets.forEach((asset) => {
      const pct   = weights[asset] ?? 0;
      const color = ASSET_COLORS[asset];
      const label = ASSET_LABELS[asset];

      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, color);
      doc.text(label, col1X, assetY);

      doc.setFont('courier', 'bold');
      doc.text(`${pct}%`, col1X + colW, assetY, { align: 'right' });

      progressBar(doc, col1X, assetY + 2, colW, 2, pct, color);
      assetY += 9.5;
    });

    hRule(doc, assetY, col1X, col1X + colW, C.lightGray);
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textSecond);
    doc.text('TOTAL ALLOCATION', col1X, assetY + 4.5);
    setTextColor(doc, meta.color);
    doc.text('100%', col1X + colW, assetY + 4.5, { align: 'right' });

    // ── COL 2 (RIGHT): MPT Analytics ──
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('MPT PERFORMANCE & EFFICIENCY', col2X, contentY);
    hRule(doc, contentY + 2.5, col2X, col2X + colW, C.lightGray);

    const sharpeCardY = contentY + 5;
    rRect(doc, col2X, sharpeCardY, colW, 16, 2, C.darkGray, meta.color);
    doc.setFontSize(6.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('PORTFOLIO SHARPE RATIO (SHARPE)', col2X + 4, sharpeCardY + 5.5);
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    setTextColor(doc, meta.color);
    doc.text(`${formatNumber(sharpe, 2)}`, col2X + 4, sharpeCardY + 12);

    const mptItems = [
      { 
        label: 'PORTFOLIO VOLATILITY (VOL)', 
        value: `${formatNumber(stdDevPct, 1)}%`, 
        color: C.amber,
        text: volText 
      },
      { 
        label: 'MARKET SENSITIVITY (BETA)', 
        value: `${formatNumber(beta, 2)}`, 
        color: C.blue,
        text: betaText 
      },
      { 
        label: 'MAXIMUM DRAWDOWN (MDD)', 
        value: `-${formatNumber(Math.abs(mdd * 100), 1)}%`, 
        color: C.red,
        text: mddText 
      },
      { 
        label: 'EXPECTED PORTFOLIO RETURN', 
        value: `${formatNumber(eReturnPct, 1)}%`, 
        color: C.emerald,
        text: `Portofolio diproyeksikan menghasilkan imbal hasil tahunan sebesar ${formatNumber(eReturnPct, 1)}% berdasarkan pergerakan rata-rata aset.` 
      },
      { 
        label: 'RISK-FREE REFERENCE RATE', 
        value: `${formatNumber(rfPct, 2)}%`, 
        color: C.textSecond,
        text: `Tingkat bebas risiko disesuaikan dari yield SBN 10Y domestik setelah dikurangi 150bps (term premium) ke level ${formatNumber(rfPct, 2)}%.` 
      },
    ];

    let itemY = sharpeCardY + 20;
    mptItems.forEach(({ label, value, color, text }) => {
      doc.setFontSize(6.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textDim);
      doc.text(label, col2X, itemY);

      doc.setFontSize(8.5);
      doc.setFont('courier', 'bold');
      setTextColor(doc, color);
      doc.text(value, col2X + colW, itemY, { align: 'right' });

      const lines = wrapText(doc, text, colW, 6.5);
      doc.setFontSize(6.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      
      let lineY = itemY + 4;
      lines.slice(0, 2).forEach((line) => {
        doc.text(line, col2X, lineY);
        lineY += 3.5;
      });

      hRule(doc, lineY + 0.5, col2X, col2X + colW, [22, 22, 22]);
      itemY = lineY + 5.5;
    });

    drawFooter(1);

    // ═══════════════════════════════════════════════════════════
    // ── PAGE 2: STOCHASTIC PROJECTIONS & STRESS TESTS ──
    // ═══════════════════════════════════════════════════════════
    doc.addPage();
    setFill(doc, C.black);
    doc.rect(0, 0, PW, PH, 'F');
    drawHeader(2);

    // ── COL 1 (LEFT): Strategy & Monte Carlo ──
    const stratY = 32;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('REZIM STRATEGI & PANDUAN EKSEKUSI', col1X, stratY);
    hRule(doc, stratY + 2.5, col1X, col1X + colW, C.lightGray);

    const stratCardY = stratY + 5;
    rRect(doc, col1X, stratCardY, colW, 30, 2, C.darkGray, C.lightGray);
    doc.setFontSize(6.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('REKOMENDASI EKSEKUSI REBALANCING', col1X + 4, stratCardY + 5.5);

    const stratText = SCENARIO_STRATEGY[effectiveScenarioId] ?? SCENARIO_STRATEGY.CURRENCY_STRESS;
    const stratLines = wrapText(doc, stratText, colW - 8, 8);
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textSecond);
    let stratLineY = stratCardY + 11.5;
    stratLines.slice(0, 3).forEach((line) => {
      doc.text(line, col1X + 4, stratLineY);
      stratLineY += 5;
    });

    // Monte Carlo Projections
    const mcY = stratCardY + 36;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('PROYEKSI STOKASTIK MONTE CARLO (1 TAHUN)', col1X, mcY);
    hRule(doc, mcY + 2.5, col1X, col1X + colW, C.lightGray);

    doc.setFontSize(7.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textSecond);
    doc.text(`Investasi Awal: Rp 100.000.000  ·  Model GBM 252 Hari`, col1X, mcY + 7);

    const boxW = (colW - 4) / 2;
    const boxH = 16;
    const box1X = col1X;
    const box2X = col1X + boxW + 4;
    
    // MC Row 1
    const row1Y = mcY + 10;
    rRect(doc, box1X, row1Y, boxW, boxH, 2, C.darkGray);
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('PROYEKSI MEDIAN (P50)', box1X + 3, row1Y + 4.5);
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.emerald);
    doc.text(`Rp ${formatIDR(Math.round(medianVal))}`, box1X + 3, row1Y + 10);
    doc.setFontSize(6.5);
    doc.text(`${medianReturnPct > 0 ? '+' : ''}${formatNumber(medianReturnPct, 1)}%`, box1X + 3, row1Y + 13.5);

    rRect(doc, box2X, row1Y, boxW, boxH, 2, C.darkGray);
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('PROBABILITAS RUGI', box2X + 3, row1Y + 4.5);
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    const lossColor = probOfLoss > 30 ? C.red : probOfLoss > 15 ? C.amber : C.emerald;
    setTextColor(doc, lossColor);
    doc.text(`${formatNumber(probOfLoss, 1)}%`, box2X + 3, row1Y + 10);
    doc.setFontSize(6.5);
    doc.text('risiko modal negatif', box2X + 3, row1Y + 13.5);

    // MC Row 2
    const row2Y = row1Y + boxH + 4;
    rRect(doc, box1X, row2Y, boxW, boxH, 2, C.darkGray);
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('PROYEKSI BEST CASE (P95)', box1X + 3, row2Y + 4.5);
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.blue);
    doc.text(`Rp ${formatIDR(Math.round(bestCaseVal))}`, box1X + 3, row2Y + 10);
    doc.setFontSize(6.5);
    doc.text(`+${formatNumber(bestReturnPct, 1)}%`, box1X + 3, row2Y + 13.5);

    rRect(doc, box2X, row2Y, boxW, boxH, 2, C.darkGray);
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('PROYEKSI WORST CASE (P5)', box2X + 3, row2Y + 4.5);
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.red);
    doc.text(`Rp ${formatIDR(Math.round(worstCaseVal))}`, box2X + 3, row2Y + 10);
    doc.setFontSize(6.5);
    doc.text(`${worstReturnPct > 0 ? '+' : ''}${formatNumber(worstReturnPct, 1)}%`, box2X + 3, row2Y + 13.5);

    // Monte Carlo Explanation
    doc.setFontSize(6.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textSecond);
    const mcExplanation = `Berdasarkan parameter MPT untuk skenario ${meta.badge}, model mensimulasikan probabilitas loss sebesar ${formatNumber(probOfLoss, 1)}%. P95 mencerminkan hasil optimistik jika tren pasar mendukung, sementara P5 mencerminkan batas bawah toleransi risiko jika tekanan makro berlanjut.`;
    const mcExplLines = wrapText(doc, mcExplanation, colW, 6.5);
    let mcExplY = row2Y + boxH + 5;
    mcExplLines.slice(0, 3).forEach((line) => {
      doc.text(line, col1X, mcExplY);
      mcExplY += 3.5;
    });

    // ── COL 2 (RIGHT): Historical Stress & Glossary ──
    const histY = 32;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('ESTIMASI PERFORMA PADA KRISIS HISTORIS', col2X, histY);
    hRule(doc, histY + 2.5, col2X, col2X + colW, C.lightGray);

    const thY = histY + 6;
    doc.setFontSize(6.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('PERIODE / KRISIS', col2X, thY);
    doc.text('SEVERITY', col2X + 48, thY);
    doc.text('MARKET', col2X + 68, thY);
    doc.text('EST. RETURN', col2X + colW, thY, { align: 'right' });
    hRule(doc, thY + 2, col2X, col2X + colW, C.lightGray);

    let trY = thY + 6;
    HISTORICAL_CRISES.forEach((crisis) => {
      const outcome = getHistoricalOutcome(crisis, effectiveScenarioId);
      const isPositive = outcome.returnPct > 0;
      const perfColor = isPositive ? C.emerald : outcome.returnPct > -10 ? C.amber : C.red;

      // Wrap period/crisis name to prevent truncation
      doc.setFontSize(7);
      doc.setFont('courier', 'bold');
      setTextColor(doc, C.textPrimary);
      const nameLines = doc.splitTextToSize(crisis.name, 46);
      nameLines.forEach((line, index) => {
        doc.text(line, col2X, trY + index * 3.5);
      });
      
      // Draw period details below wrapped name lines
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      const periodY = trY + nameLines.length * 3.5;
      doc.text(crisis.period, col2X, periodY);

      // Severity Column (X = col2X + 48)
      setTextColor(doc, crisis.severityColor === '#ef4444' ? C.red : C.amber);
      doc.setFont('courier', 'bold');
      doc.text(crisis.severity, col2X + 48, trY);

      // Market Conditions Column (X = col2X + 68, Wrapped to 40mm)
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      const declVal = crisis.macroConditions['IHSG Decline'] ?? crisis.macroConditions['MTD Decline'] ?? crisis.macroConditions['IHSG MTD Mei'] ?? 'N/A';
      const marketLines = doc.splitTextToSize(declVal, 40);
      marketLines.forEach((line, index) => {
        doc.text(line, col2X + 68, trY + index * 3.5);
      });

      // Expected Return Column (X = col2X + colW, Right-aligned)
      doc.setFont('courier', 'bold');
      setTextColor(doc, perfColor);
      doc.text(`${isPositive ? '+' : ''}${outcome.returnPct}%`, col2X + colW, trY, { align: 'right' });

      // Dynamically calculate row height based on text wrapping lines
      const maxLines = Math.max(nameLines.length + 1, marketLines.length);
      const rowHeight = maxLines * 3.5 + 2.5;
      hRule(doc, trY + rowHeight - 2, col2X, col2X + colW, [22, 22, 22]);
      trY += rowHeight;
    });

    // Glossary
    const glossaryY = 117;
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('GLOSARIUM ISTILAH KUNCI', col2X, glossaryY);
    hRule(doc, glossaryY + 2.5, col2X, col2X + colW, C.lightGray);

    const glossaryItems = [
      { term: 'Sharpe Ratio', def: 'Efisiensi portofolio; semakin tinggi angka, semakin besar return per unit risiko.' },
      { term: 'Portfolio Beta', def: 'Sensitivitas portofolio terhadap IHSG. Beta < 1 artinya defensif dari pasar.' },
      { term: 'Max Drawdown', def: 'Estimasi penurunan nilai investasi terbesar dari puncak ke lembah dalam kondisi krisis.' },
      { term: 'Volatilitas', def: 'Tingkat fluktuasi harga portofolio. Mengukur fluktuasi atau ketidakpastian nilai.' },
      { term: 'Monte Carlo', def: 'Proyeksi probabilitas statistik akhir nilai investasi menggunakan model GBM acak.' },
    ];

    let glossY = glossaryY + 7;
    glossaryItems.forEach(({ term, def }) => {
      doc.setFontSize(6.5);
      doc.setFont('courier', 'bold');
      setTextColor(doc, C.textPrimary);
      doc.text(term, col2X, glossY);

      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      doc.text(`: ${def}`, col2X + 24, glossY);

      glossY += 4.5;
    });

    drawFooter(2);

    // ── SAVE ──────────────────────────────────────────────────
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    doc.save(`Macroscope_TearSheet_${stamp}.pdf`);

    onDone();
  } catch (err) {
    console.error('[TearSheet] PDF generation failed:', err);
    onError(err.message ?? 'Export gagal. Coba lagi.');
  }
}
