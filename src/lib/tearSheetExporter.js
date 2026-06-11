// src/lib/tearSheetExporter.js
// Pure programmatic PDF generation using jsPDF drawing API
// Zero DOM capture — zero html2canvas — zero CSS dependency
// Output: clean A4 landscape institutional financial report

import jsPDF from 'jspdf';
import { useRootStore, SCENARIOS } from '@/stores/rootStore';

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
    riskLabel: 'RISIKO TINGGI',
    color:     C.red,
    badge:     'STRESS TEST',
  },
  RUPIAH_CRASH: {
    label:     'Rupiah Crash',
    riskLabel: 'RISIKO TINGGI',
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
  TIGHTENING:  'Scale back equities to 15% — BI Rate 5.25% raises cost of capital. Rotate aggressively into SBN (ORI/SR/FR) to lock in risk-free yields. 15% Gold hedge against IDR pressure. 25% Cash for tactical redeployment when cycle turns.',
  CURRENCY_STRESS: 'WEALTH PRESERVATION MODE: 45% Physical Gold (XAU/IDR double-return: gold price + IDR depreciation). 35% USD/hard currency liquidity. Only 5% defensive commodity-exporter equities (ADRO, PTBA). 15% short-duration SBN (<1Y).',
  HIPERINFLASI: 'HIPERINFLASI STRESS TEST: Purchasing power collapsing. Shift 60% of liquid capital into Physical Gold immediately. Avoid holding IDR cash. Target high yield and safe-haven defensive assets.',
  RUPIAH_CRASH: 'CURRENCY COLLAPSE STRESS TEST: Convert all remaining Rupiah cash into USD/hard currency and Physical Gold to survive severe devaluation. Shift to international equities and USD assets.',
};

const FALLBACK = {
  biRate:   5.25,
  cpi:      3.48,
  usdIdr:   17700,
  sbn10y:   6.71,
  gs10:     4.40,
  dxy:      104.50,
  gold:     2342,
  fedFunds: 3.75,
};

// ── HELPER: set fill color ─────────────────────────────────────
function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

// ── HELPER: set draw color ─────────────────────────────────────
function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

// ── HELPER: set text color ─────────────────────────────────────
function setTextColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

// ── HELPER: draw horizontal rule ──────────────────────────────
function hRule(doc, y, x1, x2, rgb = C.lightGray, lw = 0.2) {
  setDraw(doc, rgb);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

// ── HELPER: rounded rect ──────────────────────────────────────
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

// ── HELPER: progress bar ──────────────────────────────────────
function progressBar(doc, x, y, w, h, pct, barColor) {
  // Track
  rRect(doc, x, y, w, h, 1, C.lightGray);
  // Fill
  const fillW = Math.max(2, (pct / 100) * w);
  rRect(doc, x, y, fillW, h, 1, barColor);
}

// ── HELPER: wrap text to max width ────────────────────────────
function wrapText(doc, text, maxWidth, fontSize) {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

/**
 * exportTearSheetPDF
 * Main export function — pure programmatic PDF generation
 * Reads directly from Zustand store state on execution
 */
export async function exportTearSheetPDF({
  onStart      = () => {},
  onDone       = () => {},
  onError      = () => {},
} = {}) {
  onStart();

  try {
    // ── ZUSTAND STATE EXTRACTION ──────────────────────────────
    const state = useRootStore.getState();
    const activeScenarioId = state.scenarioId || 'TIGHTENING';
    const crisisMode = state.crisisMode;
    const weights = state.weights || { stocks: 15, bonds: 45, gold: 15, cash: 25 };
    const analytics = state.analytics || {};
    const macroInputs = state.macroInputs || {};
    const liveData = state.liveData || {};

    const effectiveScenarioId = crisisMode ? 'CURRENCY_STRESS' : activeScenarioId;
    const meta = SCENARIO_META[effectiveScenarioId] ?? SCENARIO_META.TIGHTENING;
    const assets = ['stocks', 'bonds', 'gold', 'cash'];

    // Resolve macro indicators
    const biRateVal = liveData.biRate?.v ?? macroInputs.biRate ?? FALLBACK.biRate;
    const inflationVal = liveData.cpi?.v ?? macroInputs.inflation ?? FALLBACK.cpi;
    const usdIdrVal = liveData.usdIdr?.v ?? macroInputs.usdIdr ?? FALLBACK.usdIdr;
    const sbnYield10YVal = liveData.sbnYield10Y?.v ?? liveData.sbn_yields?.y10 ?? macroInputs.sbn10y ?? FALLBACK.sbn10y;
    const gs10Val = liveData.gs10?.v ?? macroInputs.gs10 ?? FALLBACK.gs10;
    const dxyVal = liveData.dxy?.v ?? macroInputs.dxy ?? FALLBACK.dxy;
    const goldVal = liveData.xauUsd?.v ?? FALLBACK.gold;
    const fedFundsVal = liveData.fedFunds?.v ?? FALLBACK.fedFunds;

    // Resolve MPT metrics
    const sharpe = analytics.sharpe ?? analytics.sharpeRatio ?? 0;
    const beta = analytics.beta ?? analytics.portfolioBeta ?? 0;
    const mdd = analytics.estimatedMaxDrawdown ?? analytics.maxDrawdown ?? 0;
    const stdDev = analytics.portfolioStdDev ?? analytics.portfolioVolatility ?? 0;
    const eReturn = analytics.portfolioReturn ?? 0;
    const rf = analytics.riskFreeRate ?? 0;

    // A4 Landscape: 297mm × 210mm
    const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const PW   = 297; // page width
    const PH   = 210; // page height
    const ML   = 14;  // margin left
    const MR   = 14;  // margin right
    const CW   = PW - ML - MR; // content width

    // ── BACKGROUND ────────────────────────────────────────────
    setFill(doc, C.black);
    doc.rect(0, 0, PW, PH, 'F');

    // ── HEADER BAND ───────────────────────────────────────────
    setFill(doc, C.darkGray);
    doc.rect(0, 0, PW, 28, 'F');
    hRule(doc, 28, 0, PW, C.lightGray, 0.3);

    // Logo / System name
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('ALPHASHIELD · PEDS CORE SYSTEM', ML, 8);

    // Report title
    doc.setFontSize(18);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textPrimary);
    doc.text('PORTFOLIO TEAR SHEET', ML, 18);

    // Date subtitle
    const now     = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(7.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text(`Macro-Driven Asset Allocation Report  ·  ${dateStr}  ·  ${timeStr} WIB`, ML, 24.5);

    // Scenario badge (top right)
    const badgeX = PW - MR - 44;
    rRect(doc, badgeX, 5, 44, 20, 2, C.darkGray, meta.color);
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('SKENARIO AKTIF', badgeX + 4, 11);
    doc.setFontSize(9);
    doc.setFont('courier', 'bold');
    setTextColor(doc, meta.color);
    doc.text(meta.badge, badgeX + 4, 17);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(meta.riskLabel, badgeX + 4, 23);

    // ── MAIN CONTENT AREA: 3 columns ─────────────────────────
    const colW    = (CW - 10) / 3;  // width per column
    const col1X   = ML;
    const col2X   = ML + colW + 5;
    const col3X   = ML + (colW + 5) * 2;
    const contentY = 33;

    // ── COLUMN 1: MACRO INDICATORS ────────────────────────────
    doc.setFontSize(7);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('MACRO INDICATORS', col1X, contentY);

    hRule(doc, contentY + 2, col1X, col1X + colW, C.lightGray);

    const macroData = [
      { label: 'BI Rate',         value: `${biRateVal.toFixed(2)}%` },
      { label: 'Inflasi',         value: `${inflationVal.toFixed(2)}%` },
      { label: 'USD/IDR',         value: `Rp ${Math.round(usdIdrVal).toLocaleString('id-ID')}` },
      { label: 'SBN 10Y',         value: `${sbnYield10YVal.toFixed(2)}%` },
      { label: 'US Treasury',     value: `${gs10Val.toFixed(2)}%` },
      { label: 'DXY',             value: `${dxyVal.toFixed(2)} pts` },
      { label: 'Gold',            value: `USD ${Math.round(goldVal).toLocaleString('id-ID')}` },
      { label: 'Fed Rate',        value: `${fedFundsVal.toFixed(2)}%` },
    ];

    let rowY = contentY + 8;
    macroData.forEach(({ label, value }) => {
      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textSecond);
      doc.text(label, col1X, rowY);

      doc.setFont('courier', 'bold');
      setTextColor(doc, C.textPrimary);
      doc.text(value, col1X + colW, rowY, { align: 'right' });

      hRule(doc, rowY + 2, col1X, col1X + colW, [28, 28, 28]);
      rowY += 8;
    });

    // ── COLUMN 2: ASSET ALLOCATION ────────────────────────────
    doc.setFontSize(7);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('ASSET ALLOCATION MATRIX', col2X, contentY);
    hRule(doc, contentY + 2, col2X, col2X + colW, C.lightGray);

    let assetY = contentY + 8;
    assets.forEach((asset) => {
      const pct   = weights[asset] ?? 0;
      const color = ASSET_COLORS[asset];
      const label = ASSET_LABELS[asset];

      // Asset label
      doc.setFontSize(7.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, color);
      doc.text(label, col2X, assetY);

      // Percentage
      doc.setFont('courier', 'bold');
      doc.text(`${pct}%`, col2X + colW, assetY, { align: 'right' });

      // Progress bar
      progressBar(doc, col2X, assetY + 1.5, colW, 3, pct, color);

      assetY += 11;
    });

    // Total line
    hRule(doc, assetY, col2X, col2X + colW, C.lightGray);
    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textSecond);
    doc.text('TOTAL ALOKASI', col2X, assetY + 5);
    setTextColor(doc, meta.color);
    doc.text('100%', col2X + colW, assetY + 5, { align: 'right' });

    // ── COLUMN 3: MPT ANALYTICS ───────────────────────────────
    doc.setFontSize(7);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text('MPT ANALYTICS ENGINE', col3X, contentY);
    hRule(doc, contentY + 2, col3X, col3X + colW, C.lightGray);

    // Sharpe — large featured metric
    let mptY = contentY + 10;
    doc.setFontSize(6.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('SHARPE RATIO', col3X, mptY);
    mptY += 5;
    doc.setFontSize(22);
    doc.setFont('courier', 'bold');
    setTextColor(doc, meta.color);
    doc.text(`${sharpe.toFixed(2)} σ`, col3X, mptY);
    mptY += 3;
    hRule(doc, mptY, col3X, col3X + colW, C.lightGray);
    mptY += 6;

    // Other metrics in 2-column grid
    const mptMetrics = [
      { label: 'Portfolio Beta',  value: `${beta.toFixed(2)} β`,    color: C.blue    },
      { label: 'Max Drawdown',    value: `-${Math.abs(mdd).toFixed(1)}%`, color: C.red     },
      { label: 'Volatilitas',     value: `${(stdDev < 1 ? stdDev * 100 : stdDev).toFixed(1)}%`, color: C.amber   },
      { label: 'Expected Return', value: `${(eReturn < 1 ? eReturn * 100 : eReturn).toFixed(1)}%`, color: C.emerald },
      { label: 'Risk-Free Rate',  value: `${(rf < 1 ? rf * 100 : rf).toFixed(2)}%`,  color: C.textDim  },
    ];

    mptMetrics.forEach(({ label, value, color }) => {
      doc.setFontSize(6.5);
      doc.setFont('courier', 'normal');
      setTextColor(doc, C.textDim);
      doc.text(label, col3X, mptY);

      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      setTextColor(doc, color);
      doc.text(value, col3X + colW, mptY, { align: 'right' });

      hRule(doc, mptY + 2, col3X, col3X + colW, [28, 28, 28]);
      mptY += 8;
    });

    // ── EXECUTION STRATEGY BAND ───────────────────────────────
    const stratY = 148;
    rRect(doc, ML, stratY, CW, 28, 2, C.darkGray, C.lightGray);

    doc.setFontSize(6.5);
    doc.setFont('courier', 'bold');
    setTextColor(doc, C.textDim);
    doc.text(`EXECUTION STRATEGY  ·  SCENARIO: ${effectiveScenarioId}`, ML + 4, stratY + 6);

    const stratText = SCENARIO_STRATEGY[effectiveScenarioId] ?? SCENARIO_STRATEGY.CURRENCY_STRESS;
    const stratLines = wrapText(doc, stratText, CW - 10, 8);
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textSecond);
    let stratLineY = stratY + 12;
    stratLines.slice(0, 2).forEach((line) => {
      doc.text(line, ML + 4, stratLineY);
      stratLineY += 6;
    });

    // ── RISK INDICATOR BAR ────────────────────────────────────
    const riskY = 182;
    hRule(doc, riskY, ML, PW - MR, C.lightGray, 0.3);

    const riskLevels = [
      { label: 'RENDAH',  pct: 33,  color: C.emerald,
        active: effectiveScenarioId === 'EQUILIBRIUM' },
      { label: 'SEDANG',  pct: 33,  color: C.amber,
        active: effectiveScenarioId === 'TIGHTENING' },
      { label: 'TINGGI',  pct: 34,  color: C.red,
        active: ['CURRENCY_STRESS', 'HIPERINFLASI', 'RUPIAH_CRASH'].includes(effectiveScenarioId) },
    ];

    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    setTextColor(doc, C.textDim);
    doc.text('LEVEL RISIKO MAKRO:', ML, riskY + 6);

    let riskBarX = ML + 42;
    const riskBarW = CW - 44;
    riskLevels.forEach(({ label, pct, color, active }) => {
      const segW = (pct / 100) * riskBarW;
      rRect(doc, riskBarX, riskY + 2, segW - 0.5, 5, 0,
        active ? color : [30, 30, 30]);

      doc.setFontSize(5.5);
      doc.setFont('courier', active ? 'bold' : 'normal');
      setTextColor(doc, active ? color : C.textDim);
      doc.text(label, riskBarX + segW / 2, riskY + 10.5, { align: 'center' });
      riskBarX += segW;
    });

    // ── FOOTER ────────────────────────────────────────────────
    const footY = 196;
    hRule(doc, footY, ML, PW - MR, C.lightGray, 0.2);

    doc.setFontSize(5.5);
    doc.setFont('courier', 'normal');
    setTextColor(doc, [50, 50, 50]);
    const footerText =
      'EDUCATIONAL SIMULATION MODEL ONLY  ·  NOT INVESTMENT ADVICE  ·  ' +
      'COMPLIANT WITH OJK SIMULATION FRAMEWORK STANDARDS  ·  ' +
      'PEDS ALPHASHIELD ENGINE V3.0  ·  ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES  ·  ' +
      'DATA MAKRO ESTIMASI BERDASARKAN KONDISI PASAR MEI 2026  ·  ' +
      'KONSULTASIKAN KEPUTUSAN INVESTASI DENGAN ADVISOR KEUANGAN TERDAFTAR OJK';
    const footLines = wrapText(doc, footerText, CW, 5.5);
    footLines.slice(0, 2).forEach((line, i) => {
      doc.text(line, ML, footY + 4 + i * 4, { align: 'left' });
    });

    // Page number
    setTextColor(doc, [50, 50, 50]);
    doc.setFontSize(6);
    doc.text('01 / 01', PW - MR, footY + 6, { align: 'right' });

    // ── SAVE ──────────────────────────────────────────────────
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    doc.save(`AlphaShield_TearSheet_${stamp}.pdf`);

    onDone();
  } catch (err) {
    console.error('[TearSheet] PDF generation failed:', err);
    onError(err.message ?? 'Export gagal. Coba lagi.');
  }
}
