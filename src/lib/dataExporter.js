// src/lib/dataExporter.js
// Client-side data export — CSV and JSON
// Uses native browser Blob API — zero dependencies

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

  const rows = [
    ['ALPHASHIELD PORTFOLIO EXPORT', '', ''],
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
    ['Sharpe Ratio',    (analytics?.sharpe ?? 0).toFixed(3),                                     'Efisiensi return per risiko'],
    ['Portfolio Beta',  (analytics?.beta ?? 0).toFixed(3),                                       'Sensitivitas vs IHSG'],
    ['Max Drawdown',    `-${Math.abs(analytics?.estimatedMaxDrawdown ?? 0).toFixed(2)}%`,         'Penurunan maksimal estimasi'],
    ['Volatilitas',     `${stdDev.toFixed(2)}%`,                                                 'Standar deviasi return'],
    ['Expected Return', `${portRet.toFixed(2)}%`,                                                'Estimasi return tahunan'],
    ['Risk-Free Rate',  `${(analytics?.riskFreeRate ?? 0).toFixed(2)}%`,                          'SBN acuan'],
    ['', '', ''],

    ['=== MAKROEKONOMI ===', '', ''],
    ['Indikator', 'Nilai', 'Sumber'],
    ['BI Rate',       `${macroInputs?.biRate    ?? 5.25}%`,  'Bank Indonesia'],
    ['Inflasi YoY',   `${macroInputs?.inflation ?? 3.48}%`,  'BPS'],
    ['USD/IDR',       `${macroInputs?.usdIdr    ?? 17700}`,  'Alpha Vantage'],
    ['SBN 10Y Yield', '6.71%',                               'DJPPR Kemenkeu'],
    ['DXY Index',     '104.50',                              'Federal Reserve'],
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

  downloadFile(csv, `AlphaShield_Portfolio_${ts}.csv`, 'text/csv;charset=utf-8;');
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
  const retRaw = analytics?.portfolioReturn ?? 0;

  const payload = {
    meta: {
      platform:   'AlphaShield PEDS Core System v3.9',
      exportedAt: new Date().toISOString(),
      disclaimer: 'Educational simulation only. Not investment advice.',
    },
    scenario: {
      id:        scenarioId,
      biRate:    macroInputs?.biRate    ?? 5.25,
      inflation: macroInputs?.inflation ?? 3.48,
      usdIdr:    macroInputs?.usdIdr    ?? 17700,
    },
    allocation: {
      stocks: weights?.stocks ?? 0,
      bonds:  weights?.bonds  ?? 0,
      gold:   weights?.gold   ?? 0,
      cash:   weights?.cash   ?? 0,
    },
    analytics: {
      sharpeRatio:       analytics?.sharpe                 ?? 0,
      portfolioBeta:     analytics?.beta                   ?? 0,
      maxDrawdown:       analytics?.estimatedMaxDrawdown   ?? 0,
      volatilitasPct:    raw < 1 && raw > 0 ? raw * 100 : raw,
      expectedReturnPct: retRaw < 1 && retRaw > 0 ? retRaw * 100 : retRaw,
      riskFreeRatePct:   analytics?.riskFreeRate           ?? 0,
    },
    macroContext: {
      biRate:  `${macroInputs?.biRate ?? 5.25}%`,
      usdIdr:  `${macroInputs?.usdIdr ?? 17700}`,
      inflasi: `${macroInputs?.inflation ?? 3.48}% YoY`,
      sbn10y:  '6.71%',
      dxy:     '104.50',
    },
  };

  downloadFile(
    JSON.stringify(payload, null, 2),
    `AlphaShield_Portfolio_${ts}.json`,
    'application/json'
  );
}
