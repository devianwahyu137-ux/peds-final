// src/components/MacroInterpretationPanel/index.jsx
// Contextual interpretation of current macro readings
// Explains what the numbers mean in plain Indonesian

import { useRootStore } from '@/stores/rootStore';
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";

const MACRO_INTERPRETATION = {
  EQUILIBRIUM: [
    {
      icon: <TrendingUp size={16} className="text-emerald-400" />,
      title: 'Fase Pra-Krisis (Referensi 2025)',
      body: 'Kondisi ini mencerminkan stabilitas ekonomi Indonesia di semester II 2025 ketika BI Rate berada di 4.75% — level terendah sejak 2022. Pertumbuhan kredit perbankan sehat, inflasi terkendali di sasaran 2.5±1%.',
    },
    {
      icon: <Landmark size={16} className="text-indigo-400" />,
      title: 'SBN Masih Kompetitif',
      body: 'Spread SBN vs UST di atas 200bps memberikan daya tarik bagi investor asing. Risiko capital outflow terbatas selama DXY stabil di bawah 105 dan geopolitik tidak eskalasi.',
    },
    {
      icon: <Wallet size={16} className="text-emerald-400" />,
      title: 'Rupiah Dalam Zona Aman',
      body: 'USD/IDR di bawah 16.000 mengindikasikan tekanan eksternal terkendali. Cadangan devisa BI tercatat USD 148.2 miliar — cukup untuk 6+ bulan impor sebagai buffer stabilisasi.',
    },
  ],
  TIGHTENING: [
    {
      icon: <AlertTriangle size={16} className="text-amber-500" />,
      get title() {
        const t = useRootStore.getState().macro;
        return `Kenaikan BI Rate ke ${(t?.biRate ?? 5.50).toFixed(2)}% (Juni 2026)`;
      },
      get body() {
        const t = useRootStore.getState().macro;
        return `BI Rate ${(t?.biRate ?? 5.50).toFixed(2)}% berarti cost of capital korporasi naik minimal 50-75bps, menekan earning growth IHSG sekitar 8-12% year-forward. Investor ritel disarankan membatasi eksposur pada emiten dengan leverage tinggi (Debt-to-Equity Ratio > 1.2x) dan beralih ke sektor yang memiliki cadangan kas kuat.`;
      },
    },
    {
      icon: <Landmark size={16} className="text-indigo-400" />,
      get title() {
        const t = useRootStore.getState().macro;
        return `Rotasi Yield SBN 10Y ke Level ${(t?.sbn10y ?? 6.78).toFixed(2)}%`;
      },
      get body() {
        const t = useRootStore.getState().macro;
        return `Kenaikan yield ke ${(t?.sbn10y ?? 6.78).toFixed(2)}% menekan harga obligasi tenor panjang (potensi capital loss > 5-8%). Ritel sebaiknya merotasi portofolio fixed-income ke instrumen tenor pendek (SR/ORI 3 tahun) untuk mengunci yield tinggi sekaligus meminimalisir risiko durasi.`;
      },
    },
    {
      icon: <TrendingDown size={16} className="text-red-400" />,
      get title() {
        return 'Konsolidasi IHSG di Level 5.500-6.000';
      },
      get body() {
        const t = useRootStore.getState().macro;
        return `Setelah anjlok -11.8% di Mei, IHSG berkonsolidasi di rentang 5.500-6.000 (saat ini ${t.ihsg.toLocaleString('id-ID')}). Alokasikan 25-30% porsi saham ke sektor defensif seperti konsumer primer dengan Dividend Yield minimal 5-7% untuk mengamankan arus kas pasif di tengah perlambatan pasar.`;
      },
    },
  ],
  CURRENCY_STRESS: [
    {
      icon: <AlertTriangle size={16} className="text-amber-500" />,
      title: 'Rupiah Mendekati Level Kritis (17.700-17.879)',
      body: 'USD/IDR mendekati 17.879 — telemah dalam sejarah. Rupiah melemah 9.23% dalam 12 bulan dan 6.4% YTD. Rantai pasok global terganggu akibat penutupan Selat Hormuz → lonjakan harga minyak → imported inflation spiral.',
    },
    {
      icon: <Coins size={16} className="text-amber-400" />,
      title: 'Emas IDR Capai Rekor Ganda',
      body: 'XAU/IDR memberikan return luar biasa: harga emas USD near all-time high di USD 2.342 PLUS Rupiah melemah 9%+ = double-digit positive return dalam IDR. Ini adalah instrumen terbaik di kondisi krisis nilai tukar.',
    },
    {
      icon: <Wallet size={16} className="text-emerald-400" />,
      title: 'Dollarisasi Parsial — Strategi Bertahan',
      body: 'Konversi 30-35% aset likuid ke USD melalui tabungan valas atau reksa dana pasar uang berbasis USD. Capital outflow dari EM berlanjut selama ketidakpastian geopolitik dan USD strength persists.',
    },
  ],
};

export function MacroInterpretationPanel() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const points     = MACRO_INTERPRETATION[scenarioId] ?? MACRO_INTERPRETATION.EQUILIBRIUM;

  return (
    <div className="card-tier-1">
      <div className="mb-6">
        <div className="text-[9px] font-sans tracking-[0.25em] uppercase mb-2"
             style={{ color: 'var(--as-text-dim)' }}>
          INTERPRETASI MAKRO
        </div>
        <h2 className="text-lg font-bold font-sans"
            style={{ color: 'var(--as-text-primary)' }}>
          Implikasi Kondisi Saat Ini
        </h2>
      </div>

      <div className="space-y-5">
        {points.map((pt, i) => (
          <div key={i} className="card-tier-3 flex gap-4">
            <span className="text-xl flex-shrink-0 mt-0.5">{pt.icon}</span>
            <div className="min-w-0">
              <div className="text-sm font-bold font-sans text-[var(--as-text-primary)] mb-2">
                {pt.title}
              </div>
              <div className="text-xs font-sans text-[var(--as-text-secondary)] leading-relaxed">
                {pt.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
