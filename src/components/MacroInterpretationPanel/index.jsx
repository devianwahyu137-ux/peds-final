// src/components/MacroInterpretationPanel/index.jsx
// Contextual interpretation of current macro readings
// Explains what the numbers mean in plain Indonesian

import { useRootStore } from '@/stores/rootStore';

const MACRO_INTERPRETATION = {
  EQUILIBRIUM: [
    {
      icon: '📈',
      title: 'Siklus Kredit Ekspansif',
      body: 'BI Rate di level netral mendorong pertumbuhan kredit. Perbankan besar (BBCA, BMRI) cenderung mencatat pertumbuhan NIM yang sehat. Saham sektor keuangan menjadi favorit institusional.',
    },
    {
      icon: '🏛️',
      title: 'Obligasi Negara Tetap Menarik',
      body: 'Spread SBN terhadap US Treasury di level 2%+ masih memberikan daya tarik bagi investor asing. Risiko capital outflow terbatas selama DXY tidak melampaui 105.',
    },
    {
      icon: '💰',
      title: 'Rupiah Dalam Zona Nyaman',
      body: 'USD/IDR di bawah 16.000 mengindikasikan tekanan eksternal terkendali. Cadangan devisa BI memadai untuk meredam volatilitas mendadak.',
    },
  ],
  TIGHTENING: [
    {
      icon: '⚠️',
      title: 'Pengetatan Berdampak ke Ekuitas',
      body: 'Kenaikan BI Rate menekan valuasi saham melalui dua jalur: biaya utang korporasi naik dan discount rate DCF meningkat. Sektor properti dan teknologi paling rentan.',
    },
    {
      icon: '🏦',
      title: 'Peluang di Surat Berharga Negara',
      body: 'Yield SBN 10Y yang naik menciptakan entry point menarik untuk investor jangka menengah. ORI dan SR menjadi instrumen defensif optimal untuk portfolio retail.',
    },
    {
      icon: '📉',
      title: 'Waspadai Tekanan Capital Outflow',
      body: 'Diferensial suku bunga yang menyempit antara Indonesia dan AS mendorong repatriasi modal asing. Perhatikan data kepemilikan asing di SBN setiap minggu.',
    },
  ],
  CURRENCY_STRESS: [
    {
      icon: '🚨',
      title: 'Rupiah Dalam Tekanan Ekstrem',
      body: 'Depresiasi IDR di atas 8% YTD adalah sinyal bahaya. Inflasi impor akan melonjak dalam 2-3 bulan ke depan, memperburuk daya beli domestik secara signifikan.',
    },
    {
      icon: '🥇',
      title: 'Emas Sebagai Perisai Utama',
      body: 'Dalam krisis nilai tukar, emas IDR-denominated secara historis memberikan imbal hasil positif 15-30%. Ini adalah satu-satunya aset yang melindungi kekayaan riil secara efektif.',
    },
    {
      icon: '💵',
      title: 'Strategi Dollarisasi Parsial',
      body: 'Konversi 25-35% aset likuid ke USD atau instrumen berbasis valas adalah langkah prudent. Hindari aset domestik yang sangat sensitif terhadap nilai tukar.',
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
