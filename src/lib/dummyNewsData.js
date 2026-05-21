/**
 * Dummy news data for MacroNewsCards component.
 * 6 simulation articles with Indonesian financial context.
 *
 * @module dummyNewsData
 */

export const DUMMY_NEWS = [
  {
    id: 1,
    title: "BI Pertahankan Suku Bunga di 6.00%, Fokus pada Stabilitas Rupiah",
    source: "CNBC Indonesia",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: "NEUTRAL",
    sentimentScore: 0.52,
    summary:
      "Rapat Dewan Gubernur Bank Indonesia memutuskan untuk mempertahankan BI 7-Day Repo Rate pada level 6.00%, sesuai ekspektasi konsensus analis.",
    tags: ["BI Rate", "Rupiah", "Kebijakan Moneter"],
    url: "#",
  },
  {
    id: 2,
    title: "IHSG Menguat 1.2% Ditopang Sektor Perbankan dan Komoditas",
    source: "Bisnis.com",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    sentiment: "BULLISH",
    sentimentScore: 0.78,
    summary:
      "Indeks Harga Saham Gabungan (IHSG) ditutup menguat signifikan dengan nilai transaksi melampaui Rp 12 triliun, dipimpin oleh saham big cap perbankan.",
    tags: ["IHSG", "Saham", "Perbankan"],
    url: "#",
  },
  {
    id: 3,
    title: "DXY Sentuh Level Tertinggi 3 Bulan, Tekanan Capital Outflow Mengintai EM",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sentiment: "BEARISH",
    sentimentScore: 0.71,
    summary:
      "Dollar Index (DXY) menguat melampaui level 106 untuk pertama kalinya sejak Oktober, dipicu data ketenagakerjaan AS yang lebih kuat dari ekspektasi.",
    tags: ["DXY", "Dollar", "Emerging Market"],
    url: "#",
  },
  {
    id: 4,
    title: "Yield SBN 10Y Terkoreksi ke 7.05%, Investor Antisipasi NFP Data",
    source: "Kontan",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sentiment: "NEUTRAL",
    sentimentScore: 0.48,
    summary:
      "Pasar Surat Berharga Negara bergerak mixed menjelang rilis data Non-Farm Payroll Amerika Serikat yang akan menentukan arah kebijakan Federal Reserve.",
    tags: ["SBN", "Obligasi", "Fed"],
    url: "#",
  },
  {
    id: 5,
    title: "Emas Spot Tembus USD 2.380/Oz, XAU/IDR Capai Rekor Baru",
    source: "Bloomberg",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    sentiment: "BULLISH",
    sentimentScore: 0.83,
    summary:
      "Harga emas spot internasional mencapai level tertinggi sepanjang masa, didorong meningkatnya permintaan safe haven di tengah ketidakpastian geopolitik.",
    tags: ["Emas", "XAU", "Safe Haven"],
    url: "#",
  },
  {
    id: 6,
    title: "Inflasi Indonesia April 2024 Tercatat 3.0% YoY, Di Atas Ekspektasi",
    source: "BPS",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentiment: "BEARISH",
    sentimentScore: 0.61,
    summary:
      "Badan Pusat Statistik melaporkan inflasi tahunan April 2024 mencapai 3.0%, melampaui konsensus 2.8%, terutama didorong kenaikan harga pangan dan energi.",
    tags: ["Inflasi", "CPI", "BPS"],
    url: "#",
  },
];
