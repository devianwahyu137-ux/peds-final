// src/lib/dataExporter.js
// Client-side data export — CSV and JSON
// Uses native browser Blob API — zero dependencies

import { formatNumber, formatIDR, formatPoints } from '@/utils/format';
import { APP_VERSION, useRootStore } from '@/stores/rootStore';

/**
 * Trigger a file download using a temporary anchor element.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a compact timestamp string for filenames.
 */
function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}` +
         `${String(now.getDate()).padStart(2, '0')}_` +
         `${String(now.getHours()).padStart(2, '0')}` +
         `${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * exportPortfolioCSV
 * Exports portfolio snapshot as a formatted CSV file.
 *
 * @param {{ scenarioId: string, weights: object, analytics: object, macroInputs: object }} params
 */
export function exportPortfolioCSV({ scenarioId, weights, analytics, macroInputs }) {
  const ts      = getTimestamp();
  const raw     = analytics?.portfolioStdDev ?? 0;
  const stdDev  = raw < 1 && raw > 0 ? raw * 100 : raw;
  const retRaw  = analytics?.portfolioReturn ?? 0;
  const portRet = retRaw < 1 && retRaw > 0 ? retRaw * 100 : retRaw;
  const rfRaw   = analytics?.riskFreeRate ?? 0;
  const rf      = rfRaw < 1 && rfRaw > 0 ? rfRaw * 100 : rfRaw;

  const rows = [
    ['MACROSCOPE PORTFOLIO EXPORT', '', ''],
    ['Generated', new Date().toLocaleString('id-ID'), ''],
    ['', '', ''],

    ['=== SKENARIO AKTIF ===', '', ''],
    ['Scenario ID', scenarioId, ''],
    ['', '', ''],

    ['=== ALOKASI ASET ===', '', ''],
    ['Aset', 'Alokasi (%)', 'Keterangan'],
    ['Equities (IDX)',         `${weights?.stocks ?? 0}%`, 'Saham IDX'],
    ['Fixed Income (SBN)',     `${weights?.bonds  ?? 0}%`, 'Obligasi Negara'],
    ['Precious Metals (Gold)', `${weights?.gold   ?? 0}%`, 'Emas Fisik'],
    ['Liquidity (Cash/USD)',   `${weights?.cash   ?? 0}%`, 'Kas & USD'],
    ['', '', ''],

    ['=== ANALISIS MPT ===', '', ''],
    ['Metrik', 'Nilai', 'Interpretasi'],
    ['Sharpe Ratio',    formatNumber(analytics?.sharpe ?? 0, 3),                                 'Efisiensi return per risiko'],
    ['Portfolio Beta',  formatNumber(analytics?.beta ?? 0, 3),                                   'Sensitivitas vs IHSG'],
    ['Max Drawdown',    `-${formatNumber(Math.abs(analytics?.estimatedMaxDrawdown ?? 0) * (analytics?.estimatedMaxDrawdown < 1 ? 100 : 1), 2)}%`, 'Penurunan maksimal estimasi'],
    ['Volatilitas',     `${formatNumber(stdDev, 2)}%`,                                           'Standar deviasi return'],
    ['Expected Return', `${formatNumber(portRet, 2)}%`,                                          'Estimasi return tahunan'],
    ['Risk-Free Rate',  `${formatNumber(rf, 2)}%`,                    'SBN acuan'],
    ['', '', ''],

    ['=== MAKROEKONOMI ===', '', ''],
    ['Indikator', 'Nilai', 'Sumber'],
    ['BI Rate',       `${formatNumber(macroInputs?.biRate ?? 5.50, 2)}%`,  'Estimasi (per Juni 2026)'],
    ['Inflasi YoY',   `${formatNumber(macroInputs?.inflation ?? 3.08, 2)}%`,  'Estimasi (per Juni 2026)'],
    ['USD/IDR',       `Rp ${formatIDR(macroInputs?.usdIdr ?? 17700)}`,  (useRootStore.getState().liveData?.usdIdr?.v != null) ? 'LIVE (delay ~5 mnt)' : 'Estimasi (per Juni 2026)'],
    ['SBN 10Y Yield', `${formatNumber(macroInputs?.sbn10y ?? 6.78, 2)}%`,                               'Estimasi (per Juni 2026)'],
    ['DXY Index',     `${formatPoints(macroInputs?.dxy ?? 104.50)}`,                              'Estimasi (per Juni 2026)'],
    ['', '', ''],

    ['=== DISCLAIMER ===', '', ''],
    ['Platform ini adalah simulasi edukasi berbasis MPT.', '', ''],
    ['Bukan rekomendasi investasi resmi.', '', ''],
    ['Konsultasikan dengan advisor keuangan terdaftar OJK.', '', ''],
  ];

  // BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const csv = bom + rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\r\n');

  downloadFile(csv, `Macroscope_Portfolio_${ts}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * exportPortfolioJSON
 * Exports complete portfolio state as structured JSON.
 *
 * @param {{ scenarioId: string, weights: object, analytics: object, macroInputs: object }} params
 */
export function exportPortfolioJSON({ scenarioId, weights, analytics, macroInputs }) {
  const ts  = getTimestamp();
  const raw = analytics?.portfolioStdDev ?? 0;
  const stdDev  = raw < 1 && raw > 0 ? raw * 100 : raw;
  const retRaw = analytics?.portfolioReturn ?? 0;
  const portRet = retRaw < 1 && retRaw > 0 ? retRaw * 100 : retRaw;
  const rfRaw   = analytics?.riskFreeRate ?? 0;
  const rf      = rfRaw < 1 && rfRaw > 0 ? rfRaw * 100 : rfRaw;
  const mdRaw   = analytics?.estimatedMaxDrawdown ?? 0;
  const md      = mdRaw < 1 && mdRaw > -1 ? mdRaw * 100 : mdRaw;

  const payload = {
    meta: {
      platform:   `Macroscope v${APP_VERSION}`,
      exportedAt: new Date().toISOString(),
      disclaimer: 'Educational simulation only. Not investment advice.',
    },
    scenario: {
      id:        scenarioId,
      biRate:    macroInputs?.biRate    ?? 5.50,
      inflation: macroInputs?.inflation ?? 3.08,
      usdIdr:    macroInputs?.usdIdr    ?? 17700,
    },
    allocation: {
      stocks: weights?.stocks ?? 0,
      bonds:  weights?.bonds  ?? 0,
      gold:   weights?.gold   ?? 0,
      cash:   weights?.cash   ?? 0,
    },
    analytics: {
      sharpeRatio:       Number((analytics?.sharpe ?? 0).toFixed(4)),
      portfolioBeta:     Number((analytics?.beta ?? 0).toFixed(4)),
      maxDrawdownPct:    Number(md.toFixed(2)),
      volatilitasPct:    Number(stdDev.toFixed(2)),
      expectedReturnPct: Number(portRet.toFixed(2)),
      riskFreeRatePct:   Number(rf.toFixed(2)),
    },
    macroContext: {
      biRate:  `${formatNumber(macroInputs?.biRate ?? 5.50, 2)}%`,
      usdIdr:  `Rp ${formatIDR(macroInputs?.usdIdr ?? 17700)}`,
      inflasi: `${formatNumber(macroInputs?.inflation ?? 3.08, 2)}% YoY`,
      sbn10y:  `${formatNumber(macroInputs?.sbn10y ?? 6.78, 2)}%`,
      dxy:     `${formatPoints(macroInputs?.dxy ?? 104.50)}`,
    },
  };

  downloadFile(
    JSON.stringify(payload, null, 2),
    `Macroscope_Portfolio_${ts}.json`,
    'application/json'
  );
}
