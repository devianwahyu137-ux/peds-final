// src/lib/dummyNewsData.js
// Macro Research Notes per scenario — educational interpretations

export const MACRO_RESEARCH_NOTES = {
  EQUILIBRIUM: [
    {
      title: "Optimalisasi Alokasi Saham di Tengah Stabilitas Suku Bunga",
      kategori: "Saham",
      sentiment: "BULLISH",
      sentimentScore: 0.80,
      summary: "Di tengah stabilitas BI Rate pada level 4.75% dan inflasi yang terkendali sebesar 2.50%, aset ekuitas berkapitalisasi pasar besar cenderung mencatatkan pertumbuhan yang solid. Tingkat volatilitas pasar yang rendah memfasilitasi ekspansi korporasi secara sehat.",
      tags: ["Saham", "Pertumbuhan", "Ekspansi"]
    },
    {
      title: "Peran Obligasi Pemerintah (SBN) Sebagai Penopang Portofolio Stabil",
      kategori: "Obligasi",
      sentiment: "NEUTRAL",
      sentimentScore: 0.50,
      summary: "Yield SBN 10Y yang berada di kisaran 6.40% memberikan tingkat pengembalian riil (real yield) yang positif dan menarik bagi investor. Instrumen ini berfungsi sebagai jangkar volatilitas portofolio utama.",
      tags: ["Obligasi", "SBN", "Yield"]
    },
    {
      title: "Konsolidasi Emas di Masa Inflasi Terkendali",
      kategori: "Emas",
      sentiment: "NEUTRAL",
      sentimentScore: 0.45,
      summary: "Emas fisik cenderung bergerak stabil di kala laju inflasi berada dalam target bank sentral. Alokasi emas minimal 10% tetap disarankan sebagai asuransi portofolio jangka panjang guna mengantisipasi gejolak mendadak.",
      tags: ["Emas", "Lindung Nilai", "Komoditas"]
    },
    {
      title: "Pengelolaan Likuiditas Rupiah Berbunga Kompetitif",
      kategori: "Likuiditas",
      sentiment: "NEUTRAL",
      sentimentScore: 0.50,
      summary: "Tingkat likuiditas instrumen pasar uang tetap terjaga dengan suku bunga deposito rata-rata yang stabil. Alokasi kas 20% memberikan fleksibilitas taktis apabila terjadi rotasi sektor di kemudian hari.",
      tags: ["Kas", "Likuiditas", "Pasar Uang"]
    }
  ],
  TIGHTENING: [
    {
      title: "Implikasi BI Rate Tinggi Terhadap Valuasi Saham Ritel",
      kategori: "Saham",
      sentiment: "BEARISH",
      sentimentScore: 0.30,
      summary: "Peningkatan BI Rate ke level 5.50% memicu kenaikan biaya modal (cost of capital) bagi emiten, sehingga menekan valuasi saham ritel dan komoditas. Investor disarankan membatasi alokasi saham hingga 15% pada sektor sensitif suku bunga.",
      tags: ["Saham", "Valuasi", "Suku Bunga"]
    },
    {
      title: "Daya Tarik Yield SBN 10Y di Fase Pengetatan Moneter",
      kategori: "Obligasi",
      sentiment: "BULLISH",
      sentimentScore: 0.75,
      summary: "Yield SBN 10Y yang naik ke 6.78% menjadi alternatif investasi defensif berimbal hasil menarik di atas suku bunga acuan. Mengunci yield obligasi pada level ini melindungi daya beli modal portofolio secara resmi.",
      tags: ["Obligasi", "Yield", "Defensif"]
    },
    {
      title: "Relevansi Emas sebagai Aset Lindung Nilai di Masa Transisi Inflasi",
      kategori: "Emas",
      sentiment: "BULLISH",
      sentimentScore: 0.65,
      summary: "Di tengah pengetatan likuiditas global dan pelemahan Rupiah terhadap USD/IDR, alokasi Emas sebesar 15% berfungsi meredam penurunan modal portofolio (maximum drawdown) dari volatilitas instrumen berbasis ekuitas.",
      tags: ["Emas", "Komoditas", "Inflasi"]
    },
    {
      title: "Taktik Mengamankan Kas di Tengah Likuiditas Ketat",
      kategori: "Likuiditas",
      sentiment: "BULLISH",
      sentimentScore: 0.70,
      summary: "Mempertahankan kas tinggi sebesar 25% memberi perlindungan likuiditas yang krusial. Instrumen deposito jangka pendek dan reksa dana pasar uang diuntungkan secara langsung dari tren kenaikan suku bunga simpanan.",
      tags: ["Kas", "Likuiditas", "Pasar Uang"]
    }
  ],
  CURRENCY_STRESS: [
    {
      title: "Mitigasi Kerugian Portofolio Saham di Tengah Depresiasi Nilai Tukar",
      kategori: "Saham",
      sentiment: "BEARISH",
      sentimentScore: 0.15,
      summary: "Pelemahan nilai tukar Rupiah memicu kenaikan beban impor emiten domestik dan mempercepat aliran dana asing keluar (capital flight). Alokasi saham dikurangi ekstrem ke kisaran 5% untuk menghindari risiko sistemis ekuitas.",
      tags: ["Saham", "USD/IDR", "Capital Flight"]
    },
    {
      title: "Peluang Akumulasi Emas Fisik sebagai Safe Haven Utama",
      kategori: "Emas",
      sentiment: "BULLISH",
      sentimentScore: 0.90,
      summary: "Emas terbukti memiliki korelasi negatif yang kuat dengan nilai tukar Rupiah selama krisis. Meningkatkan alokasi emas ke 45% sangat disarankan untuk mengompensasi depresiasi mata uang domestik.",
      tags: ["Emas", "Safe Haven", "Krisis"]
    },
    {
      title: "Strategi Diversifikasi SBN untuk Mencegah Pengurangan Aset",
      kategori: "Obligasi",
      sentiment: "BEARISH",
      sentimentScore: 0.35,
      summary: "Volatilitas yield SBN 10Y di level 6.71% mencerminkan premi risiko domestik yang meningkat. Membatasi durasi obligasi ke jangka pendek atau membatasi alokasi ke 15% disarankan guna menghindari penurunan harga.",
      tags: ["Obligasi", "SBN", "Durasi"]
    },
    {
      title: "Peran Likuiditas Valuta Asing Sebagai Penjaga Nilai Riil",
      kategori: "Mata Uang",
      sentiment: "BULLISH",
      sentimentScore: 0.80,
      summary: "Meningkatkan porsi instrumen kas hingga 35%, terutama berdenominasi Dolar AS (USD), membantu mengamankan daya beli portofolio secara taktis saat mata uang Rupiah menghadapi tekanan depresiasi yang intens.",
      tags: ["Kas", "Mata Uang", "USD"]
    }
  ],
  HIPERINFLASI: [
    {
      title: "Lompatan Inflasi Ekstrem dan Risiko Erosi Nilai Saham",
      kategori: "Saham",
      sentiment: "BEARISH",
      sentimentScore: 0.10,
      summary: "Laju inflasi yang mencapai 15.00% menggerus daya beli masyarakat dan menghancurkan margin laba bersih emiten non-komoditas. Sebagian besar aset ekuitas mengalami penurunan nilai riil secara signifikan.",
      tags: ["Saham", "Inflasi", "Daya Beli"]
    },
    {
      title: "Emas Sebagai Pelindung Kekayaan Terakhir Melawan Hiperinflasi",
      kategori: "Emas",
      sentiment: "BULLISH",
      sentimentScore: 0.95,
      summary: "Dalam skenario inflasi ekstrem di atas 10%, aset riil non-kertas seperti Emas merupakan instrumen wajib dengan alokasi dominan 60%. Nilai intrinsik emas melestarikan nilai riil kekayaan secara absolut.",
      tags: ["Emas", "Aset Riil", "Hiperinflasi"]
    },
    {
      title: "Penurunan Kinerja Obligasi di Tengah Lonjakan Yield SBN",
      kategori: "Obligasi",
      sentiment: "BEARISH",
      sentimentScore: 0.20,
      summary: "Yield SBN 10Y yang melonjak ke level 9.20% akibat BI Rate 8.50% menyebabkan kerugian modal (capital loss) yang parah pada obligasi jangka panjang. Portofolio defensif harus meminimalisasi porsi SBN.",
      tags: ["Obligasi", "SBN", "Capital Loss"]
    },
    {
      title: "Pentingnya Mengurangi Kepemilikan Kas Rupiah",
      kategori: "Likuiditas",
      sentiment: "BEARISH",
      sentimentScore: 0.15,
      summary: "Menyimpan modal dalam kas Rupiah tanpa lindung nilai berisiko mengalami kerugian riil akibat tingkat inflasi yang jauh melebihi suku bunga tabungan. Kas harus segera dialihkan ke instrumen beragun aset riil.",
      tags: ["Kas", "Rupiah", "Inflasi"]
    }
  ],
  RUPIAH_CRASH: [
    {
      title: "Dampak USD/IDR Menyentuh Level 20.000 Terhadap Emiten Impor",
      kategori: "Saham",
      sentiment: "BEARISH",
      sentimentScore: 0.20,
      summary: "Depresiasi Rupiah hingga menembus 20.000 per USD menekan emiten yang bergantung pada bahan baku impor. Sektor ekuitas mengalami pelemahan meluas kecuali sektor yang berorientasi ekspor komoditas.",
      tags: ["Saham", "Rupiah", "Kurs"]
    },
    {
      title: "Alokasi Emas Fisik untuk Melindungi Depresiasi Akut",
      kategori: "Emas",
      sentiment: "BULLISH",
      sentimentScore: 0.88,
      summary: "Pelemahan tajam nilai tukar memicu kenaikan otomatis harga emas dalam denominasi Rupiah. Porsi emas 40% membantu menjaga keseimbangan nilai portofolio secara agregat.",
      tags: ["Emas", "Kurs", "Lindung Nilai"]
    },
    {
      title: "Optimalisasi Kas Asing & Dolar AS Sebagai Tameng Likuiditas",
      kategori: "Mata Uang",
      sentiment: "BULLISH",
      sentimentScore: 0.85,
      summary: "Menahan 35% likuiditas dalam kas valuta keras seperti USD terbukti menjadi tameng proteksi paling efektif saat terjadi keruntuhan nilai tukar Rupiah secara masif.",
      tags: ["Kas", "USD", "Valas"]
    },
    {
      title: "Premi Risiko Obligasi Pemerintah (SBN) yang Melonjak",
      kategori: "Obligasi",
      sentiment: "BEARISH",
      sentimentScore: 0.30,
      summary: "Yield SBN 10Y naik mendekati 8.50% seiring melemahnya kepercayaan pasar terhadap mata uang domestik. Investor disarankan membatasi kepemilikan SBN dan berfokus pada instrumen jangka pendek.",
      tags: ["Obligasi", "SBN", "Kurs"]
    }
  ]
};
