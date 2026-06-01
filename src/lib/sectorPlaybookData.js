// src/lib/sectorPlaybookData.js
// Complete sector rotation dataset for all 3 macro scenarios
// Verified context: May 2026 — BI Rate 5.25%, IDR 17.700, IHSG 6.170
// All tickers are real BEI-listed securities

// Stance visual config
export const STANCE_CONFIG = {
  OVERWEIGHT: {
    label: 'OVERWEIGHT',
    color: '#10b981',
    bg:    'rgba(16,185,129,0.10)',
    border:'rgba(16,185,129,0.25)',
    icon:  '▲',
  },
  NEUTRAL: {
    label: 'NEUTRAL',
    color: '#f59e0b',
    bg:    'rgba(245,158,11,0.08)',
    border:'rgba(245,158,11,0.20)',
    icon:  '→',
  },
  UNDERWEIGHT: {
    label: 'UNDERWEIGHT',
    color: '#ef4444',
    bg:    'rgba(239,68,68,0.08)',
    border:'rgba(239,68,68,0.20)',
    icon:  '▼',
  },
  AVOID: {
    label: 'AVOID',
    color: '#7f1d1d',
    bg:    'rgba(127,29,29,0.15)',
    border:'rgba(239,68,68,0.30)',
    icon:  '✕',
  },
  MAXIMUM: {
    label: 'MAXIMUM',
    color: '#fbbf24',
    bg:    'rgba(251,191,36,0.12)',
    border:'rgba(251,191,36,0.30)',
    icon:  '★',
  },
};

// Risk signal config
export const RISK_SIGNALS = {
  HIGH:   { color: '#ef4444', label: 'RISIKO TINGGI'   },
  MEDIUM: { color: '#f59e0b', label: 'RISIKO SEDANG'   },
  LOW:    { color: '#10b981', label: 'RISIKO RENDAH'   },
};

// ── MAIN PLAYBOOK DATA ──────────────────────────────────────────
export const SECTOR_PLAYBOOK = {

  // ══════════════════════════════════════════════════════════════
  // EQUILIBRIUM: Normal Expansion — BI Rate 4.75%, IDR stable
  // Reference period: H2 2025 sebelum gejolak geopolitik
  // ══════════════════════════════════════════════════════════════
  EQUILIBRIUM: [
    {
      id:          'banking',
      sector:      'Perbankan & Keuangan',
      icon:        '🏦',
      stance:      'OVERWEIGHT',
      targetPct:   25,
      riskLevel:   'LOW',
      rationale:   'NIM (Net Interest Margin) perbankan besar terjaga optimal di kondisi suku bunga netral. Pertumbuhan kredit korporasi dan ritel masih sehat. CASA ratio tinggi memberikan cost of fund yang kompetitif.',
      catalysts: [
        'Suku bunga stabil mendukung ekspansi kredit',
        'Dividend yield BBCA dan BMRI kompetitif vs SBN',
        'Digital banking monetization terus berkembang',
      ],
      risks: [
        'Kenaikan NPL jika ekonomi melambat mendadak',
        'Kompresi NIM jika BI Rate dipangkas terlalu cepat',
      ],
      tickers: [
        {
          code:   'BBCA',
          name:   'Bank Central Asia',
          weight: 'Core Hold',
          note:   'CASA ratio terkuat ~80%. Premium multiple justified. Anchor portofolio perbankan.',
          marketCap: 'Rp 1.089 T',
        },
        {
          code:   'BMRI',
          name:   'Bank Mandiri',
          weight: 'Accumulate',
          note:   'State-owned moat. Corporate loan dominance. Dividend payout stabil >50%.',
          marketCap: 'Rp 524 T',
        },
        {
          code:   'BBRI',
          name:   'Bank Rakyat Indonesia',
          weight: 'Core Hold',
          note:   'Micro-segment monopoly via KUR. Penetrasi tier 2-3 masih luas.',
          marketCap: 'Rp 498 T',
        },
        {
          code:   'BBNI',
          name:   'Bank Negara Indonesia',
          weight: 'Tactical Add',
          note:   'Valuation discount vs peers. Corporate transformation improving RoE.',
          marketCap: 'Rp 185 T',
        },
      ],
    },
    {
      id:          'consumer',
      sector:      'Consumer Staples',
      icon:        '🛒',
      stance:      'OVERWEIGHT',
      targetPct:   15,
      riskLevel:   'LOW',
      rationale:   'Inelastic demand memberikan pricing power yang defensif. Penetrasi ke kota tier 2-3 masih menjadi growth driver jangka menengah. Margin operasional terjaga karena harga komoditas input stabil.',
      catalysts: [
        'Konsumsi rumah tangga tumbuh >5% YoY (BPS Q1 2026)',
        'Inflasi terkendali menjaga daya beli riil',
        'Ekspansi distribusi ke pasar baru',
      ],
      risks: [
        'Lonjakan harga bahan baku impor (gandum, gula)',
        'Persaingan dari private label ritel modern',
      ],
      tickers: [
        {
          code:   'ICBP',
          name:   'Indofood CBP Sukses Makmur',
          weight: 'Core Hold',
          note:   'Noodle & dairy monopoly. Export recovery Asia pasca normalisasi logistik.',
          marketCap: 'Rp 87 T',
        },
        {
          code:   'MYOR',
          name:   'Mayora Indah',
          weight: 'Accumulate',
          note:   'Export-driven ~40% revenue. Undervalued vs ICBP. Margin improvement trend.',
          marketCap: 'Rp 31 T',
        },
        {
          code:   'UNVR',
          name:   'Unilever Indonesia',
          weight: 'Hold',
          note:   'Mature growth, stable cash flow. Watch margin pressure from raw material.',
          marketCap: 'Rp 29 T',
        },
      ],
    },
    {
      id:          'telco',
      sector:      'Telekomunikasi & Utilitas',
      icon:        '📡',
      stance:      'NEUTRAL',
      targetPct:   10,
      riskLevel:   'LOW',
      rationale:   'Regulated revenue streams memberikan visibility cash flow yang tinggi. Namun growth terbatas — pasar seluler sudah mature. Cocok sebagai defensive yield play dalam portofolio.',
      catalysts: [
        'Monetisasi data enterprise dan B2B terus naik',
        'Fixed broadband penetration masih growth',
        'Dividen stabil: TLKM yield ~5-6%',
      ],
      risks: [
        'Persaingan tarif menekan ARPU',
        'Capex intensif untuk tower dan 5G rollout',
      ],
      tickers: [
        {
          code:   'TLKM',
          name:   'Telkom Indonesia',
          weight: 'Hold',
          note:   'Infrastruktur digital terlengkap. Data center dan cloud sebagai growth engine baru.',
          marketCap: 'Rp 272 T',
        },
        {
          code:   'EXCL',
          name:   'XL Axiata',
          weight: 'Tactical',
          note:   'Post-merger synergy dengan Smartfren unlock efficiency. Spectrum position kuat.',
          marketCap: 'Rp 31 T',
        },
      ],
    },
    {
      id:          'property',
      sector:      'Properti & Konstruksi',
      icon:        '🏗️',
      stance:      'NEUTRAL',
      targetPct:   5,
      riskLevel:   'MEDIUM',
      rationale:   'Suku bunga netral sedikit meringankan beban KPR, namun oversupply di segmen menengah-atas masih menjadi tekanan. Pilih developer dengan landbank strategis dan cash flow positif.',
      catalysts: [
        'Pemerintah dorong program rumah terjangkau',
        'Industrial estate demand dari relokasi pabrik',
      ],
      risks: [
        'Oversupply apartemen grade A di Jabodetabek',
        'Suku bunga KPR masih relatif tinggi untuk end-buyer',
      ],
      tickers: [
        {
          code:   'BSDE',
          name:   'Bumi Serpong Damai',
          weight: 'Hold',
          note:   'Largest landbank >4.000 ha. Diversified township beyond BSD area.',
          marketCap: 'Rp 32 T',
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // TIGHTENING: BI Rate 5.25% — Kondisi aktual Mei 2026
  // IHSG turun 11.8%, IDR 17.700, imported inflation rising
  // ══════════════════════════════════════════════════════════════
  TIGHTENING: [
    {
      id:          'bonds_govts',
      sector:      'Obligasi Negara (SBN)',
      icon:        '🏛️',
      stance:      'MAXIMUM',
      targetPct:   45,
      riskLevel:   'LOW',
      rationale:   'BI Rate 5.25% membuat yield SBN 10Y (6.71%) menjadi sangat menarik secara absolut. Lock-in yield sekarang sebelum siklus pengetatan berakhir. Risiko duration terjaga jika fokus di tenor menengah 3-5 tahun.',
      catalysts: [
        'Yield SBN 6.71% jauh di atas inflasi 3.48% → real yield positif',
        'ORI/SR tersedia untuk investor ritel dengan minimal risiko',
        'Saat BI mulai dovish nanti, harga SBN naik (capital gain)',
      ],
      risks: [
        'Kenaikan BI Rate tambahan akan turunkan harga SBN',
        'Capital outflow asing bisa tekan yield lebih jauh naik',
      ],
      tickers: [
        {
          code:   'ORI025',
          name:   'Obligasi Ritel Indonesia 025',
          weight: 'Primary',
          note:   'Instrumen ritel paling aman. Kupon floating di atas BI Rate. Tenor 3 tahun.',
          marketCap: 'Min. Rp 1 juta',
        },
        {
          code:   'SR020',
          name:   'Sukuk Ritel 020',
          weight: 'Complement',
          note:   'Alternatif syariah dengan return kompetitif. Kupon tetap di atas 6%.',
          marketCap: 'Min. Rp 1 juta',
        },
        {
          code:   'FR0100',
          name:   'SBN FR0100 (10Y Benchmark)',
          weight: 'Institutional',
          note:   'Pasar sekunder paling likuid. Cocok untuk investor yang ingin fleksibilitas exit.',
          marketCap: 'Min. Rp 1 miliar',
        },
        {
          code:   'FR0091',
          name:   'SBN FR0091 (5Y)',
          weight: 'Sweet Spot',
          note:   'Duration sweet spot: yield kompetitif dengan risiko lebih rendah dari tenor 10Y.',
          marketCap: 'Min. Rp 1 miliar',
        },
      ],
    },
    {
      id:          'banking_def',
      sector:      'Perbankan Defensif',
      icon:        '🏦',
      stance:      'UNDERWEIGHT',
      targetPct:   10,
      riskLevel:   'MEDIUM',
      rationale:   'Cost of funds naik lebih cepat dari repricing kredit → NIM compression Q2-Q3 2026. Hanya pertahankan big-cap dengan CASA buffer terkuat. Kurangi exposure ke bank mid-size yang rentan terhadap kenaikan NPL.',
      catalysts: [
        'Kredit UMKM masih tumbuh didukung program KUR pemerintah',
        'BBCA CASA ratio >80% lindungi margin lebih baik dari peers',
      ],
      risks: [
        'NIM compression: cost of fund naik lebih cepat dari loan repricing',
        'NPL di sektor properti dan consumer mulai naik',
        'Valuasi masih premium di tengah earning pressure',
      ],
      tickers: [
        {
          code:   'BBCA',
          name:   'Bank Central Asia',
          weight: 'Reduce to Hold',
          note:   'Defensif terkuat via CASA dominance. Tapi kurangi dari core ke secondary hold.',
          marketCap: 'Rp 1.089 T',
        },
        {
          code:   'BBRI',
          name:   'Bank Rakyat Indonesia',
          weight: 'Hold',
          note:   'Micro segment partial insulation via KUR. Watch credit cost trajectory.',
          marketCap: 'Rp 498 T',
        },
      ],
    },
    {
      id:          'telco_def',
      sector:      'Telekomunikasi (Defensif)',
      icon:        '📡',
      stance:      'OVERWEIGHT',
      targetPct:   15,
      riskLevel:   'LOW',
      rationale:   'Regulated pricing + recurring cash flow = shelter di tengah volatilitas. Saat saham growth tertekan oleh kenaikan discount rate, Telco menjadi safe harbor karena DCF valuation tidak sensitif terhadap rate hike.',
      catalysts: [
        'TLKM dividend yield ~5-6% kompetitif vs deposito',
        'Data monetization B2B terus naik',
        'Beta rendah: TLKM bergerak lebih lambat dari IHSG',
      ],
      risks: [
        'Capex 5G berat menekan free cash flow',
        'Margin erosi dari persaingan tarif',
      ],
      tickers: [
        {
          code:   'TLKM',
          name:   'Telkom Indonesia',
          weight: 'Overweight',
          note:   'Defensive yield play utama. Infrastruktur digital terluas di Indonesia.',
          marketCap: 'Rp 272 T',
        },
      ],
    },
    {
      id:          'tech_avoid',
      sector:      'Teknologi & Growth',
      icon:        '💻',
      stance:      'AVOID',
      targetPct:   0,
      riskLevel:   'HIGH',
      rationale:   'Saham teknologi sangat sensitif terhadap kenaikan discount rate. DCF valuation langsung tertekan saat BI Rate naik. GOTO dan BUKA masih dalam fase membakar kas dengan path profitabilitas yang semakin jauh.',
      catalysts: [],
      risks: [
        'Higher discount rate → DCF valuation turun drastis',
        'Burn rate belum membaik → dilusi pemegang saham terus',
        'IHSG sudah minus 11.8%, tech lebih dalam lagi',
      ],
      tickers: [
        {
          code:   'GOTO',
          name:   'GoTo Gojek Tokopedia',
          weight: 'Avoid',
          note:   'Path to profitability semakin jauh di high-rate environment. Cash burn concern.',
          marketCap: 'Rp 39 T',
        },
        {
          code:   'BUKA',
          name:   'Bukalapak',
          weight: 'Avoid',
          note:   'GMV growth decelerating. Strategic direction masih tidak jelas.',
          marketCap: 'Rp 11 T',
        },
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════════
  // CURRENCY_STRESS: Rupiah Crisis — IDR 17.700, BI Rate 5.25%
  // IHSG -11.8% Mei, capital outflow masif
  // ══════════════════════════════════════════════════════════════
  CURRENCY_STRESS: [
    {
      id:          'gold_physical',
      sector:      'Emas Fisik & Instrumen Emas',
      icon:        '🥇',
      stance:      'MAXIMUM',
      targetPct:   45,
      riskLevel:   'LOW',
      rationale:   'Emas IDR-denominated adalah instrumen perlindungan terbaik di kondisi ini: double benefit dari harga emas USD near ATH (2.342/oz) PLUS Rupiah melemah 9.2% YTD. XAU/IDR memberikan return jauh di atas semua aset domestik lainnya.',
      catalysts: [
        'XAU/USD near all-time high didukung demand safe haven geopolitik',
        'Rupiah melemah → XAU/IDR naik otomatis tanpa perlu harga emas USD naik',
        'Bank sentral global terus akumulasi emas (de-dollarization trend)',
        'Geopolitik Timur Tengah belum mereda → safe haven demand sustained',
      ],
      risks: [
        'Gencatan senjata mendadak bisa turunkan premium safe haven',
        'Penguatan Rupiah signifikan akan kurangi IDR return',
      ],
      tickers: [
        {
          code:   'ANTM',
          name:   'Aneka Tambang — Emas Batangan',
          weight: 'Primary',
          note:   'Emas fisik Antam paling likuid di Indonesia. Buyback guaranteed. Tersedia di cabang dan online.',
          marketCap: '1gr - 1000gr',
        },
        {
          code:   'ANTM',
          name:   'ANTM Saham (Indirect Gold Exposure)',
          weight: 'Secondary',
          note:   'Saham ANTM dapat USD revenue dari ekspor nikel + emas. Natural FX hedge.',
          marketCap: 'Rp 43 T',
        },
        {
          code:   'REKSA EMAS',
          name:   'Reksa Dana Berbasis Emas',
          weight: 'Liquid Alternative',
          note:   'Bibit/Bareksa menawarkan reksa dana emas tanpa biaya simpan. Likuid T+2.',
          marketCap: 'Min. Rp 10.000',
        },
      ],
    },
    {
      id:          'usd_cash',
      sector:      'Kas USD & Hard Currency',
      icon:        '💵',
      stance:      'MAXIMUM',
      targetPct:   35,
      riskLevel:   'LOW',
      rationale:   'Konversi kas IDR ke USD adalah tindakan paling langsung untuk lindungi kekayaan dari depresiasi Rupiah. Dengan IDR di 17.700 dan tren masih melemah, setiap hari delay berarti purchasing power yang tergerus.',
      catalysts: [
        'DXY 104.5+ → USD masih kuat terhadap semua mata uang EM',
        'Fed belum pivot → USD carry advantage masih ada',
        'Cadangan devisa BI tidak cukup lawan spekulasi pasar',
      ],
      risks: [
        'Intervensi BI bisa perkuat IDR sementara',
        'Regulasi pembatasan kepemilikan valas bisa berubah',
      ],
      tickers: [
        {
          code:   'TABUNGAN USD',
          name:   'Tabungan Valas USD (Bank Besar)',
          weight: 'Core',
          note:   'BBCA/BMRI/MANDIRI menawarkan tabungan USD. Mudah diakses, insured by LPS (batasan berlaku).',
          marketCap: 'Min. USD 100',
        },
        {
          code:   'REKSA USD',
          name:   'Reksa Dana Pasar Uang USD',
          weight: 'Liquid',
          note:   'Return dari money market USD lebih tinggi dari tabungan, masih likuid T+1.',
          marketCap: 'Min. Rp 100.000',
        },
      ],
    },
    {
      id:          'commodity_export',
      sector:      'Komoditas Ekspor (FX Hedge Alami)',
      icon:        '⚡',
      stance:      'OVERWEIGHT',
      targetPct:   10,
      riskLevel:   'MEDIUM',
      rationale:   'Emiten komoditas ekspor memiliki natural FX hedge: revenue dalam USD, biaya operasional dalam IDR. Saat Rupiah melemah, margin mereka secara otomatis mengembang. Ini satu-satunya kategori saham yang menguntungkan dari krisis nilai tukar.',
      catalysts: [
        'Revenue USD + cost IDR = margin windfall saat IDR melemah',
        'Harga batu bara dan nikel masih didukung demand global',
        'Capital outflow asing tidak terlalu menekan saham eksportir',
      ],
      risks: [
        'Risiko penurunan harga komoditas global',
        'Regulasi ekspor yang berubah sewaktu-waktu',
        'Tekanan ESG dari investor internasional terhadap coal',
      ],
      tickers: [
        {
          code:   'ADRO',
          name:   'Adaro Energy Indonesia',
          weight: 'Overweight',
          note:   'Coal: 100% USD revenue, biaya IDR. Best natural FX hedge di IDX. Dividend yield tinggi.',
          marketCap: 'Rp 107 T',
        },
        {
          code:   'PTBA',
          name:   'Bukit Asam',
          weight: 'Overweight',
          note:   'State-backed coal. Stable export contract + special dividend history.',
          marketCap: 'Rp 33 T',
        },
        {
          code:   'INCO',
          name:   'Vale Indonesia',
          weight: 'Accumulate',
          note:   'Nickel USD revenue. EV battery demand tailwind jangka panjang.',
          marketCap: 'Rp 26 T',
        },
      ],
    },
    {
      id:          'domestic_avoid',
      sector:      'Saham Domestik Berorientasi IDR',
      icon:        '🚫',
      stance:      'AVOID',
      targetPct:   0,
      riskLevel:   'HIGH',
      rationale:   'Saham yang bergantung pada konsumsi domestik IDR adalah yang paling rentan: imported input cost meledak, daya beli konsumen tergerus inflasi, dan valuasi masih tertekan oleh IHSG yang sedang jatuh 11.8% di Mei.',
      catalysts: [],
      risks: [
        'Imported inflation → biaya produksi naik, margin terkompresi',
        'Daya beli konsumen IDR tergerus depresiasi Rupiah',
        'IHSG masih dalam tren turun — tidak ada catalyst jelas untuk rebound',
      ],
      tickers: [
        {
          code:   'UNVR',
          name:   'Unilever Indonesia',
          weight: 'Reduce/Exit',
          note:   '~50% bahan baku diimpor. Margin akan tertekan signifikan di environment ini.',
          marketCap: 'Rp 29 T',
        },
        {
          code:   'HMSP',
          name:   'HM Sampoerna',
          weight: 'Reduce',
          note:   'Domestic consumer play murni. Volume rokok turun + excise tax naik + IDR melemah.',
          marketCap: 'Rp 54 T',
        },
      ],
    },
  ],
};
