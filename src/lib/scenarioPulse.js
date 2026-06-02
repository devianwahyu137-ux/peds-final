// src/lib/scenarioPulse.js
// Scenario transition orchestrator — zero external dependencies

export const SCENARIO_CONFIG = {
  EQUILIBRIUM: {
    id:          'EQUILIBRIUM',
    label:       'Ekspansi Normal',
    labelShort:  'EQUILIBRIUM',
    riskLevel:   'RISIKO RENDAH',
    riskBadge:   'AMAN',
    color:       '#10b981',
    colorDim:    'rgba(16,185,129,0.12)',
    colorGlow:   'rgba(16,185,129,0.25)',
    colorBorder: 'rgba(16,185,129,0.30)',
    briefing: {
      title:    'Skenario: Ekspansi Normal',
      summary:  'Kondisi makroekonomi stabil. BI Rate terkendali, inflasi rendah, Rupiah kuat.',
      action:   'Pertahankan portofolio seimbang. Saham dan obligasi memberikan return optimal.',
      signal:   'HIJAU — Tidak ada aksi defensif diperlukan.',
      signalColor: '#10b981',
    },
    cssVar: '--accent-color: #10b981;',
  },
  TIGHTENING: {
    id:          'TIGHTENING',
    label:       'Pengetatan Moneter',
    labelShort:  'TIGHTENING',
    riskLevel:   'RISIKO SEDANG',
    riskBadge:   'WASPADA',
    color:       '#f59e0b',
    colorDim:    'rgba(245,158,11,0.12)',
    colorGlow:   'rgba(245,158,11,0.22)',
    colorBorder: 'rgba(245,158,11,0.30)',
    briefing: {
      title:    'Skenario: Pengetatan Moneter',
      summary:  'BI Rate naik signifikan. Biaya pinjaman mahal. Tekanan pada ekuitas dan margin korporasi.',
      action:   'Rotasi ke obligasi negara (ORI/SR). Kurangi eksposur saham berisiko tinggi.',
      signal:   'KUNING — Mulai rotasi defensif secara bertahap.',
      signalColor: '#f59e0b',
    },
    cssVar: '--accent-color: #f59e0b;',
  },
  CURRENCY_STRESS: {
    id:          'CURRENCY_STRESS',
    label:       'Krisis Nilai Tukar',
    labelShort:  'CURRENCY STRESS',
    riskLevel:   'RISIKO TINGGI',
    riskBadge:   'KRISIS',
    color:       '#ef4444',
    colorDim:    'rgba(239,68,68,0.12)',
    colorGlow:   'rgba(239,68,68,0.22)',
    colorBorder: 'rgba(239,68,68,0.30)',
    briefing: {
      title:    'Skenario: Krisis Nilai Tukar',
      summary:  'Rupiah melemah tajam. Capital outflow. Risiko inflasi impor sangat tinggi.',
      action:   'Segera pindah ke emas fisik dan kas USD. Minimalkan aset IDR.',
      signal:   'MERAH — Aksi proteksi kekayaan diperlukan sekarang.',
      signalColor: '#ef4444',
    },
    cssVar: '--accent-color: #ef4444;',
  },
  HIPERINFLASI: {
    id:          'HIPERINFLASI',
    label:       'Hiperinflasi',
    labelShort:  'HIPERINFLASI',
    riskLevel:   'RISIKO EKSTREM',
    riskBadge:   'DARURAT',
    color:       '#ef4444',
    colorDim:    'rgba(239,68,68,0.12)',
    colorGlow:   'rgba(239,68,68,0.22)',
    colorBorder: 'rgba(239,68,68,0.30)',
    briefing: {
      title:    'Skenario: Hiperinflasi Ekstrem',
      summary:  'Inflasi melonjak tajam ke 15.5%, BI Rate terpaksa ditarik ke 12.00%, daya beli anjlok tajam.',
      action:   'Lari ke aset riil dan lindung nilai (Emas 60%). Hindari aset tunai rupiah secara drastis.',
      signal:   'MERAH TUA — Ancaman hiperinflasi. Segera beralih ke lindung nilai kuat.',
      signalColor: '#ef4444',
    },
    cssVar: '--accent-color: #ef4444;',
  },
  RUPIAH_CRASH: {
    id:          'RUPIAH_CRASH',
    label:       'Rupiah Crash',
    labelShort:  'RUPIAH CRASH',
    riskLevel:   'RISIKO EKSTREM',
    riskBadge:   'DARURAT',
    color:       '#f59e0b',
    colorDim:    'rgba(245,158,11,0.12)',
    colorGlow:   'rgba(245,158,11,0.22)',
    colorBorder: 'rgba(245,158,11,0.30)',
    briefing: {
      title:    'Skenario: Keruntuhan Nilai Tukar',
      summary:  'USD/IDR meroket tajam menembus 21.000, DXY kokoh di 115.00. Krisis depresiasi akut yang menekan kapitalisasi pasar domestik.',
      action:   'Kunci aset di valuta asing dan emas. Ekuitas domestik sangat rentan terhadap beban impor operasional.',
      signal:   'ORANYE TUA — Menyelamatkan aset ke valuta keras secepatnya.',
      signalColor: '#f59e0b',
    },
    cssVar: '--accent-color: #f59e0b;',
  },
};

// Hook: returns previous scenario for transition detection
export function usePreviousScenario(current) {
  const ref = { current: null };
  const prev = ref.current;
  ref.current = current;
  return prev;
}
