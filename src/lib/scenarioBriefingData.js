// src/lib/scenarioBriefingData.js
// Rich briefing content per scenario — shown on switch

export const SCENARIO_BRIEFINGS = {
  EQUILIBRIUM: {
    headline:    'Ekspansi Normal',
    subheadline: 'Kondisi Makro Stabil — Mode Growth',
    badge:       'AMAN',
    summary:
      'Suku bunga di level netral, inflasi terkendali, dan Rupiah dalam zona stabilitas. Ini adalah kondisi ideal untuk memaksimalkan eksposur ke aset berisiko dengan dukungan obligasi sebagai penyeimbang.',
    macroSnapshot: [
      { label: 'BI Rate',  value: '4.75%',  note: 'Level akomodatif',    trend: 'stable' },
      { label: 'USD/IDR',  value: '15.850', note: 'Zona stabil',          trend: 'stable' },
      { label: 'IHSG',     value: '7.400',  note: 'Tren naik moderat',    trend: 'up'     },
      { label: 'Inflasi',  value: '2.50%',  note: 'Dalam target 2.5±1%', trend: 'stable' },
    ],
    keyActions: [
      { icon: '📈', action: 'Pertahankan 40% ekuitas — saham perbankan dan konsumer unggulan' },
      { icon: '🏛️', action: 'Hold 30% SBN — tenor menengah 5-7Y untuk yield optimal' },
      { icon: '🥇', action: 'Emas 10% sebagai asuransi, bukan spekulasi' },
    ],
    keyRisks: [
      'Eskalasi geopolitik mendadak dapat shift ke TIGHTENING',
      'Kenaikan harga minyak global bisa dorong inflasi lebih tinggi',
      'Penguatan DXY yang agresif bisa tekan Rupiah',
    ],
    portfolioChange: {
      stocks: 40, bonds: 30, gold: 10, cash: 20,
    },
  },

  TIGHTENING: {
    headline:    'Pengetatan Moneter',
    subheadline: 'BI Rate 5.25% — Mode Defensif',
    badge:       'WASPADA',
    summary:
      'BI menaikkan suku bunga 50bps ke 5.25% pada Mei 2026 sebagai respons terhadap tekanan inflasi impor dan pelemahan Rupiah akibat gejolak geopolitik Timur Tengah. Portofolio harus dirotasi ke aset defensif.',
    macroSnapshot: [
      { label: 'BI Rate',  value: '5.25%',  note: 'Naik 50bps Mei 2026',  trend: 'up'   },
      { label: 'USD/IDR',  value: '17.700', note: 'Mendekati rekor lemah', trend: 'up'   },
      { label: 'IHSG',     value: '6.170',  note: 'Turun 11.8% Mei 2026', trend: 'down' },
      { label: 'SBN 10Y',  value: '6.71%',  note: 'Yield menarik',         trend: 'up'   },
    ],
    keyActions: [
      { icon: '🏛️', action: 'Tingkatkan SBN ke 45% — lock-in yield 6.71% sebelum siklus berakhir' },
      { icon: '📉', action: 'Kurangi ekuitas ke 15% — hanya saham defensif neraca kuat' },
      { icon: '🥇', action: 'Tambah emas ke 15% — hedge Rupiah tertekan' },
    ],
    keyRisks: [
      'Kenaikan BI Rate tambahan jika gejolak global berlanjut',
      'NPL perbankan mulai naik seiring cost of credit meningkat',
      'Capital outflow berlanjut jika Fed tidak pivot',
    ],
    portfolioChange: {
      stocks: 15, bonds: 45, gold: 15, cash: 25,
    },
  },

  CURRENCY_STRESS: {
    headline:    'Tekanan Nilai Tukar',
    subheadline: 'Rupiah Krisis — Mode Perlindungan Kekayaan',
    badge:       'KRISIS',
    summary:
      'Rupiah mendekati 17.800/USD — level terlemah dalam sejarah. Setiap IDR yang tidak dilindungi mengalami erosi kekayaan riil. Prioritas utama: perlindungan purchasing power melalui emas dan hard currency.',
    macroSnapshot: [
      { label: 'USD/IDR',  value: '17.879', note: 'Mendekati rekor all-time', trend: 'up'   },
      { label: 'IHSG',     value: '6.170',  note: 'Worst Mei in 26 years',   trend: 'down' },
      { label: 'XAU/IDR',  value: '+24%',   note: 'YTD return emas IDR',     trend: 'up'   },
      { label: 'BI Rate',  value: '5.25%',  note: 'Belum cukup stabilkan',   trend: 'up'   },
    ],
    keyActions: [
      { icon: '🥇', action: 'Maksimalkan emas ke 45% — XAU/IDR double benefit dari harga + IDR' },
      { icon: '💵', action: 'Konversi 35% ke USD — tabungan valas atau reksa dana USD' },
      { icon: '⚡', action: 'Ekuitas hanya 5% komoditas ekspor (ADRO, PTBA) — USD revenue alami' },
    ],
    keyRisks: [
      'Intervensi BI bisa perkuat IDR sementara — timing exit penting',
      'Harga emas USD koreksi bisa kurangi lindung nilai',
      'Regulasi pembatasan valas bisa berubah sewaktu-waktu',
    ],
    portfolioChange: {
      stocks: 5, bonds: 15, gold: 45, cash: 35,
    },
  },
};

export const ASSET_LABELS = {
  stocks: 'Ekuitas',
  bonds:  'Obligasi SBN',
  gold:   'Emas Fisik',
  cash:   'Kas / USD',
};

export const ASSET_COLORS = {
  stocks: '#3b82f6',
  bonds:  '#a78bfa',
  gold:   '#fbbf24',
  cash:   '#34d399',
};
