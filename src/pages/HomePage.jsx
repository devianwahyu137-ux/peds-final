import { useRootStore, SCENARIOS } from "@/stores/rootStore";
import { SENTIMENT_AGGREGATE, OVERALL_STYLE } from "../components/MacroSentimentSummary";
import { Landmark, BarChart2, ArrowRightLeft, DollarSign, TrendingUp, Gem, Wallet, AlertTriangle, Lock, AlertOctagon, Lightbulb, Target, AlertCircle, Check } from "lucide-react";
import { ScenarioIntelligence } from '@/components/ScenarioIntelligence';
import { SCENARIO_CONFIG } from "@/lib/scenarioPulse";
import { formatNumber, formatPoints, formatIDR } from "@/utils/format";

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
    advice: "Prioritaskan emas fisik and kas USD sebagai benteng kekayaan dari depresiasi Rupiah.",
    riskLabel: "RISIKO TINGGI",
    color: "#ef4444",
  },
  HIPERINFLASI: {
    headline: "Kondisi Pasar: Hiperinflasi Ekstrem",
    body: "Inflasi melonjak tajam ke 15.5%. BI Rate terpaksa ditarik ke 12.00%, dan daya beli anjlok tajam. Lindungi aset Anda dengan beralih ke emas dan kas berisiko rendah.",
    advice: "Lari ke aset riil dan lindung nilai (Emas 60%). Hindari aset tunai rupiah secara drastis.",
    riskLabel: "RISIKO EKSTREM",
    color: "#ef4444",
  },
  RUPIAH_CRASH: {
    headline: "Kondisi Pasar: Keruntuhan Nilai Tukar",
    body: "USD/IDR meroket tajam menembus 20.000. DXY kokoh di 110.00. Krisis depresiasi akut yang menekan pasar domestik.",
    advice: "Kunci aset di valuta asing dan emas. Ekuitas domestik sangat rentan terhadap beban impor operasional.",
    riskLabel: "RISIKO EKSTREM",
    color: "#f59e0b",
  }
};

const QUICK_SIGNALS_CONFIG = [
  {
    key:       'biRate',
    label:     'BI Rate',
    unit:      '%',
    icon:      <Landmark size={18} className="text-slate-400 dark:text-neutral-500" />,
  },
  {
    key:       'inflasi',
    label:     'Inflasi',
    unit:      '%',
    icon:      <BarChart2 size={18} className="text-slate-400 dark:text-neutral-500" />,
  },
  {
    key:       'usdIdr',
    label:     'USD/IDR',
    unit:      '',
    icon:      <ArrowRightLeft size={18} className="text-slate-400 dark:text-neutral-500" />,
  },
  {
    key:       'dxy',
    label:     'DXY Index',
    unit:      ' pts',
    icon:      <DollarSign size={18} className="text-slate-400 dark:text-neutral-500" />,
  },
];

const ASSET_BARS = [
  { key: "stocks", label: "Saham (IDX)",    icon: <TrendingUp size={18} className="text-blue-500" />, color: "#3b82f6" },
  { key: "bonds",  label: "Obligasi (SBN)", icon: <Landmark size={18} className="text-purple-400" />, color: "#a78bfa" },
  { key: "gold",   label: "Emas Fisik",     icon: <Gem size={18} className="text-amber-400" />, color: "#fbbf24" },
  { key: "cash",   label: "Kas / USD",      icon: <Wallet size={18} className="text-emerald-400" />, color: "#34d399" },
];

function formatTimeAgoIndonesian(timestamp) {
  if (!timestamp) return "";
  const delta = Date.now() - timestamp;
  if (delta < 60000) return "baru saja";
  const minutes = Math.floor(delta / 60000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(delta / 3600000);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(delta / 86400000);
  return `${days} hari lalu`;
}

export default function HomePage() {
  const scenarioId      = useRootStore((s) => s.scenarioId);
  const crisisMode      = useRootStore((s) => s.crisisMode);
  const targetWeights   = useRootStore((s) => s.targetWeights || s.weights);
  const actualWeights   = useRootStore((s) => s.actualWeights || s.weights);
  const targetAnalytics = useRootStore((s) => s.targetAnalytics || s.analytics);
  const macroInputs     = useRootStore((s) => s.macroInputs);
  const liveData        = useRootStore((s) => s.liveData || {});
  const setTab          = useRootStore((s) => s.setActiveTab);
  const macro           = useRootStore((s) => s.macro);

  const effectiveScenario = crisisMode
    ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
    : scenarioId;
  const narrative = SCENARIO_NARRATIVE[effectiveScenario] || SCENARIO_NARRATIVE.EQUILIBRIUM;
  const scenarioConfig = SCENARIO_CONFIG[effectiveScenario] || SCENARIO_CONFIG.EQUILIBRIUM;
  const accent = scenarioConfig.color;

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
  // Updated Global Pulse Ticker data — June 2026 verified
  const usdIdrVal = macro?.usdIdr ?? 17700;
  const goldVal = macro?.gold ?? 2342;

  const GLOBAL_PULSE_DATA = [
    { label: 'IHSG',      value: formatPoints(SCENARIOS.TIGHTENING.ihsg),  delta: '-11,8%', dir: -1, unit: 'pts' },
    { label: 'SBN 10Y',   value: formatNumber(SCENARIOS.TIGHTENING.sbn10y, 2).replace('.', ','),   delta: '+0,32%', dir: 1,  unit: '%'    },
    { 
      label: 'USD/IDR',   
      value: formatIDR(Math.round(usdIdrVal)), 
      delta: usdIdrVal > 17700 ? `+${(((usdIdrVal - 17700)/17700)*100).toFixed(2)}%` : `${(((usdIdrVal - 17700)/17700)*100).toFixed(2)}%`,  
      dir: usdIdrVal >= 17700 ? -1 : 1, 
      unit: ''    
    },
    { 
      label: 'GOLD',      
      value: formatIDR(Math.round(goldVal)),  
      delta: goldVal > 2342 ? `+${(((goldVal - 2342)/2342)*100).toFixed(2)}%` : `${(((goldVal - 2342)/2342)*100).toFixed(2)}%`, 
      dir: goldVal >= 2342 ? 1 : -1,  
      unit: 'USD' 
    },
    { label: 'BI RATE',   value: formatNumber(SCENARIOS.TIGHTENING.biRate, 2).replace('.', ','),   delta: '+50BPS', dir: -1, unit: '%'    },
  ];

  return (
    <div className="w-full page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
      <ScenarioIntelligence />

      {/* Main asymmetric layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT AREA: Primary Telemetry and Action Strategy (8-cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ── ZONA 1: SITUASI HARI INI ── */}
          <div className="card-tier-1" style={{
            background: `linear-gradient(135deg, var(--as-bg-primary), ${accent}08)`,
            border: `1px solid ${accent}25`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 8px 48px rgba(0,0,0,0.50), 0 0 60px ${accent}08`,
          }}>
            {/* Left: text content */}
            <div className="flex items-start justify-between gap-8 flex-wrap">
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[9px] font-bold tracking-[0.25em]
                                   uppercase px-3 py-1.5 rounded-full"
                        style={{ background: accent + '18', color: accent,
                                 border: `1px solid ${accent}30` }}>
                    {narrative.riskLabel}
                  </span>
                  <span className="text-[9px] text-neutral-600 uppercase">
                    {scenarioId.replace('_', ' ')}
                  </span>
                </div>

                {/* Headline — make this much bigger */}
                <h2 className="text-3xl font-black text-[var(--as-text-primary)]
                               leading-tight tracking-tight mb-4">
                  {narrative.headline}
                </h2>

                {/* Body — more line height, bigger font */}
                <p className="text-sm leading-loose max-w-2xl"
                   style={{ color: 'var(--as-text-secondary)' }}>
                  {narrative.body}
                </p>
              </div>

              {/* Sharpe Ratio — make this the HERO NUMBER */}
              <div className="flex-shrink-0 text-center p-7 rounded-2xl min-w-[180px]
                              relative overflow-hidden"
                   style={{
                     background: `radial-gradient(circle at center, ${accent}18 0%, ${accent}05 60%, transparent 100%)`,
                     border: `1px solid ${accent}30`,
                     boxShadow: `0 0 48px ${accent}12, inset 0 1px 0 ${accent}20`,
                   }}>
                {/* Background glow blob */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 60%, ${accent}10 0%, transparent 70%)`,
                  }}
                />

                <div className="relative">
                  <div className="text-[8px] tracking-[0.25em] uppercase mb-4"
                       style={{ color: accent, opacity: 0.7 }}>
                    SHARPE RATIO
                  </div>
                  <div className="font-black font-mono leading-none tabular-nums mb-1 text-[38px] md:text-[58px]"
                       style={{
                         color: accent,
                         textShadow: `0 0 40px ${accent}60, 0 0 80px ${accent}30`,
                         letterSpacing: '-2px',
                       }}>
                    {formatNumber(sharpeRatio, 2)}
                  </div>
                  <div className="text-[9px] mt-3"
                       style={{ color: accent, opacity: 0.5 }}>
                    skor efisiensi portofolio
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ZONA 2: REKOMENDASI UTAMA ── */}
          <div className="card-tier-2">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-[9px] tracking-[0.25em] uppercase mb-2"
                     style={{ color: 'var(--as-text-dim)' }}>
                  PANDUAN KONTEKSTUAL
                </div>
                <h2 className="text-lg font-bold"
                    style={{ color: 'var(--as-text-primary)' }}>
                  Rekomendasi Alokasi Saat Ini
                </h2>
                <p className="text-xs font-sans font-light text-[var(--as-text-tertiary)] mt-2">
                  {narrative.advice}
                </p>
              </div>
              <button
                onClick={() => setTab?.("portfolio")}
                className="flex-shrink-0 text-[10px] font-semibold font-sans uppercase tracking-widest px-5 py-3.5 md:py-2.5 rounded-lg border
                           border-[var(--as-border-secondary)] text-[var(--as-text-secondary)] hover:border-[var(--as-border-primary)]
                           hover:text-[var(--as-text-primary)] transition-colors duration-200 cursor-pointer shadow-sm min-h-[44px] flex items-center justify-center"
              >
                Lihat Detail MPT →
              </button>
            </div>

            <div className="space-y-5">
              {ASSET_BARS.map(({ key, label, icon, color }) => {
                const pct = targetWeights?.[key] ?? 0;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-xl w-7 flex-shrink-0">{icon}</span>
                    <span className="text-[11px] font-sans w-32 flex-shrink-0"
                          style={{ color: 'var(--as-text-secondary)' }}>
                      {label}
                    </span>
                    <div className="flex-1 h-2 bg-[var(--as-bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}80, ${color})`,
                          boxShadow: `0 0 8px ${color}60`,
                        }}
                      />
                    </div>
                    <span
                      className="text-lg font-black font-mono tabular-nums w-12 text-right flex-shrink-0"
                      style={{ color }}
                    >
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT AREA: Monitoring Telemetry (4-cols sidebar) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ── ZONA 4: ACTION CENTER / DRIFT ALERT ── */}
          {(() => {
            const weights = actualWeights;
            const maxDrift = Math.max(
              ...Object.keys(weights).map(asset =>
                Math.abs((weights[asset] ?? 0) - (targetWeights[asset] ?? 0))
              )
            );
            const execStatus = maxDrift > 10
              ? { label: 'REBALANCING DIPERLUKAN', color: '#ef4444', icon: <AlertTriangle size={14} className="text-red-500" /> }
              : maxDrift > 5
                ? { label: 'DRIFT MINOR TERDETEKSI', color: '#f59e0b', icon: <AlertCircle size={14} className="text-amber-500" /> }
                : { label: 'EKSEKUSI SELARAS',       color: '#10b981', icon: <Check size={14} className="text-emerald-500" /> };

            const macroStatus = {
              EQUILIBRIUM:     { label: 'EKSPANSI NORMAL', color: '#10b981' },
              TIGHTENING:      { label: 'PENGETATAN MONETER', color: '#f59e0b' },
              CURRENCY_STRESS: { label: 'KRISIS NILAI TUKAR', color: '#ef4444' },
            }[scenarioId] ?? { label: 'TIDAK DIKETAHUI', color: '#525252' };

            return (
              <div className="rounded-xl border p-6 space-y-4 transition-colors duration-300 shadow-lg bg-[var(--as-bg-secondary)] border-[var(--as-border-primary)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                       style={{ backgroundColor: `${execStatus.color}20`, color: execStatus.color, border: `1px solid ${execStatus.color}40` }}>
                    {execStatus.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] font-sans font-bold tracking-widest uppercase" style={{ color: execStatus.color }}>
                      {execStatus.label}
                    </div>
                    <div className="text-[9px] text-[var(--as-text-tertiary)] leading-snug">
                      {maxDrift > 10
                        ? `Drift ${formatNumber(maxDrift, 1)}% — rebalancing segera.`
                        : maxDrift > 5
                          ? `Drift minor ${formatNumber(maxDrift, 1)}% — pantau ketat.`
                          : 'Portofolio selaras dengan target.'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-[var(--as-border-secondary)] pt-3 flex flex-col gap-1">
                  <div className="text-[8px] font-sans text-[var(--as-text-tertiary)] uppercase tracking-widest">
                    LINGKUNGAN MAKRO
                  </div>
                  <div className="text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 rounded-md inline-block text-center w-full"
                       style={{ backgroundColor: `${macroStatus.color}10`, color: macroStatus.color, border: `1px solid ${macroStatus.color}30` }}>
                    {macroStatus.label}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── ZONA 3: SINYAL PASAR CEPAT ── */}
          <div className="card-tier-2">
            <div className="mb-4">
              <div className="text-[8px] font-sans tracking-[0.25em] uppercase mb-1"
                   style={{ color: 'var(--as-text-dim)' }}>
                MONITOR MAKRO
              </div>
              <h2 className="text-sm font-bold font-sans uppercase"
                  style={{ color: 'var(--as-text-primary)' }}>
                Sinyal Pasar Terkini
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 stagger-children">
              {QUICK_SIGNALS_CONFIG.map(({ key, label, unit, icon }) => {
                const rawVal   = macro[key];
                const isLiveVal = key === 'biRate' ? (liveData?.bi_macro?.biRate ?? liveData?.bi_macro?.v ?? liveData?.biRate?.v) :
                                 key === 'inflasi' ? (liveData?.bi_macro?.cpi ?? liveData?.cpi?.v) :
                                 (liveData[key]?.v ?? (typeof liveData[key] === 'number' ? liveData[key] : null));
                const isLive   = isLiveVal != null;

                const display = rawVal != null
                  ? (key === 'usdIdr' ? formatIDR(rawVal) : key === 'dxy' ? formatPoints(rawVal) : formatNumber(rawVal, 2)) + unit
                  : '—';

                const isLiveAvailableMetric = key === 'usdIdr';
                const badgeLabel = isLiveAvailableMetric 
                  ? (isLive ? 'LIVE (delay ~3 mnt)' : 'LOAD')
                  : 'ESTIMASI';

                const badgeStyles = isLiveAvailableMetric
                  ? (isLive 
                      ? { background: 'rgba(16,185,129,0.08)', color: '#10b981' } 
                      : { background: 'var(--as-bg-tertiary)', color: 'var(--as-text-dim)' })
                  : { background: 'var(--as-bg-tertiary)', color: 'var(--as-text-dim)' };

                return (
                  <div key={key} className="card-tier-3 card-hover-glow p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-[7px] font-sans px-1 py-0.5 rounded-md flex items-center gap-1"
                            style={badgeStyles}>
                        {isLiveAvailableMetric && isLive && (
                          <div
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                            style={{ boxShadow: `0 0 3px #10b981` }}
                          />
                        )}
                        {badgeLabel}
                      </span>
                    </div>
                    <div className="text-[8px] font-sans tracking-wide uppercase mb-1"
                         style={{ color: 'var(--as-text-dim)' }}>
                      {label}
                    </div>
                    <div className="text-sm font-black font-mono tabular-nums text-[var(--as-text-primary)]">
                      {display}
                    </div>
                    {isLiveAvailableMetric && isLive && liveData[key]?.t && (
                      <div className="text-[8px] font-sans font-medium text-emerald-500/80 mt-1.5 flex items-center gap-1">
                        <span>diperbarui {formatTimeAgoIndonesian(liveData[key].t)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[7px] font-sans text-[var(--as-text-dim)] mt-3 leading-relaxed">
              * Menggunakan estimasi per Juni 2026.
            </p>
          </div>

        </div>

      </div>

      {/* ── WHAT THIS MEANS FOR YOU — Contextual Guidance ── */}
      <div className="card-tier-2 overflow-hidden">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[9px] font-sans tracking-[0.25em] uppercase mb-2"
                 style={{ color: 'var(--as-text-dim)' }}>
              PANDUAN KONTEKSTUAL
            </div>
            <h2 className="text-lg font-bold font-sans"
                 style={{ color: 'var(--as-text-primary)' }}>
              Apa Yang Harus Dilakukan Sekarang?
            </h2>
          </div>
          <span
            className="flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-bold font-sans uppercase tracking-widest"
            style={{
              color:       accent,
              border:      `1px solid ${accent}30`,
              background:  `${accent}15`,
            }}
          >
            {effectiveScenario.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarioId === 'EQUILIBRIUM' && (<>
            <ActionGuidanceCard icon={<TrendingUp size={20} className="text-blue-500" />} title="Pertahankan Ekuitas" color="#3b82f6"
              body="Pasar modal domestik mendukung. Saham banking & consumer staples menawarkan return optimal. Hindari rotasi prematur ke aset defensif." />
            <ActionGuidanceCard icon={<Landmark size={20} className="text-purple-400" />} title="Hold Obligasi Negara" color="#a78bfa"
              body="SBN tenor menengah (5-7Y) berikan keseimbangan yield vs durasi. ORI/SR cocok untuk investor ritel yang ingin kepastian." />
            <ActionGuidanceCard icon={<Wallet size={20} className="text-emerald-400" />} title="Jaga Cash Buffer 20%" color="#34d399"
              body="Pertahankan likuiditas untuk oportunis. Kondisi ekspansi bisa berakhir sewaktu-waktu — cash adalah aset paling fleksibel." />
          </>)}

          {scenarioId === 'TIGHTENING' && (<>
            <ActionGuidanceCard icon={<AlertTriangle size={20} className="text-red-500" />} title="Kurangi Eksposur Saham" color="#ef4444"
              body={`BI Rate ${(SCENARIOS.TIGHTENING.biRate ?? 5.50).toFixed(2)}% menekan valuasi ekuitas. Hindari saham properti & teknologi. Fokus hanya pada saham defensif berneraca kuat.`} />
            <ActionGuidanceCard icon={<Lock size={20} className="text-purple-400" />} title="Lock-In Yield SBN" color="#a78bfa"
              body={`Manfaatkan yield SBN ${(SCENARIOS.TIGHTENING.sbn10y ?? 6.78).toFixed(2)}% sebelum siklus pengetatan berakhir. SR/ORI adalah instrumen terbaik untuk investor ritel saat ini.`} />
            <ActionGuidanceCard icon={<Gem size={20} className="text-amber-400" />} title="Tambah Emas Secara Bertahap" color="#fbbf24"
              body="Rupiah mulai tertekan. Emas IDR memberikan proteksi alami. Target 15% alokasi sebagai asuransi portofolio." />
          </>)}

          {scenarioId === 'CURRENCY_STRESS' && (<>
            <ActionGuidanceCard icon={<AlertOctagon size={20} className="text-red-500" />} title="Prioritas Perlindungan Kekayaan" color="#ef4444"
              body="Rupiah mendekati 17.800/USD. Setiap IDR yang tidak dilindungi kehilangan nilai riilnya. Aksi sekarang lebih baik dari menunggu." />
            <ActionGuidanceCard icon={<Gem size={20} className="text-amber-400" />} title="Maksimalkan Emas Fisik" color="#fbbf24"
              body="Target 45% alokasi emas. Beli via Antam atau reksa dana berbasis emas. XAU/IDR memberikan return ganda: harga emas naik + IDR melemah." />
            <ActionGuidanceCard icon={<DollarSign size={20} className="text-emerald-400" />} title="Konversi ke USD / Hard Currency" color="#34d399"
              body="35% kas dalam USD melalui tabungan valas atau reksa dana pasar uang USD. Lindungi purchasing power dari depresiasi Rupiah lebih lanjut." />
          </>)}
        </div>
      </div>

      {/* ── ZONA 6: GLOBAL PULSE TICKER ── */}
      <div 
        className="w-full bg-[var(--as-bg-card)] border border-[var(--as-border-primary)] shadow-lg shadow-slate-200/50 dark:shadow-black/40 overflow-hidden py-3 px-6 rounded-xl flex items-center transition-colors duration-300 relative"
      >
        <div className="flex items-center gap-3 pr-6 mr-6 border-r border-[var(--as-border-secondary)] bg-[var(--as-bg-card)] z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse drop-shadow-md flex-shrink-0"></span>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--as-text-dim)] whitespace-nowrap">Global Pulse</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track">
            {/* First loop */}
            {GLOBAL_PULSE_DATA.map((item, i) => (
              <div key={`pulse-1-${item.label}`} className="flex items-center gap-4 mr-10 whitespace-nowrap">
                <div className="text-[11px] font-semibold uppercase flex items-baseline">
                  <span className="text-[var(--as-text-dim)] font-semibold mr-2.5">{item.label}</span>
                  <span className="text-sm font-black text-[var(--as-text-primary)] tabular-nums font-mono">
                    {item.value}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                  <span className={`ml-2.5 text-xs font-bold tabular-nums font-mono ${item.dir > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ({item.delta})
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-border-secondary)]"></div>
              </div>
            ))}
            {/* Second loop for seamless scrolling */}
            {GLOBAL_PULSE_DATA.map((item, i) => (
              <div key={`pulse-2-${item.label}`} className="flex items-center gap-4 mr-10 whitespace-nowrap" aria-hidden="true">
                <div className="text-[11px] font-semibold uppercase flex items-baseline">
                  <span className="text-[var(--as-text-dim)] font-semibold mr-2.5">{item.label}</span>
                  <span className="text-sm font-black text-[var(--as-text-primary)] tabular-nums font-mono">
                    {item.value}{item.unit ? ` ${item.unit}` : ''}
                  </span>
                  <span className={`ml-2.5 text-xs font-bold tabular-nums font-mono ${item.dir > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ({item.delta})
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-border-secondary)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div className="text-[9px] font-sans font-light text-[var(--as-text-dim)] text-center leading-relaxed pb-8 pt-4">
        Platform ini adalah simulasi edukasi berbasis MPT. Bukan rekomendasi investasi resmi.
        Selalu konsultasikan keputusan investasi dengan advisor keuangan terdaftar OJK.
      </div>
    </div>
  );
}

function ActionGuidanceCard({ icon, title, body, color }) {
  return (
    <div className="card-tier-3 card-hover flex flex-col justify-start transition-colors duration-300">
      <div className="mb-4 flex items-center">{icon}</div>
      <div className="text-[10px] font-bold font-sans uppercase tracking-widest mb-3" style={{ color }}>
        {title}
      </div>
      <p className="text-xs font-sans font-light text-[var(--as-text-tertiary)] leading-relaxed">
        {body}
      </p>
    </div>
  );
}
