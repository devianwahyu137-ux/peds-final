import { useRootStore } from "@/stores/rootStore";
import { ACCENT, ASSET_CONFIG } from "../components/SharedComponents";

// ── Narasi Bahasa Indonesia per skenario ────────────────────────────────────────

const SCENARIO_NARRATIVE = {
  EQUILIBRIUM: {
    headline: "Kondisi Pasar: Ekspansi Normal",
    body: "Ekonomi Indonesia dalam kondisi sehat. Suku bunga stabil, inflasi terkendali, dan Rupiah tidak menunjukkan tekanan berarti. Ini adalah waktu yang baik untuk mempertahankan portofolio yang seimbang antara saham dan obligasi.",
    advice: "Pertahankan alokasi saham untuk pertumbuhan, dukung dengan obligasi pemerintah sebagai penyeimbang.",
    riskLabel: "RISIKO RENDAH",
    color: "#10b981",
  },
  TIGHTENING: {
    headline: "Kondisi Pasar: Pengetatan Moneter",
    body: "Bank Indonesia menaikkan suku bunga untuk mengendalikan inflasi. Ini menekan harga saham tetapi menguntungkan obligasi dan deposito. Pertimbangkan untuk mengurangi eksposur ke saham berisiko tinggi.",
    advice: "Rotasi ke obligasi negara (ORI/SR) untuk mengunci yield tinggi sebelum suku bunga turun lagi.",
    riskLabel: "RISIKO SEDANG",
    color: "#f59e0b",
  },
  CURRENCY_STRESS: {
    headline: "Kondisi Pasar: Tekanan Nilai Tukar",
    body: "Rupiah mengalami pelemahan signifikan. Aset yang aman dalam kondisi ini adalah emas fisik dan kas dalam USD. Hindari aset IDR dalam jumlah besar hingga situasi mereda.",
    advice: "Prioritaskan emas fisik dan kas USD sebagai benteng kekayaan dari depresiasi Rupiah.",
    riskLabel: "RISIKO TINGGI",
    color: "#ef4444",
  },
};

const QUICK_SIGNALS = [
  { key: "biRate",  label: "BI Rate",   unit: "%",   icon: "🏦" },
  { key: "cpi",     label: "Inflasi",   unit: "%",   icon: "📊" },
  { key: "usdIdr",  label: "USD/IDR",   unit: "",    icon: "💱" },
  { key: "dxy",     label: "DXY Index", unit: "",    icon: "💵" },
];

const ASSET_BARS = [
  { key: "stocks", label: "Saham (IDX)",    icon: "📈", color: "#3b82f6" },
  { key: "bonds",  label: "Obligasi (SBN)", icon: "🏛️", color: "#a78bfa" },
  { key: "gold",   label: "Emas Fisik",     icon: "🥇", color: "#fbbf24" },
  { key: "cash",   label: "Kas / USD",      icon: "💵", color: "#34d399" },
];

export default function HomePage() {
  const scenarioId     = useRootStore((s) => s.scenarioId);
  const crisisMode     = useRootStore((s) => s.crisisMode);
  const targetWeights  = useRootStore((s) => s.targetWeights || s.weights);
  const targetAnalytics = useRootStore((s) => s.targetAnalytics || s.analytics);
  const macroInputs    = useRootStore((s) => s.macroInputs);
  
  const liveData       = useRootStore((s) => s.liveData || {});
  const endpointStatus = useRootStore((s) => s.endpointStatus || {});
  
  const setTab         = useRootStore((s) => s.setTab);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const narrative = SCENARIO_NARRATIVE[effectiveScenario] || SCENARIO_NARRATIVE.EQUILIBRIUM;
  const accent = narrative.color;

  // Sharpe from store analytics — NEVER hardcoded
  const sharpeRatio = targetAnalytics?.sharpeRatio ?? targetAnalytics?.sharpe ?? 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-enter">

      {/* ── ZONA 1: SITUASI HARI INI ── */}
      <div
        className="rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${accent}08)`,
          borderColor: `${accent}30`,
          boxShadow: `0 0 40px ${accent}10`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-2 py-1 rounded-md mb-3"
              style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
            >
              {narrative.riskLabel}
            </span>
            <h2 className="text-xl font-black font-mono text-white mb-2">
              {narrative.headline}
            </h2>
            <p className="text-sm font-mono text-neutral-400 leading-relaxed max-w-2xl">
              {narrative.body}
            </p>
          </div>
          <div
            className="flex-shrink-0 text-right p-4 rounded-xl"
            style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
          >
            <div className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-1">
              Sharpe Ratio
            </div>
            <div
              className="text-3xl font-black font-mono tabular-nums"
              style={{ color: accent }}
            >
              {sharpeRatio.toFixed(2)}
            </div>
            <div className="text-[9px] font-mono text-neutral-600 mt-1">
              skor efisiensi portofolio
            </div>
          </div>
        </div>
      </div>

      {/* ── ZONA 2: REKOMENDASI UTAMA ── */}
      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-950/80 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase mb-1">
              💡 Rekomendasi Alokasi Saat Ini
            </div>
            <p className="text-xs font-mono text-neutral-400">
              {narrative.advice}
            </p>
          </div>
          <button
            onClick={() => setTab("portfolio")}
            className="flex-shrink-0 text-[9px] font-mono px-3 py-1.5 rounded-lg border
                       border-neutral-700/60 text-neutral-400 hover:border-neutral-600
                       hover:text-neutral-300 transition-colors duration-150 cursor-pointer"
          >
            Lihat Detail MPT →
          </button>
        </div>

        <div className="space-y-3">
          {ASSET_BARS.map(({ key, label, icon, color }) => {
            const pct = targetWeights?.[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-base w-6 flex-shrink-0">{icon}</span>
                <span className="text-[10px] font-mono text-neutral-400 w-28 flex-shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-2 bg-neutral-800/70 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                      boxShadow: `0 0 6px ${color}66`,
                    }}
                  />
                </div>
                <span
                  className="text-sm font-black font-mono tabular-nums w-10 text-right flex-shrink-0"
                  style={{ color }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ZONA 3: SINYAL PASAR CEPAT ── */}
      <div>
        <div className="text-[9px] font-mono tracking-[0.2em] text-neutral-600 uppercase mb-3">
          Sinyal Pasar Terkini
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_SIGNALS.map(({ key, label, unit, icon }) => {
            // Resolve value: prefer liveData, fall back to macroInputs
            const liveValue = liveData[key];
            let rawVal;
            if (typeof liveValue === "object" && liveValue !== null) {
              rawVal = liveValue.v ?? liveValue.value ?? macroInputs?.[key];
            } else if (typeof liveValue === "number") {
              rawVal = liveValue;
            } else {
              rawVal = macroInputs?.[key];
            }

            const display = rawVal != null
              ? `${Number(rawVal).toLocaleString("id-ID", { maximumFractionDigits: 2 })}${unit}`
              : "—";

            const status = endpointStatus[key];
            const isLive = status === "ok";

            return (
              <div
                key={key}
                className="rounded-xl border border-neutral-800/50 bg-neutral-950/70 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base">{icon}</span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md ${
                      isLive
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-neutral-800 text-neutral-600"
                    }`}
                  >
                    {isLive ? "LIVE" : "EST"}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">
                  {label}
                </div>
                <div className="text-lg font-black font-mono text-white tabular-nums">
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="text-[8px] font-mono text-neutral-700 text-center leading-relaxed pb-4">
        Platform ini adalah simulasi edukasi berbasis MPT. Bukan rekomendasi investasi resmi.
        Selalu konsultasikan keputusan investasi dengan advisor keuangan terdaftar OJK.
      </div>
    </div>
  );
}
