import { useRootStore } from "@/stores/rootStore";
import { SENTIMENT_AGGREGATE, OVERALL_STYLE } from "../components/MacroSentimentSummary";

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

const QUICK_SIGNALS_CONFIG = [
  {
    key:       'biRate',
    label:     'BI Rate',
    unit:      '%',
    icon:      '🏦',
    getValue:  (ld) => ld?.bi_macro?.biRate ?? ld?.bi_macro?.v ?? ld?.biRate?.v ?? null,
  },
  {
    key:       'cpi',
    label:     'Inflasi',
    unit:      '%',
    icon:      '📊',
    getValue:  (ld) => ld?.bi_macro?.cpi ?? ld?.cpi?.v ?? null,
  },
  {
    key:       'usdIdr',
    label:     'USD/IDR',
    unit:      '',
    icon:      '💱',
    getValue:  (ld) => ld?.usdIdr?.v ?? (typeof ld?.usdIdr === 'number' ? ld.usdIdr : null),
  },
  {
    key:       'dxy',
    label:     'DXY Index',
    unit:      ' pts',
    icon:      '💵',
    getValue:  (ld) => ld?.dxy?.v ?? (typeof ld?.dxy === 'number' ? ld.dxy : null),
  },
];

const SCENARIO_MACRO_FALLBACK = {
  EQUILIBRIUM:     { biRate: 5.50, cpi: 2.8, usdIdr: 15850, dxy: 101.2 },
  TIGHTENING:      { biRate: 6.75, cpi: 4.2, usdIdr: 16250, dxy: 104.5 },
  CURRENCY_STRESS: { biRate: 7.50, cpi: 5.8, usdIdr: 17150, dxy: 106.8 },
};

const ASSET_BARS = [
  { key: "stocks", label: "Saham (IDX)",    icon: "📈", color: "#3b82f6" },
  { key: "bonds",  label: "Obligasi (SBN)", icon: "🏛️", color: "#a78bfa" },
  { key: "gold",   label: "Emas Fisik",     icon: "🥇", color: "#fbbf24" },
  { key: "cash",   label: "Kas / USD",      icon: "💵", color: "#34d399" },
];

export default function HomePage() {
  const scenarioId      = useRootStore((s) => s.scenarioId);
  const crisisMode      = useRootStore((s) => s.crisisMode);
  const targetWeights   = useRootStore((s) => s.targetWeights || s.weights);
  const actualWeights   = useRootStore((s) => s.actualWeights || s.weights);
  const targetAnalytics = useRootStore((s) => s.targetAnalytics || s.analytics);
  const macroInputs     = useRootStore((s) => s.macroInputs);
  const liveData        = useRootStore((s) => s.liveData || {});
  const setTab          = useRootStore((s) => s.setActiveTab);

  const effectiveScenario = crisisMode ? "CURRENCY_STRESS" : scenarioId;
  const narrative = SCENARIO_NARRATIVE[effectiveScenario] || SCENARIO_NARRATIVE.EQUILIBRIUM;
  const accent = narrative.color;

  // Sharpe from store analytics — NEVER hardcoded
  const sharpeRatio = targetAnalytics?.sharpeRatio ?? targetAnalytics?.sharpe ?? 0;

  // ── SENTIMENT BIAS ──
  const sentimentData = SENTIMENT_AGGREGATE[effectiveScenario] ?? SENTIMENT_AGGREGATE.EQUILIBRIUM;
  const sentimentStyle = OVERALL_STYLE[sentimentData.overall] ?? OVERALL_STYLE.CAUTIOUS;

  // ── DRIFT CALCULATION ──
  const maxDrift = Math.max(
    Math.abs((actualWeights?.stocks ?? 0) - (targetWeights?.stocks ?? 0)),
    Math.abs((actualWeights?.bonds ?? 0) - (targetWeights?.bonds ?? 0)),
    Math.abs((actualWeights?.gold ?? 0) - (targetWeights?.gold ?? 0)),
    Math.abs((actualWeights?.cash ?? 0) - (targetWeights?.cash ?? 0))
  );

  const isDriftWarning = maxDrift > 5;

  // ── GLOBAL PULSE TICKER ──
  const pulseItems = [
    {
      label: 'IHSG',
      value: (liveData?.ihsg?.v ?? 7100).toLocaleString('id-ID'),
      delta: '+1.2%',
      isConstructive: true,
    },
    {
      label: 'SBN 10Y',
      value: `${Number(liveData?.sbn_yields?.v ?? macroInputs?.sbn10y ?? 6.60).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
      delta: '-0.05',
      isConstructive: true,
    },
    {
      label: 'USD/IDR',
      value: (liveData?.usdIdr?.v ?? macroInputs?.usdIdr ?? 15950).toLocaleString('id-ID'),
      delta: '+0.1%',
      isConstructive: false,
    },
    {
      label: 'GOLD',
      value: `$${(liveData?.xauUsd?.v ?? 2342).toLocaleString('id-ID')}`,
      delta: '+1.15%',
      isConstructive: true,
    },
  ];

  return (
    <div className="space-y-6 w-full page-enter">

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
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-2 py-1 rounded-md"
                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
              >
                {narrative.riskLabel}
              </span>
              <span
                className="inline-block text-[9px] font-mono font-bold tracking-[0.2em] uppercase px-2 py-1 rounded-md"
                style={{ background: sentimentStyle.bg, color: sentimentStyle.color, border: `1px solid ${sentimentStyle.color}40`, boxShadow: `0 0 10px ${sentimentStyle.color}20` }}
              >
                BIAS: {sentimentData.overall}
              </span>
            </div>
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
            onClick={() => setTab?.("portfolio")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_SIGNALS_CONFIG.map(({ key, label, unit, icon, getValue }) => {
            const liveVal  = getValue(liveData);
            const fallback = SCENARIO_MACRO_FALLBACK[effectiveScenario]?.[key]
                          ?? macroInputs?.[key];
            const rawVal   = liveVal ?? fallback;
            const isLive   = liveVal != null;

            const display = rawVal != null
              ? `${Number(rawVal).toLocaleString('id-ID', { maximumFractionDigits: 2 })}${unit}`
              : '—';

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
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-neutral-800 text-neutral-600'
                    }`}
                  >
                    {isLive ? 'LIVE' : 'EST'}
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

      {/* ── ZONA 4: ACTION CENTER / DRIFT ALERT ── */}
      <div className={`rounded-xl border p-5 flex items-center justify-between flex-wrap gap-4 transition-colors duration-300 ${
        isDriftWarning 
          ? 'bg-red-950/20 border-red-900/50' 
          : 'bg-emerald-950/10 border-emerald-900/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
            isDriftWarning ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
          }`} />
          <div>
            <div className={`text-[10px] font-mono tracking-[0.1em] font-bold uppercase mb-1 ${
              isDriftWarning ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {isDriftWarning ? 'Action Center: Drift Alert' : 'Action Center: Status Aman'}
            </div>
            <div className="text-xs font-mono text-neutral-400">
              {isDriftWarning 
                ? 'Peringatan: Alokasi portofolio melenceng dari batas toleransi (>5%).'
                : 'Status Eksekusi: Portofolio selaras dengan target skenario. Tidak ada tindakan mendesak diperlukan.'
              }
            </div>
          </div>
        </div>
        {isDriftWarning && (
          <button
            onClick={() => setTab?.("strategy")}
            className="flex-shrink-0 text-[10px] font-mono font-bold px-4 py-2 rounded-lg border
                       bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20
                       hover:border-red-500 hover:text-red-300 transition-colors duration-150 cursor-pointer"
          >
            [ REBALANCE SEKARANG ]
          </button>
        )}
      </div>

      {/* ── ZONA 5: GLOBAL PULSE TICKER ── */}
      <div 
        className="w-full bg-neutral-950 border-t border-neutral-800/80 overflow-x-auto py-2.5 px-4 rounded-xl flex items-center shadow-inner"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center gap-4 md:gap-6 whitespace-nowrap min-w-max mx-auto">
          <div className="text-[9px] font-mono text-neutral-500 tracking-[0.2em] uppercase font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]"></span>
            Global Pulse
          </div>
          <div className="h-3 w-px bg-neutral-800"></div>
          {pulseItems.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase">
                <span className="text-neutral-400 font-bold mr-1.5">{item.label}</span>
                <span className="text-white tabular-nums">{item.value}</span>
                <span className={`ml-1.5 tabular-nums ${item.isConstructive ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({item.delta})
                </span>
              </div>
              {i < pulseItems.length - 1 && (
                <div className="w-1 h-1 rounded-full bg-neutral-800 ml-3 md:ml-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="text-[8px] font-mono text-neutral-700 text-center leading-relaxed pb-4 pt-2">
        Platform ini adalah simulasi edukasi berbasis MPT. Bukan rekomendasi investasi resmi.
        Selalu konsultasikan keputusan investasi dengan advisor keuangan terdaftar OJK.
      </div>
    </div>
  );
}
