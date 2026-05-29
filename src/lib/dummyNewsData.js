// src/lib/dummyNewsData.js
// Updated news feed — verified context of late May 2026
// All stories reflect real macro events of May 2026

export const DUMMY_NEWS = [
  {
    id: 1,
    title: 'BI Naikkan Suku Bunga 50bps ke 5.25%, Sikap Agresif Hadapi Gejolak Global',
    source: 'CNBC Indonesia',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BEARISH',
    sentimentScore: 0.72,
    summary:
      'Rapat Dewan Gubernur Bank Indonesia pada 19-20 Mei 2026 memutuskan menaikkan BI Rate sebesar 50 bps menjadi 5.25%. Gubernur BI Perry Warjiyo menyebut langkah ini sebagai pre-emptive untuk menjaga stabilitas Rupiah di tengah eskalasi konflik geopolitik Timur Tengah yang memicu lonjakan harga minyak dan capital outflow dari EM.',
    tags: ['BI Rate', 'Kebijakan Moneter', 'Rupiah'],
    url: 'https://www.cnnindonesia.com/ekonomi/20260520142854-78-1360415',
  },
  {
    id: 2,
    title: 'Rupiah Mendekati Rekor Terlemah di 17.800, Tekanan Capital Outflow Berlanjut',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BEARISH',
    sentimentScore: 0.85,
    summary:
      'Nilai tukar Rupiah melemah mendekati 17.800 per dolar AS — approaching a fresh record low — pressured by broad USD strength amid growing inflation risks linked to Middle East uncertainty. Rupiah tercatat melemah 9.23% dalam 12 bulan terakhir dan 6.4% sepanjang tahun ini.',
    tags: ['Rupiah', 'USD/IDR', 'Capital Outflow', 'DXY'],
    url: 'https://tradingeconomics.com/indonesia/currency',
  },
  {
    id: 3,
    title: 'IHSG Anjlok 11.8% di Mei 2026, Terburuk Sejak Mei 2000',
    source: 'CNBC Indonesia',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BEARISH',
    sentimentScore: 0.88,
    summary:
      'IHSG mencetak rekor penurunan bulanan terburuk dalam 26 tahun di Mei 2026 dengan koreksi -11.8%. Sepanjang 2026, IHSG belum sekalipun mencatat zona hijau secara bulanan. Investor asing tercatat net sell dalam jumlah besar seiring melemahnya Rupiah dan kenaikan BI Rate.',
    tags: ['IHSG', 'Saham', 'Capital Outflow', 'BI Rate'],
    url: 'https://www.cnbcindonesia.com/research/20260528174658-128-738503',
  },
  {
    id: 4,
    title: 'Emas Spot Bertahan di USD 2.342/Oz, Demand Safe Haven Tetap Kuat',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BULLISH',
    sentimentScore: 0.83,
    summary:
      'Harga emas spot internasional bertahan di kisaran all-time high USD 2.342 per troy ounce. Permintaan safe haven dari investor global menguat seiring ketidakpastian geopolitik Timur Tengah. Dalam IDR, XAU/IDR telah memberikan return positif signifikan akibat kombinasi harga emas naik + Rupiah melemah.',
    tags: ['Emas', 'XAU', 'Safe Haven', 'Geopolitik'],
    url: '#',
  },
  {
    id: 5,
    title: 'SBN 10Y Yield Sideways di 6.71%, Pasar Tunggu Data Inflasi Mei',
    source: 'Kontan',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'NEUTRAL',
    sentimentScore: 0.50,
    summary:
      'Imbal hasil SBN tenor 10 tahun bergerak sideways di kisaran 6.547%–6.957%. Pasar obligasi menunggu rilis data inflasi Mei 2026 dari BPS yang dijadwalkan pekan depan. Spread SBN-UST masih di atas 230bps, memberikan daya tarik relatif untuk investor asing meski risiko nilai tukar masih tinggi.',
    tags: ['SBN', 'Obligasi', 'Yield', 'Inflasi'],
    url: '#',
  },
  {
    id: 6,
    title: 'Pertumbuhan Ekonomi Indonesia Q1 2026 Capai 5.61%, Tertinggi 13 Tahun',
    source: 'BPS',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'BULLISH',
    sentimentScore: 0.74,
    summary:
      'BPS melaporkan pertumbuhan ekonomi Indonesia pada Triwulan I-2026 sebesar 5.61% YoY — tertinggi untuk kuartal pertama dalam 13 tahun terakhir. Konsumsi rumah tangga dan investasi menjadi motor utama. Namun, analis memperingatkan tekanan eksternal dari konflik geopolitik dan pelemahan Rupiah dapat memperlambat momentum ini.',
    tags: ['GDP', 'Pertumbuhan Ekonomi', 'BPS', 'Q1 2026'],
    url: 'https://www.theindonesianinstitute.com/menilik-angka-pertumbuhan-ekonomi-indonesia-2026/',
  },
];
