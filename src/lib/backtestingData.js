// src/lib/backtestingData.js
// Static historical backtesting scenarios
// Data curated from public historical records:
// - Krisis 1998: IHSG, IDR, and SBN historical performance
// - COVID 2020: March 2020 crash and recovery
// - Mei 2026: Current period (live reference)
// All return figures are ESTIMATES for educational purposes

export const HISTORICAL_CRISES = [
  {
    id:          'krisis_1997_98',
    name:        'Krisis Moneter Asia 1997-1998',
    period:      'Jul 1997 — Des 1998',
    duration:    '18 bulan',
    icon:        '🔴',
    severity:    'EKSTREM',
    severityColor: '#ef4444',
    context:     'Rupiah melemah dari Rp 2.450 menjadi Rp 16.000/USD (+553%). '
               + 'IHSG jatuh 65%. Inflasi meledak ke 77.6%. Bank Indonesia menaikkan '
               + 'suku bunga darurat hingga 65% untuk stabilisasi.',
    macroConditions: {
      'IDR Peak':     'Rp 16.800/USD',
      'Inflasi Puncak': '77.6% YoY',
      'BI Rate Puncak': '~65%',
      'IHSG Decline':  '-65%',
    },
    // Estimated performance per asset class during this crisis
    assetPerformance: {
      stocks: { returnPct: -65, note: 'IHSG crash — saham domestik hancur' },
      bonds:  { returnPct: -40, note: 'SBN yield meledak — harga obligasi turun drastis' },
      gold:   { returnPct: +420, note: 'XAU/IDR naik +420% (harga emas USD stabil + IDR -83%)' },
      cash:   { returnPct: -78, note: 'Cash IDR terdepresiasi masif — purchasing power hilang' },
    },
    // Estimated portfolio performance by scenario allocation
    portfolioOutcomes: {
      EQUILIBRIUM:     { returnPct: -48, label: 'Alokasi Normal (40% saham, 30% SBN)', color: '#ef4444' },
      TIGHTENING:      { returnPct: -18, label: 'Alokasi Defensif (15% saham, 45% SBN)', color: '#f59e0b' },
      CURRENCY_STRESS: { returnPct: +89, label: 'Alokasi Krisis (45% emas, 35% USD)', color: '#10b981' },
    },
    lesson: 'Di krisis nilai tukar ekstrem, emas dan USD adalah satu-satunya '
          + 'aset yang melindungi kekayaan. Alokasi normal kehilangan hampir '
          + 'setengah nilainya, sedangkan alokasi krisis justru tumbuh 89%.',
  },
  {
    id:          'covid_2020',
    name:        'Crash COVID-19 & Recovery',
    period:      'Feb 2020 — Des 2020',
    duration:    '10 bulan (crash 2 bulan, recovery 8 bulan)',
    icon:        '🟡',
    severity:    'PARAH',
    severityColor: '#f59e0b',
    context:     'IHSG jatuh 37% dalam 2 bulan (Februari-Maret 2020). '
               + 'Rupiah melemah ke Rp 16.800/USD. BI memangkas rate agresif '
               + 'ke 3.5% dan menyuntik likuiditas masif. Recovery V-shape '
               + 'terjadi di akhir 2020.',
    macroConditions: {
      'IDR Peak':       'Rp 16.800/USD',
      'BI Rate':        'Dipangkas ke 3.50%',
      'IHSG Decline':   '-37% (peak to trough)',
      'Recovery':       'IHSG +35% dari bottom dalam 6 bulan',
    },
    assetPerformance: {
      stocks: { returnPct: -18, note: 'IHSG -37% crash lalu recovery — net -18% full year' },
      bonds:  { returnPct: +8,  note: 'SBN menguat saat BI pangkas rate agresif' },
      gold:   { returnPct: +28, note: 'XAU/USD +25% + IDR melemah = XAU/IDR +28%' },
      cash:   { returnPct: -8,  note: 'IDR cash melemah 8% vs USD sepanjang 2020' },
    },
    portfolioOutcomes: {
      EQUILIBRIUM:     { returnPct: -6,  label: 'Alokasi Normal (40% saham, 30% SBN)', color: '#f59e0b' },
      TIGHTENING:      { returnPct: +4,  label: 'Alokasi Defensif (15% saham, 45% SBN)', color: '#10b981' },
      CURRENCY_STRESS: { returnPct: +18, label: 'Alokasi Krisis (45% emas, 35% USD)', color: '#10b981' },
    },
    lesson: 'COVID menunjukkan bahwa portofolio defensif bisa bertahan bahkan '
          + 'di tengah crash terbesar sejak 2008. Alokasi obligasi yang tinggi '
          + 'memberikan buffer signifikan saat equity crash.',
  },
  {
    id:          'mei_2026',
    name:        'Gejolak Geopolitik Timur Tengah 2026',
    period:      'Jan 2026 — Jun 2026 (ongoing)',
    duration:    '6 bulan (berlangsung)',
    icon:        '🔶',
    severity:    'SIGNIFIKAN',
    severityColor: '#f97316',
    context:     'Konflik Timur Tengah memicu lonjakan minyak, inflasi impor, '
               + 'dan capital outflow dari EM. BI menaikkan rate 50bps ke 5.25% '
               + 'pada Mei 2026. IHSG turun 11.8% di Mei — terburuk 26 tahun. '
               + 'Rupiah mendekati 17.800/USD.',
    macroConditions: {
      'BI Rate':        '5.25% (naik 50bps Mei 2026)',
      'USD/IDR':        '~17.700-17.879',
      'IHSG MTD Mei':   '-11.8% (terburuk sejak Mei 2000)',
      'Inflasi':        '3.48% YoY — di atas target',
    },
    assetPerformance: {
      stocks: { returnPct: -18, note: 'IHSG YTD 2026: ~-19.5% hingga April-Mei' },
      bonds:  { returnPct: -4,  note: 'SBN sideways 6.71% — harga stagnan di tengah uncertainty' },
      gold:   { returnPct: +24, note: 'XAU/USD ATH + IDR melemah 9.2% YTD = return ganda' },
      cash:   { returnPct: -9,  note: 'IDR cash eroded 9.2% vs USD YTD 2026' },
    },
    portfolioOutcomes: {
      EQUILIBRIUM:     { returnPct: -9,  label: 'Alokasi Normal (40% saham, 30% SBN)', color: '#f59e0b' },
      TIGHTENING:      { returnPct: -1,  label: 'Alokasi Defensif (15% saham, 45% SBN)', color: '#f59e0b' },
      CURRENCY_STRESS: { returnPct: +17, label: 'Alokasi Krisis (45% emas, 35% USD)', color: '#10b981' },
    },
    lesson: 'PERIODE SAAT INI: Data menunjukkan alokasi yang tepat (CURRENCY_STRESS) '
          + 'memberikan proteksi signifikan. Alokasi normal sudah kehilangan 9% YTD. '
          + 'Keputusan alokasi yang tepat di awal tahun sangat menentukan.',
  },
  {
    id:          'taper_tantrum_2013',
    name:        'Krisis Rate Hike 2013 (Taper Tantrum)',
    period:      'Mei 2013 — Des 2013',
    duration:    '8 bulan',
    icon:        '⚡',
    severity:    'SIGNIFIKAN',
    severityColor: '#f97316',
    context:     'Federal Reserve secara mengejutkan menyiratkan tapering stimulus moneter, memicu capital outflow masif dari emerging markets. Rupiah terdepresiasi dari Rp9.700 menjadi Rp12.200 per USD, SBN mengalami aksi jual keras, dan Bank Indonesia terpaksa menaikkan BI Rate agresif dari 5.75% ke 7.50% guna menstabilkan pasar.',
    macroConditions: {
      'USD/IDR':        '9.700 -> 12.200 (+25.7%)',
      'BI Rate':        'Naik ke 7.50% (dari 5.75%)',
      'IHSG Decline':   '-23% (peak to trough)',
      'SBN Yield':      'Meledak dari ~5.4% ke ~8.5%',
    },
    assetPerformance: {
      stocks: { returnPct: -15, note: 'IHSG sempat koreksi tajam -23% sebelum pulih ke net -15% YTD' },
      bonds:  { returnPct: -11, note: 'Yield SBN melonjak tinggi mengakibatkan koreksi harga obligasi' },
      gold:   { returnPct: +12, note: 'Harga emas USD jatuh, tapi XAU/IDR menguat berkat depresiasi Rupiah' },
      cash:   { returnPct: +26, note: 'Aset kas berdenominasi USD melonjak +25.7% dalam nilai Rupiah' },
    },
    portfolioOutcomes: {
      EQUILIBRIUM:     { returnPct: -9,  label: 'Alokasi Normal (40% saham, 30% SBN)', color: '#f59e0b' },
      TIGHTENING:      { returnPct: -7,  label: 'Alokasi Defensif (15% saham, 45% SBN)', color: '#f59e0b' },
      CURRENCY_STRESS: { returnPct: +15, label: 'Alokasi Krisis (45% emas, 35% USD)', color: '#10b981' },
    },
    lesson: 'Krisis 2013 memperlihatkan dampak guncangan suku bunga AS terhadap ketidakstabilan nilai tukar dan obligasi lokal. Memiliki cadangan kas dalam mata uang keras (USD) terbukti menjadi instrumen penyelamat terbaik.',
  },
];

// Helper: get performance for specific scenario allocation
export function getCrisisPerformanceForScenario(crisisId, scenarioId) {
  const crisis = HISTORICAL_CRISES.find(c => c.id === crisisId);
  if (!crisis) return null;
  return crisis.portfolioOutcomes[scenarioId] ?? null;
}
