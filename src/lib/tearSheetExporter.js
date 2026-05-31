// src/lib/tearSheetExporter.js
// Pure programmatic PDF generation using jsPDF drawing API
// Zero DOM capture — zero html2canvas — zero CSS dependency
// Output: clean A4 landscape institutional financial report

import jsPDF from 'jspdf';

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

// ── HELPER: label + value pair in a row ───────────────────────
function labelValue(doc, x, y, label, value, labelColor, valueColor, labelSize = 7, valueSize = 9) {
  doc.setFontSize(labelSize);
  doc.setFont('courier', 'normal');
  setTextColor(doc, labelColor);
  doc.text(label, x, y);

  doc.setFontSize(valueSize);
  doc.setFont('courier', 'bold');
  setTextColor(doc, valueColor);
  doc.text(value, x + 38, y);
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
 *
 * @param {object} params
 *   scenarioId   - 'EQUILIBRIUM' | 'TIGHTENING' | 'CURRENCY_STRESS'
 *   weights      - { stocks, bonds, gold, cash } in %
 *   analytics    - { sharpe, beta, estimatedMaxDrawdown, portfolioStdDev, portfolioReturn, riskFreeRate }
 *   macroInputs  - { biRate, inflation, usdIdr }
 *   onStart      - callback when export begins
 *   onDone       - callback when PDF saved
 *   onError      - callback on error with message string
 */
export async function exportTearSheetPDF({
  scenarioId   = 'TIGHTENING',
  weights      = { stocks: 15, bonds: 45, gold: 15, cash: 25 },
  analytics    = {},
  macroInputs  = {},
  onStart      = () => {},
  onDone       = () => {},
  onError      = () => {},
}) {
  onStart();

  try {
    const meta   = SCENARIO_META[scenarioId] ?? SCENARIO_META.TIGHTENING;
    const assets = ['stocks', 'bonds', 'gold', 'cash'];

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
    doc.text('ALPHASHIELD · PEDS CORE SYSTEM V3.7', ML, 8);

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
      { label: 'BI Rate (Mei 2026)',  value: `${macroInputs.biRate ?? 5.25}%` },
      { label: 'Inflasi YoY',         value: `${macroInputs.inflation ?? 3.48}%` },
      { label: 'USD/IDR Spot',        value: `Rp ${(macroInputs.usdIdr ?? 17700).toLocaleString('id-ID')}` },
      { label: 'SBN 10Y Yield',       value: '6.71%' },
      { label: 'US 10Y Treasury',     value: '4.40%' },
      { label: 'DXY Index',           value: '104.50 pts' },
      { label: 'Gold (XAU/USD)',      value: 'USD 2.342' },
      { label: 'Fed Funds Rate',      value: '3.75%' },
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

    const sharpe  = analytics.sharpe        ?? 0;
    const beta    = analytics.beta          ?? 0;
    const mdd     = analytics.estimatedMaxDrawdown ?? 0;
    const stdDev  = analytics.portfolioStdDev ?? 0;
    const eReturn = analytics.portfolioReturn ?? 0;
    const rf      = analytics.riskFreeRate  ?? 0;

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
      { label: 'Portfolio Beta',  value: `${beta.toFixed(2)} β`,    color: C.violet  },
      { label: 'Max Drawdown',    value: `-${Math.abs(mdd).toFixed(1)}%`, color: C.red     },
      { label: 'Volatilitas σ',   value: `${(stdDev < 1 ? stdDev * 100 : stdDev).toFixed(1)}%`, color: C.amber   },
      { label: 'E(Return)',       value: `${(eReturn < 1 ? eReturn * 100 : eReturn).toFixed(1)}%`, color: C.emerald },
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
    doc.text(`EXECUTION STRATEGY  ·  SCENARIO: ${scenarioId}`, ML + 4, stratY + 6);

    const stratText = SCENARIO_STRATEGY[scenarioId] ?? '';
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
        active: scenarioId === 'EQUILIBRIUM' },
      { label: 'SEDANG',  pct: 33,  color: C.amber,
        active: scenarioId === 'TIGHTENING' },
      { label: 'TINGGI',  pct: 34,  color: C.red,
        active: scenarioId === 'CURRENCY_STRESS' },
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
      'PEDS ALPHASHIELD ENGINE V3.7  ·  ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES  ·  ' +
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
