// src/lib/glossaryData.js
// Financial glossary — terms explained in Bahasa Indonesia
// Used by GlossaryTerm component for hover tooltips

export const GLOSSARY = {
  sharpeRatio: {
    term:       'Sharpe Ratio',
    symbol:     'σ',
    definition: 'Mengukur seberapa besar return yang kamu dapatkan per unit risiko yang kamu ambil. Semakin tinggi semakin baik. Di atas 1.0 = excellent, 0.5-1.0 = baik, di bawah 0.5 = perlu optimasi.',
    example:    'Sharpe 0.57 artinya: untuk setiap 1% risiko yang diambil, portofolio menghasilkan 0.57% return berlebih di atas risk-free rate.',
    learnMore:  'Dikembangkan oleh William Sharpe (Nobel Economics 1990)',
  },
  portfolioBeta: {
    term:       'Portfolio Beta',
    symbol:     'β',
    definition: 'Mengukur seberapa sensitif portofoliomu terhadap pergerakan pasar (IHSG). Beta 1.0 = bergerak sama dengan pasar. Beta < 1 = lebih stabil dari pasar.',
    example:    'Beta 0.23 berarti kalau IHSG turun 10%, portofoliomu hanya turun ~2.3%. Sangat defensif.',
    learnMore:  'Beta rendah diinginkan saat pasar volatile seperti kondisi saat ini.',
  },
  maxDrawdown: {
    term:       'Maximum Drawdown',
    symbol:     'MDD',
    definition: 'Penurunan terbesar yang pernah terjadi dari titik puncak ke titik terendah. Mengukur risiko kerugian terburuk yang mungkin dialami.',
    example:    'MDD -8% berarti dalam skenario terburuk historis, portofolio ini pernah turun maksimal 8% dari puncaknya.',
    learnMore:  'Semakin kecil (mendekati 0%) semakin baik untuk investor konservatif.',
  },
  volatilitas: {
    term:       'Volatilitas',
    symbol:     'σ',
    definition: 'Standar deviasi return — mengukur seberapa "bergejolak" nilai portofolio dari hari ke hari. Volatilitas tinggi = fluktuasi besar = risiko lebih tinggi.',
    example:    'Volatilitas 4.8% berarti dalam kondisi normal, nilai portofolio bisa naik-turun sekitar ±4.8% dalam setahun.',
    learnMore:  'Portofolio defensif biasanya memiliki volatilitas 3-8%.',
  },
  biRate: {
    term:       'BI Rate (BI 7-Day RR)',
    symbol:     '%',
    definition: 'Suku bunga acuan Bank Indonesia. Saat naik, pinjaman makin mahal, saham cenderung turun, obligasi lebih menarik. Saat turun, sebaliknya.',
    example:    'BI Rate 5.50% (naik ke 5.50% di RDG 9 Juni 2026) menekan IHSG dan memperkuat daya tarik SBN.',
    learnMore:  'Ditetapkan setiap bulan dalam Rapat Dewan Gubernur (RDG) Bank Indonesia.',
  },
  mpt: {
    term:       'Modern Portfolio Theory',
    symbol:     'MPT',
    definition: 'Teori yang dikembangkan Harry Markowitz (1952) — membuktikan bahwa diversifikasi aset dapat mengoptimalkan return untuk tingkat risiko tertentu. Fondasi dari alokasi aset modern.',
    example:    'Macroscope menggunakan MPT untuk menghitung alokasi optimal antara saham, obligasi, emas, dan kas.',
    learnMore:  'Harry Markowitz memenangkan Nobel Economics 1990 untuk teori ini.',
  },
  sbn: {
    term:       'Surat Berharga Negara (SBN)',
    symbol:     'SBN',
    definition: 'Obligasi yang diterbitkan Pemerintah Indonesia. Dianggap paling aman karena dijamin negara. Tersedia untuk ritel melalui ORI dan SR.',
    example:    'SBN 10Y yield 6.78% saat ini lebih tinggi dari inflasi 3.08% — artinya real yield positif.',
    learnMore:  'ORI (Obligasi Ritel Indonesia) dan SR (Sukuk Ritel) bisa dibeli mulai Rp 1 juta.',
  },
  efficientFrontier: {
    term:       'Efficient Frontier',
    symbol:     'EF',
    definition: 'Garis yang menghubungkan portofolio-portofolio optimal — memberikan return tertinggi untuk setiap tingkat risiko tertentu. Portofolio "terbaik" selalu berada di atau dekat garis ini.',
    example:    'Setiap titik di scatter plot Analisis mewakili satu kombinasi alokasi acak. Titik di garis atas adalah yang paling efisien.',
    learnMore:  'Portofolio di bawah garis bisa dioptimalkan untuk return lebih tinggi tanpa risiko tambahan.',
  },
  monteCarlo: {
    term:       'Simulasi Monte Carlo',
    symbol:     'MC',
    definition: 'Metode komputasi yang menjalankan ribuan skenario acak untuk memprediksi distribusi kemungkinan hasil di masa depan. Bukan prediksi pasti — distribusi probabilitas.',
    example:    'Macroscope menjalankan 1.000 simulasi × 252 hari untuk menghasilkan range median/best/worst case.',
    learnMore:  'Dinamakan dari kasino Monte Carlo karena menggunakan prinsip keacakan.',
  },
  xauIdr: {
    term:       'XAU/IDR',
    symbol:     'XAU',
    definition: 'Harga emas dalam Rupiah. Saat Rupiah melemah, XAU/IDR naik meski harga emas USD diam — inilah "double benefit" emas bagi investor Indonesia.',
    example:    'Emas USD naik 10% + IDR melemah 9% = XAU/IDR naik ~20%.',
    learnMore:  'XAU adalah kode ISO 4217 untuk emas (gold) — berasal dari "aurum" (Latin).',
  },
};
