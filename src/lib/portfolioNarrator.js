// src/lib/portfolioNarrator.js
// Generates human-readable narrative from MPT analytics + scenario
// Pure functions — no side effects, fully testable

export function narrateSharpRatio(sharpe, scenarioId) {
  const scenarios = {
    EQUILIBRIUM: {
      high:   'Portofolio kamu bekerja sangat efisien — setiap unit risiko yang diambil memberikan return yang sangat memuaskan dalam kondisi pasar normal ini.',
      medium: 'Efisiensi portofolio cukup baik untuk kondisi ekspansi. Masih ada potensi optimasi dengan sedikit rebalancing.',
      low:    'Efisiensi di bawah target untuk kondisi pasar yang seharusnya menguntungkan ini. Pertimbangkan review alokasi saham.',
    },
    TIGHTENING: {
      high:   'Luar biasa — portofolio kamu tahan terhadap tekanan suku bunga tinggi. Rotasi ke obligasi sudah memberikan hasil.',
      medium: 'Efisiensi masih terjaga di tengah pengetatan moneter. Pertahankan bobot obligasi negara.',
      low:    'Tekanan suku bunga mulai terasa di portofolio. Pertimbangkan tambah alokasi SBN jangka pendek.',
    },
    CURRENCY_STRESS: {
      high:   'Portofolio kamu berhasil melindungi kekayaan dari depresiasi Rupiah. Emas dan USD bekerja sebagai buffer yang efektif.',
      medium: 'Perlindungan cukup, namun masih ada eksposur IDR yang perlu dimitigasi lebih lanjut.',
      low:    'Portofolio rentan terhadap krisis nilai tukar. Segera tambah porsi emas fisik dan kas USD.',
    },
  };

  const tier = sharpe >= 1.2 ? 'high' : sharpe >= 0.6 ? 'medium' : 'low';
  return (scenarios[scenarioId] ?? scenarios.EQUILIBRIUM)[tier];
}

export function narrateBeta(beta) {
  if (beta < 0.2)  return 'Sangat defensif — portofolio hampir tidak terpengaruh pergerakan IHSG. Cocok untuk kondisi krisis.';
  if (beta < 0.5)  return 'Defensif — bergerak lebih lambat dari pasar. Risiko lebih rendah, potensi gain lebih terbatas.';
  if (beta < 0.8)  return 'Moderat — mengikuti pasar dengan sedikit redaman. Keseimbangan risiko-return yang baik.';
  if (beta < 1.1)  return 'Sejalan pasar — portofolio bergerak hampir identik dengan IHSG Composite.';
  return 'Agresif — bergerak lebih kencang dari IHSG. Potensi gain tinggi, tapi siap dengan volatilitas.';
}

export function narrateMaxDrawdown(mdd) {
  const abs = Math.abs(mdd);
  if (abs < 8)   return `Risiko penurunan terkontrol. Buffer ${abs.toFixed(1)}% masih dalam zona aman untuk sebagian besar investor.`;
  if (abs < 15)  return `Potensi koreksi ${abs.toFixed(1)}% perlu diantisipasi. Pastikan dana darurat terpisah dari portofolio ini.`;
  if (abs < 25)  return `Drawdown ${abs.toFixed(1)}% bisa terasa signifikan. Hanya cocok untuk investor dengan toleransi risiko tinggi.`;
  return `Drawdown hingga ${abs.toFixed(1)}% adalah risiko serius. Pertimbangkan rebalancing segera ke aset lebih defensif.`;
}

export function narrateVolatility(stdDev, scenarioId) {
  if (scenarioId === 'CURRENCY_STRESS') {
    return stdDev < 8
      ? `Volatilitas ${stdDev.toFixed(1)}% — relatif terkontrol mengingat kondisi krisis. Emas membantu menstabilkan.`
      : `Volatilitas ${stdDev.toFixed(1)}% dalam kondisi krisis ini cukup tinggi. Review ulang komposisi aset defensif.`;
  }
  if (stdDev < 6)  return `Sangat stabil. Volatilitas ${stdDev.toFixed(1)}% menunjukkan portofolio terdiversifikasi dengan baik.`;
  if (stdDev < 12) return `Volatilitas moderat ${stdDev.toFixed(1)}% — tipikal untuk portofolio campuran saham-obligasi seimbang.`;
  return `Volatilitas ${stdDev.toFixed(1)}% tergolong tinggi. Pertimbangkan tambah alokasi obligasi atau emas untuk stabilisasi.`;
}

export function generateWhatIfImpact(currentSharpe, biRateDelta) {
  // Approximation: every 100bps rate hike reduces Sharpe by ~0.12
  const sharpeImpact = -(biRateDelta / 100) * 0.12;
  const newSharpe    = Math.max(0, currentSharpe + sharpeImpact).toFixed(2);
  const direction    = biRateDelta > 0 ? 'naik' : 'turun';
  const absDelta     = Math.abs(biRateDelta);

  return {
    newSharpe,
    direction,
    absDelta,
    interpretation:
      biRateDelta > 0
        ? `Jika BI Rate naik ${absDelta}bps, estimasi Sharpe Ratio turun dari ${currentSharpe.toFixed(2)} ke ${newSharpe}. Obligasi akan mengalami tekanan harga.`
        : `Jika BI Rate turun ${absDelta}bps, estimasi Sharpe Ratio naik dari ${currentSharpe.toFixed(2)} ke ${newSharpe}. Positif untuk ekuitas.`,
  };
}
