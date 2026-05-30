// src/components/MacroInterpretationPanel/index.jsx
// Contextual interpretation of current macro readings
// Explains what the numbers mean in plain Indonesian

import { useRootStore } from '@/stores/rootStore';

const MACRO_INTERPRETATION = {
  EQUILIBRIUM: [
    {
      icon: '📈',
      title: 'Fase Pra-Krisis (Referensi 2025)',
      body: 'Kondisi ini mencerminkan stabilitas ekonomi Indonesia di semester II 2025 ketika BI Rate berada di 4.75% — level terendah sejak 2022. Pertumbuhan kredit perbankan sehat, inflasi terkendali di sasaran 2.5±1%.',
    },
    {
      icon: '🏛️',
      title: 'SBN Masih Kompetitif',
      body: 'Spread SBN vs UST di atas 200bps memberikan daya tarik bagi investor asing. Risiko capital outflow terbatas selama DXY stabil di bawah 105 dan geopolitik tidak eskalasi.',
    },
    {
      icon: '💰',
      title: 'Rupiah Dalam Zona Aman',
      body: 'USD/IDR di bawah 16.000 mengindikasikan tekanan eksternal terkendali. Cadangan devisa BI tercatat USD 148.2 miliar — cukup untuk 6+ bulan impor sebagai buffer stabilisasi.',
    },
  ],
  TIGHTENING: [
    {
      icon: '⚠️',
      title: 'BI Naikkan Rate ke 5.25% (Mei 2026)',
      body: 'RDG Bank Indonesia 19-20 Mei 2026 menaikkan BI Rate 50bps menjadi 5.25% — langkah pre-emptive menghadapi gejolak global akibat konflik Timur Tengah. Biaya modal korporasi naik, tekanan pada margin perbankan.',
    },
    {
      icon: '🏦',
      title: 'Rotasi ke SBN Jangka Pendek',
      body: 'Yield SBN 10Y sideways di 6.71%. Strategi optimal: fokus tenor pendek (SR/ORI 3 tahun) untuk meminimalkan duration risk sambil lock-in yield di atas BI Rate. Hindari tenor panjang.',
    },
    {
      icon: '📉',
      title: 'IHSG Koreksi Terburuk 26 Tahun di Mei',
      body: 'IHSG turun 11.8% di bulan Mei 2026 — koreksi bulanan terburuk sejak Mei 2000. Investor asing net sell besar. Saham domestik dalam tekanan ganda: cost of capital naik + earning outlook turun.',
    },
  ],
  CURRENCY_STRESS: [
    {
      icon: '🚨',
      title: 'Rupiah Mendekati Level Kritis (17.700-17.879)',
      body: 'USD/IDR mendekati 17.879 — telemah dalam sejarah. Rupiah melemah 9.23% dalam 12 bulan dan 6.4% YTD. Rantai pasok global terganggu akibat penutupan Selat Hormuz → lonjakan harga minyak → imported inflation spiral.',
    },
    {
      icon: '🥇',
      title: 'Emas IDR Capai Rekor Ganda',
      body: 'XAU/IDR memberikan return luar biasa: harga emas USD near all-time high di USD 2.342 PLUS Rupiah melemah 9%+ = double-digit positive return dalam IDR. Ini adalah instrumen terbaik di kondisi krisis nilai tukar.',
    },
    {
      icon: '💵',
      title: 'Dollarisasi Parsial — Strategi Bertahan',
      body: 'Konversi 30-35% aset likuid ke USD melalui tabungan valas atau reksa dana pasar uang berbasis USD. Capital outflow dari EM berlanjut selama ketidakpastian geopolitik dan USD strength persists.',
    },
  ],
};

export function MacroInterpretationPanel() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const points     = MACRO_INTERPRETATION[scenarioId] ?? MACRO_INTERPRETATION.EQUILIBRIUM;

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div>
        <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
          Interpretasi Makro
        </div>
        <div className="text-[10px] text-neutral-600 font-mono mt-0.5">
          Implikasi Kondisi Saat Ini
        </div>
      </div>

      <div className="space-y-3">
        {points.map((pt, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg border border-neutral-800/40 bg-neutral-900/30">
            <span className="text-lg flex-shrink-0 mt-0.5">{pt.icon}</span>
            <div className="min-w-0">
              <div className="text-xs font-bold font-mono text-white mb-1">
                {pt.title}
              </div>
              <div className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                {pt.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
