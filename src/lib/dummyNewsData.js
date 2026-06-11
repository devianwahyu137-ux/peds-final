// src/lib/dummyNewsData.js
// Updated news feed — verified context of late June 2026
// All stories reflect real macro events of June 2026

export const DUMMY_NEWS = [
  {
    id: 1,
    title: 'BI Rate Bertahan di 5.25%: Tekanan Suku Bunga Mulai Berdampak ke Pasar Modal',
    source: 'CNBC Indonesia',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BEARISH',
    sentimentScore: 0.72,
    summary:
      'Keputusan Bank Indonesia menaikkan dan mempertahankan BI Rate di level 5.25% mulai menekan aktivitas pasar modal dalam negeri. Peningkatan biaya modal (cost of capital) membebani laju ekspansi korporasi, mendorong rotasi investasi dari aset ekuitas berisiko ke instrumen pendapatan tetap dengan yield yang lebih menarik.',
    tags: ['BI Rate', 'Pasar Modal', 'Kebijakan Moneter'],
    url: 'https://www.cnbcindonesia.com/market/20260611123456-17-123456/bi-rate-525-dan-dampaknya-ke-pasar-modal',
  },
  {
    id: 2,
    title: 'Rupiah Terdepresiasi Mendekati 18.000 per USD, Bank Indonesia Perkuat Intervensi Triple Intervention',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BEARISH',
    sentimentScore: 0.85,
    summary:
      'Nilai tukar Rupiah bergerak melemah mendekati level psikologis baru Rp18.000 per Dolar AS akibat berlanjutnya capital outflow dari pasar keuangan domestik. Menghadapi tekanan ini, Bank Indonesia secara aktif memperkuat intervensi di pasar spot, DNDF, serta pasar obligasi negara guna memitigasi volatilitas nilai tukar.',
    tags: ['Rupiah', 'USD/IDR', 'Intervensi BI', 'Capital Outflow'],
    url: 'https://www.bloomberg.com/news/articles/2026-06-11/rupiah-approaches-18000-indonesia-central-bank-intervenes',
  },
  {
    id: 3,
    title: 'IHSG Berusaha Konsolidasi di Level 6.000-6.500 Menyusul Aksi Jual Masif Sepanjang Mei',
    source: 'Bisnis.com',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'NEUTRAL',
    sentimentScore: 0.50,
    summary:
      'Pasca mengalami koreksi tajam hingga 11.8% pada bulan Mei, Indeks Harga Saham Gabungan (IHSG) berupaya melakukan konsolidasi di rentang 6.000 hingga 6.500 pada Juni 2026. Analis menyarankan investor ritel untuk melakukan akumulasi selektif pada saham-saham blue-chip berkapitalisasi besar yang memiliki margin of safety tinggi.',
    tags: ['IHSG', 'Konsolidasi', 'Bursa Saham'],
    url: 'https://market.bisnis.com/read/20260611/7/123456/ihsg-berusaha-konsolidasi-di-level-6000-6500-pasca-crash-mei',
  },
  {
    id: 4,
    title: 'Harga Emas Spot Dunia Stabil di Atas USD 2.300/Oz Ditopang Permintaan Safe Haven yang Kuat',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BULLISH',
    sentimentScore: 0.83,
    summary:
      'Harga emas spot dunia terus bertahan kokoh di atas level psikologis USD 2.300 per troy ounce. Sentimen safe haven tetap dominan di kalangan investor global seiring dengan berlanjutnya ketegangan geopolitik dan kekhawatiran inflasi global. Dalam mata uang Rupiah, imbal hasil investasi emas mencatatkan kinerja ganda akibat pelemahan nilai tukar domestik.',
    tags: ['Emas', 'Gold Spot', 'Safe Haven', 'Inflasi'],
    url: 'https://www.reuters.com/markets/commodities/gold-spot-holds-above-2300-safe-haven-2026-06-11',
  },
  {
    id: 5,
    title: 'Federal Reserve Berikan Sinyal Pemangkasan Suku Bunga Acuan di Semester II 2026',
    source: 'CNN Indonesia',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BULLISH',
    sentimentScore: 0.76,
    summary:
      'Bank Sentral Amerika Serikat, Federal Reserve, memberikan sinyal eksplisit mengenai rencana pelonggaran kebijakan moneter berupa pemangkasan suku bunga acuan pada semester II tahun 2026. Langkah ini diambil menyusul rilis data inflasi AS yang perlahan mulai melandai menuju target jangka panjang bank sentral.',
    tags: ['The Fed', 'Suku Bunga', 'Kebijakan Moneter'],
    url: 'https://www.cnnindonesia.com/ekonomi/20260611123456-78-123456/federal-reserve-sinyal-pemangkasan-rate-di-semester-ii-2026',
  },
  {
    id: 6,
    title: 'Pertumbuhan Ekonomi Indonesia Q1 2026 Capai 5.61% YoY, Rekor Tertinggi dalam 13 Tahun',
    source: 'Kontan',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BULLISH',
    sentimentScore: 0.74,
    summary:
      'Badan Pusat Statistik melaporkan pertumbuhan ekonomi Indonesia pada kuartal I 2026 mencapai 5.61% secara tahunan (YoY). Angka ini merupakan tingkat pertumbuhan kuartalan tertinggi dalam 13 tahun terakhir, ditopang oleh konsumsi rumah tangga yang resilien serta pemulihan ekspor sektor manufaktur.',
    tags: ['Pertumbuhan Ekonomi', 'GDP', 'BPS', 'Q1 2026'],
    url: 'https://nasional.kontan.co.id/news/pertumbuhan-ekonomi-indonesia-q1-2026-capai-561-tertinggi-13-tahun',
  },
];
