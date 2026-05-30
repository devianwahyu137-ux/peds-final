import { useRootStore } from "@/stores/rootStore";
import { SENTIMENT_AGGREGATE, OVERALL_STYLE } from "../components/MacroSentimentSummary";
import { Landmark, BarChart2, ArrowRightLeft, DollarSign, TrendingUp, Gem, Wallet, AlertTriangle, Lock, AlertOctagon, Lightbulb, Target } from "lucide-react";

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
    icon:      <Landmark size={16} className="text-slate-400 dark:text-neutral-500" />,
    getValue:  (ld) => ld?.bi_macro?.biRate ?? ld?.bi_macro?.v ?? ld?.biRate?.v ?? null,
  },
  {
    key:       'cpi',
    label:     'Inflasi',
    unit:      '%',
    icon:      <BarChart2 size={16} className="text-slate-400 dark:text-neutral-500" />,
    getValue:  (ld) => ld?.bi_macro?.cpi ?? ld?.cpi?.v ?? null,
  },
  {
    key:       'usdIdr',
    label:     'USD/IDR',
    unit:      '',
    icon:      <ArrowRightLeft size={16} className="text-slate-400 dark:text-neutral-500" />,
    getValue:  (ld) => ld?.usdIdr?.v ?? (typeof ld?.usdIdr === 'number' ? ld.usdIdr : null),
  },
  {
    key:       'dxy',
    label:     'DXY Index',
    unit:      ' pts',
    icon:      <DollarSign size={16} className="text-slate-400 dark:text-neutral-500" />,
    getValue:  (ld) => ld?.dxy?.v ?? (typeof ld?.dxy === 'number' ? ld.dxy : null),
  },
];

const SCENARIO_MACRO_FALLBACK = {
  EQUILIBRIUM:     { biRate: 5.50, cpi: 2.8, usdIdr: 15850, dxy: 101.2 },
  TIGHTENING:      { biRate: 6.75, cpi: 4.2, usdIdr: 16250, dxy: 104.5 },
  CURRENCY_STRESS: { biRate: 7.50, cpi: 5.8, usdIdr: 17150, dxy: 106.8 },
};

const ASSET_BARS = [
  { key: "stocks", label: "Saham (IDX)",    icon: <TrendingUp size={16} className="text-blue-500" />, color: "#3b82f6" },
  { key: "bonds",  label: "Obligasi (SBN)", icon: <Landmark size={16} className="text-purple-400" />, color: "#a78bfa" },
  { key: "gold",   label: "Emas Fisik",     icon: <Gem size={16} className="text-amber-400" />, color: "#fbbf24" },
  { key: "cash",   label: "Kas / USD",      icon: <Wallet size={16} className="text-emerald-400" />, color: "#34d399" },
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
  // Updated Global Pulse Ticker data — May 2026 verified
  const GLOBAL_PULSE_DATA = [
    { label: 'IHSG',      value: '6.170',   delta: '-11.8%', dir: -1, unit: 'pts' },
    { label: 'SBN 10Y',   value: '6.71%',   delta: '+0.32%', dir: 1,  unit: ''    },
    { label: 'USD/IDR',   value: '17.700',  delta: '+9.2%',  dir: -1, unit: ''    },
    { label: 'GOLD',      value: '2.342',   delta: '+1.15%', dir: 1,  unit: 'USD' },
    { label: 'BI RATE',   value: '5.25%',   delta: '+50bps', dir: -1, unit: ''    },
    { label: 'DXY',       value: '104.50',  delta: '+0.3%',  dir: -1, unit: 'pts' },
    { label: 'US 10Y',    value: '4.40%',   delta: '-0.02%', dir: -1, unit: ''    },
    { label: 'XAU/IDR',   value: '41.3M',   delta: '+12.1%', dir: 1,  unit: 'IDR/gr'},
  ];

  return (
    <div className="space-y-6 w-full page-enter">

      {/* ── ZONA 1: SITUASI HARI INI ── */}
      <div
        className="rounded-md p-5 border border-slate-200 dark:border-neutral-800/60 bg-white dark:bg-[#121212]"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
              >
                {narrative.riskLabel}
              </span>
              <span
                className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest"
                style={{ background: sentimentStyle.bg, color: sentimentStyle.color, border: `1px solid ${sentimentStyle.color}40` }}
              >
                BIAS: {sentimentData.overall}
              </span>
            </div>
            <h2 className="text-2xl font-black font-sans tracking-tight text-slate-900 dark:text-neutral-100 mb-3">
              {narrative.headline}
            </h2>
            <p className="text-sm font-sans text-slate-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              {narrative.body}
            </p>
          </div>
          <div
            className="flex-shrink-0 text-right p-4 rounded-md"
            style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
          >
            <div className="text-[10px] font-sans text-slate-500 dark:text-neutral-500 tracking-widest uppercase mb-1.5">
              Sharpe Ratio
            </div>
            <div
              className="text-4xl font-black font-mono tabular-nums"
              style={{ color: accent }}
            >
              {sharpeRatio.toFixed(2)}
            </div>
            <div className="text-[10px] font-sans text-slate-500 dark:text-neutral-500 mt-1.5">
              skor efisiensi portofolio
            </div>
          </div>
        </div>
      </div>

      {/* ── ZONA 2: REKOMENDASI UTAMA ── */}
      <div className="rounded-md border border-slate-200 dark:border-neutral-800/60 bg-white dark:bg-[#121212] p-5">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="text-[10px] font-sans tracking-[0.2em] text-slate-500 dark:text-neutral-500 uppercase mb-2 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" /> REKOMENDASI ALOKASI SAAT INI
            </div>
            <p className="text-sm font-sans text-slate-600 dark:text-neutral-400">
              {narrative.advice}
            </p>
          </div>
          <button
            onClick={() => setTab?.("portfolio")}
            className="flex-shrink-0 text-[10px] font-sans px-4 py-2 rounded-sm border
                       border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-600
                       hover:text-slate-700 dark:hover:text-neutral-300 transition-colors duration-200 cursor-pointer"
          >
            Lihat Detail MPT →
          </button>
        </div>

        <div className="space-y-4">
          {ASSET_BARS.map(({ key, label, icon, color }) => {
            const pct = targetWeights?.[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-6">{icon}</span>
                <span className="text-xs font-sans text-slate-600 dark:text-neutral-400 w-32 flex-shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-neutral-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}88, ${color})`,
                    }}
                  />
                </div>
                <span
                  className="text-base font-black font-mono tabular-nums w-12 text-right flex-shrink-0"
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
        <div className="text-[10px] font-sans tracking-[0.2em] text-slate-500 dark:text-neutral-500 uppercase mb-4">
          Sinyal Pasar Terkini
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="rounded-md border border-slate-200 dark:border-neutral-800/60 bg-white dark:bg-[#121212] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center justify-center">{icon}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest border ${
                      isLive
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-slate-50 dark:bg-neutral-900/50 text-slate-500 dark:text-neutral-500 border-slate-200 dark:border-neutral-800/60'
                    }`}
                  >
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse mr-1.5" />}
                    {isLive ? 'LIVE' : 'EST'}
                  </span>
                </div>
                <div className="text-[10px] font-sans text-slate-500 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
                  {label}
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-neutral-100 tabular-nums">
                  {display}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ZONA 4: ACTION CENTER / DRIFT ALERT ── */}
      <div className={`rounded-md border p-5 flex items-center justify-between flex-wrap gap-5 transition-colors duration-300 ${
        isDriftWarning 
          ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/40' 
          : 'bg-emerald-50 dark:bg-emerald-950/5 border-emerald-200 dark:border-emerald-900/20'
      }`}>
        <div className="flex items-center gap-5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${
            isDriftWarning ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
          }`} />
          <div>
            <div className={`text-[11px] font-sans tracking-[0.1em] font-bold uppercase mb-1 ${
              isDriftWarning ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {isDriftWarning ? 'Action Center: Drift Alert' : 'Action Center: Status Aman'}
            </div>
            <div className="text-sm font-sans text-slate-600 dark:text-neutral-400">
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
            className="flex-shrink-0 text-[11px] font-mono font-bold px-4 py-2 rounded-sm border
                       bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20
                       hover:border-red-300 dark:hover:border-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 cursor-pointer uppercase tracking-widest"
          >
            Rebalance Sekarang
          </button>
        )}
      </div>

      {/* ── WHAT THIS MEANS FOR YOU — Contextual Guidance ── */}
      <div className="rounded-md border border-slate-200 dark:border-neutral-800/60 overflow-hidden bg-white dark:bg-[#121212]">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-neutral-800/60 flex items-center gap-4 bg-slate-50/50 dark:bg-neutral-900/30">
          <span className="flex items-center justify-center text-slate-400 dark:text-neutral-400"><Target size={18} /></span>
          <div>
            <div className="text-[10px] font-sans text-slate-500 dark:text-neutral-500 tracking-[0.2em] uppercase mb-0.5">
              Panduan Kontekstual
            </div>
            <div className="text-sm font-bold font-sans tracking-tight text-slate-900 dark:text-neutral-100">
              Apa Yang Harus Dilakukan Sekarang?
            </div>
          </div>
          <span
            className="ml-auto px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest border"
            style={{
              color:       accent,
              borderColor: `${accent}30`,
              background:  `${accent}15`,
            }}
          >
            {scenarioId.replace('_', ' ')}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {scenarioId === 'EQUILIBRIUM' && (<>
            <ActionGuidanceCard icon={<TrendingUp size={18} className="text-blue-500" />} title="Pertahankan Ekuitas" color="#3b82f6"
              body="Pasar modal domestik mendukung. Saham banking & consumer staples menawarkan return optimal. Hindari rotasi prematur ke aset defensif." />
            <ActionGuidanceCard icon={<Landmark size={18} className="text-purple-400" />} title="Hold Obligasi Negara" color="#a78bfa"
              body="SBN tenor menengah (5-7Y) berikan keseimbangan yield vs durasi. ORI/SR cocok untuk investor ritel yang ingin kepastian." />
            <ActionGuidanceCard icon={<Wallet size={18} className="text-emerald-400" />} title="Jaga Cash Buffer 20%" color="#34d399"
              body="Pertahankan likuiditas untuk oportunis. Kondisi ekspansi bisa berakhir sewaktu-waktu — cash adalah aset paling fleksibel." />
          </>)}

          {scenarioId === 'TIGHTENING' && (<>
            <ActionGuidanceCard icon={<AlertTriangle size={18} className="text-red-500" />} title="Kurangi Eksposur Saham" color="#ef4444"
              body="BI Rate 5.25% menekan valuasi ekuitas. Hindari saham properti & teknologi. Fokus hanya pada saham defensif berneraca kuat." />
            <ActionGuidanceCard icon={<Lock size={18} className="text-purple-400" />} title="Lock-In Yield SBN" color="#a78bfa"
              body="Manfaatkan yield SBN 6.71% sebelum siklus pengetatan berakhir. SR/ORI adalah instrumen terbaik untuk investor ritel saat ini." />
            <ActionGuidanceCard icon={<Gem size={18} className="text-amber-400" />} title="Tambah Emas Secara Bertahap" color="#fbbf24"
              body="Rupiah mulai tertekan. Emas IDR memberikan proteksi alami. Target 15% alokasi sebagai asuransi portofolio." />
          </>)}

          {scenarioId === 'CURRENCY_STRESS' && (<>
            <ActionGuidanceCard icon={<AlertOctagon size={18} className="text-red-500" />} title="Prioritas Perlindungan Kekayaan" color="#ef4444"
              body="Rupiah mendekati 17.800/USD. Setiap IDR yang tidak dilindungi kehilangan nilai riilnya. Aksi sekarang lebih baik dari menunggu." />
            <ActionGuidanceCard icon={<Gem size={18} className="text-amber-400" />} title="Maksimalkan Emas Fisik" color="#fbbf24"
              body="Target 45% alokasi emas. Beli via Antam atau reksa dana berbasis emas. XAU/IDR memberikan return ganda: harga emas naik + IDR melemah." />
            <ActionGuidanceCard icon={<DollarSign size={18} className="text-emerald-400" />} title="Konversi ke USD / Hard Currency" color="#34d399"
              body="35% kas dalam USD melalui tabungan valas atau reksa dana pasar uang USD. Lindungi purchasing power dari depresiasi Rupiah lebih lanjut." />
          </>)}
        </div>
      </div>

      {/* ── ZONA 5: GLOBAL PULSE TICKER ── */}
      <div 
        className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800/60 overflow-x-auto py-2.5 px-4 rounded-md flex items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center gap-5 md:gap-8 whitespace-nowrap min-w-max mx-auto">
          <div className="text-[10px] font-sans text-slate-500 dark:text-neutral-500 tracking-[0.2em] uppercase font-bold flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Global Pulse
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-neutral-800/60"></div>
          {GLOBAL_PULSE_DATA.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3.5">
              <div className="text-[11px] font-sans uppercase flex items-baseline">
                <span className="text-slate-500 dark:text-neutral-500 font-bold mr-2">{item.label}</span>
                <span className="text-slate-900 dark:text-neutral-100 tabular-nums font-mono">{item.value} {item.unit}</span>
                <span className={`ml-2 tabular-nums font-mono ${item.dir > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  ({item.delta})
                </span>
              </div>
              {i < GLOBAL_PULSE_DATA.length - 1 && (
                <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-neutral-800/60 ml-4 md:ml-6"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="text-[9px] font-sans text-slate-500/70 dark:text-neutral-500/70 text-center leading-relaxed pb-6 pt-2">
        Platform ini adalah simulasi edukasi berbasis MPT. Bukan rekomendasi investasi resmi.
        Selalu konsultasikan keputusan investasi dengan advisor keuangan terdaftar OJK.
      </div>
    </div>
  );
}

function ActionGuidanceCard({ icon, title, body, color }) {
  return (
    <div className="rounded-md p-4 border border-slate-100 dark:border-neutral-800/40 bg-slate-50/30 dark:bg-neutral-900/30">
      <div className="mb-3 flex items-center">{icon}</div>
      <div className="text-xs font-sans tracking-tight font-bold mb-2" style={{ color }}>
        {title}
      </div>
      <p className="text-[10px] font-sans text-slate-600 dark:text-neutral-400 leading-relaxed">
        {body}
      </p>
    </div>
  );
}
