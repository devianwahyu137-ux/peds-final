// src/components/ScenarioIntelligence/index.jsx
// Smart banner that auto-detects scenario alignment
// Shows at top of every page below navbar

import { useMemo, useState } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { getScenarioMismatch } from '@/lib/scenarioDetector';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export function ScenarioIntelligence() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const setScenario = useRootStore((s) => s.setScenario);
  const liveData    = useRootStore((s) => s.liveData);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Build macro data from live or fallback
  const macroData = useMemo(() => ({
    biRate:    liveData?.bi_macro?.biRate   ?? macroInputs?.biRate    ?? 5.25,
    cpi:       liveData?.bi_macro?.cpi      ?? macroInputs?.inflation ?? 3.48,
    usdIdr:    liveData?.usdIdr?.v          ?? macroInputs?.usdIdr    ?? 17700,
    ihsg:      liveData?.ihsg?.v            ?? 6170,
    dxy:       liveData?.dxy?.v             ?? 104.5,
  }), [liveData, macroInputs]);

  const mismatch = useMemo(
    () => getScenarioMismatch(scenarioId, macroData),
    [scenarioId, macroData]
  );

  const activeConfig      = SCENARIO_CONFIG[scenarioId];
  const recommendedConfig = SCENARIO_CONFIG[mismatch.recommended];

  // Don't show if dismissed
  if (isDismissed) return null;

  // ── ALIGNED state ─────────────────────────────────────────
  if (mismatch.isAligned) {
    return (
      <div className="card-tier-3 !p-3 mb-6 bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={16} />
          <div>
            <span className="font-bold tracking-widest">SKENARIO SELARAS</span>
            {' '}— Data makro terkini ({macroData.biRate}% BI Rate,
            IDR {macroData.usdIdr.toLocaleString('id-ID')}) konsisten
            dengan skenario <span className="font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">{activeConfig.label}</span> yang aktif.
          </div>
        </div>
        <div className="font-bold border border-emerald-500/20 px-2 py-1 rounded-md bg-emerald-500/5">
          Confidence: {mismatch.confidence}%
        </div>
      </div>
    );
  }

  // ── MISMATCH state ────────────────────────────────────────
  const isWarning = mismatch.isClose;
  const accentColor = isWarning ? '#f59e0b' : '#ef4444';
  const accentBg    = isWarning
    ? 'rgba(245,158,11,0.08)'
    : 'rgba(239,68,68,0.08)';
  const accentBorder = isWarning
    ? 'rgba(245,158,11,0.20)'
    : 'rgba(239,68,68,0.20)';

  return (
    <div className="card-tier-2 !p-0 mb-6 overflow-hidden animate-fadeIn" style={{ backgroundColor: accentBg, borderColor: accentBorder }}>
      {/* Main alert row */}
      <div className="p-4 flex flex-col md:flex-row md:items-start gap-4 border-b border-transparent">
        {/* Icon */}
        <div className="mt-1" style={{ color: accentColor }}>
          {isWarning ? <AlertTriangle size={24} /> : <AlertOctagon size={24} />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest text-sm" style={{ color: accentColor }}>
              {isWarning ? 'PERINGATAN SKENARIO' : 'KETIDAKSESUAIAN SKENARIO'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: accentColor, color: '#fff' }}>
              Confidence: {mismatch.confidence}%
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
            Data makro terkini menunjukkan kondisi{' '}
            <span className="font-bold uppercase px-1 py-0.5 rounded" style={{ color: recommendedConfig.color, background: recommendedConfig.color + '20' }}>
              {recommendedConfig.label}
            </span>
            {' '}(BI Rate {macroData.biRate}%, IDR{' '}
            {macroData.usdIdr.toLocaleString('id-ID')}),
            {' '}namun skenario aktif saat ini adalah{' '}
            <span className="font-bold uppercase px-1 py-0.5 rounded" style={{ color: activeConfig.color, background: activeConfig.color + '20' }}>
              {activeConfig.label}
            </span>.
            {' '}Analisis dan rekomendasi alokasi mungkin tidak optimal.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setScenario(mismatch.recommended)}
              className="text-[9px] font-mono font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 uppercase tracking-widest"
              style={{
                background:  recommendedConfig.color + '18',
                border:      `1px solid ${recommendedConfig.color}40`,
                color:       recommendedConfig.color,
              }}
            >
              Ganti ke {mismatch.recommended.replace('_', ' ')} →
            </button>
            <button
              onClick={() => setIsExpanded(p => !p)}
              className="text-[9px] font-mono cursor-pointer transition-colors uppercase tracking-widest"
              style={{ color: 'var(--as-text-dim)' }}
            >
              {isExpanded ? 'Sembunyikan sinyal ▲' : 'Lihat sinyal detail ▼'}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-[9px] font-mono md:ml-auto cursor-pointer transition-colors hover:text-neutral-400 uppercase tracking-widest"
              style={{ color: 'var(--as-text-dim)' }}
            >
              Abaikan ✕
            </button>
          </div>
        </div>
      </div>

      {/* Expanded signal detail */}
      {isExpanded && (
        <div className="p-4 bg-slate-50/50 dark:bg-black/20 border-t" style={{ borderColor: accentBorder }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 mb-3">
                SINYAL DETEKSI OTOMATIS
              </div>
              <div className="space-y-2">
                {mismatch.signals.map((sig, i) => (
                  <div key={i} className="flex gap-3 text-[10px] p-2 rounded-lg bg-white/50 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/50">
                    <div className="w-1.5 rounded-full" style={{ background: sig.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700 dark:text-neutral-300">{sig.indicator}</span>
                        <span className="font-bold" style={{ color: sig.color }}>{sig.value}</span>
                      </div>
                      <div className="text-slate-500 dark:text-neutral-400 leading-snug">
                        {sig.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score breakdown */}
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 mb-3">
                SKOR PER SKENARIO
              </div>
              <div className="space-y-4">
                {Object.entries(mismatch.scores)
                  .sort(([,a],[,b]) => b - a)
                  .map(([scenario, score]) => {
                    const conf = SCENARIO_CONFIG[scenario];
                    return (
                      <div key={scenario}>
                        <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
                          <span style={{ color: conf.color }}>{conf.label}</span>
                          <span className="text-slate-600 dark:text-neutral-400">{score}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width:      `${Math.min(100, score)}%`,
                              background: conf.color,
                              opacity:    scenario === mismatch.recommended ? 1 : 0.4,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
