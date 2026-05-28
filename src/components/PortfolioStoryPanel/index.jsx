// src/components/PortfolioStoryPanel/index.jsx
// Narrative panel for PortfolioPage
// Translates MPT numbers into plain Indonesian language

import { useState, useMemo } from 'react';
import { useAlphaShieldStore } from '../../stores/alphaShieldStore';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';
import {
  narrateSharpRatio,
  narrateBeta,
  narrateMaxDrawdown,
  narrateVolatility,
  generateWhatIfImpact,
} from '../../lib/portfolioNarrator';

const WHAT_IF_PRESETS = [
  { label: '+25bps', delta: 25  },
  { label: '+50bps', delta: 50  },
  { label: '+100bps', delta: 100 },
  { label: '-25bps', delta: -25 },
  { label: '-50bps', delta: -50 },
];

export function PortfolioStoryPanel() {
  const scenarioId      = useAlphaShieldStore((s) => s.scenarioId);
  const targetAnalytics = useAlphaShieldStore((s) => s.targetAnalytics);
  const [selectedDelta, setSelectedDelta] = useState(50);
  const config = SCENARIO_CONFIG[scenarioId];

  // Map store analytics to narrator-compatible values
  // Store returns: sharpeRatio, portfolioBeta, maxDrawdown (decimal), portfolioVolatility (decimal)
  const sharpe      = targetAnalytics?.sharpeRatio ?? 0;
  const beta        = targetAnalytics?.portfolioBeta ?? 0;
  const mddDecimal  = targetAnalytics?.maxDrawdown ?? 0;
  const volDecimal  = targetAnalytics?.portfolioVolatility ?? 0;

  // Convert to percentage for narrator display
  const mddPct = Math.abs(mddDecimal * 100);
  const volPct = volDecimal * 100;

  const whatIf = useMemo(
    () => generateWhatIfImpact(sharpe, selectedDelta),
    [sharpe, selectedDelta]
  );

  if (!targetAnalytics) return null;

  const STORY_METRICS = [
    {
      id:        'sharpe',
      icon:      '⚡',
      label:     'Efisiensi Portofolio',
      value:     sharpe.toFixed(2),
      unit:      'σ',
      narrative: narrateSharpRatio(sharpe, scenarioId),
      color:     config?.color ?? '#10b981',
    },
    {
      id:        'beta',
      icon:      '🧭',
      label:     'Sensitivitas Pasar',
      value:     beta.toFixed(2),
      unit:      'β',
      narrative: narrateBeta(beta),
      color:     '#a78bfa',
    },
    {
      id:        'mdd',
      icon:      '🛡️',
      label:     'Risiko Penurunan Maks',
      value:     `-${mddPct.toFixed(1)}`,
      unit:      '%',
      narrative: narrateMaxDrawdown(mddPct),
      color:     '#ef4444',
    },
    {
      id:        'vol',
      icon:      '〰️',
      label:     'Volatilitas Portofolio',
      value:     volPct.toFixed(1),
      unit:      '%',
      narrative: narrateVolatility(volPct, scenarioId),
      color:     '#a3a3a3',
    },
  ];

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center gap-3 pt-2">
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: `linear-gradient(180deg, ${config?.color ?? '#10b981'}, transparent)` }}
        />
        <div>
          <div className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase font-mono">
            Narasi Portofolio
          </div>
          <div className="text-[9px] font-mono text-neutral-600 mt-0.5">
            Apa arti angka-angka ini untuk kamu?
          </div>
        </div>
      </div>

      {/* Story metric cards */}
      <div className="space-y-3">
        {STORY_METRICS.map((m) => (
          <div
            key={m.id}
            className="rounded-xl p-4 transition-all duration-300 hover:bg-white/[0.02]"
            style={{
              background: 'rgba(10,10,10,0.50)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 flex-shrink-0">{m.icon}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-lg font-black font-mono tabular-nums"
                    style={{ color: m.color }}
                  >
                    {m.value}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">{m.unit}</span>
                  <span className="text-[9px] font-mono text-neutral-600 tracking-wider uppercase ml-auto">
                    {m.label}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                  {m.narrative}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What-If Simulator */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.50)',
          border: `1px solid ${config?.colorBorder ?? 'rgba(16,185,129,0.30)'}`,
        }}
      >
        <div className="p-4 space-y-3">
          <div>
            <div
              className="text-[10px] font-mono font-bold tracking-widest uppercase"
              style={{ color: config?.color ?? '#10b981' }}
            >
              🔮 Simulasi What-If
            </div>
            <div className="text-[9px] font-mono text-neutral-600 mt-0.5">
              Jika BI Rate berubah, bagaimana dampak ke portofolio?
            </div>
          </div>

          <div className="space-y-3">
            {/* Preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              {WHAT_IF_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setSelectedDelta(preset.delta)}
                  className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer"
                  style={{
                    background:   selectedDelta === preset.delta ? (config?.colorDim ?? 'rgba(16,185,129,0.12)') : 'rgba(0,0,0,0.4)',
                    borderColor:  selectedDelta === preset.delta ? (config?.color ?? '#10b981')   : 'rgba(255,255,255,0.08)',
                    color:        selectedDelta === preset.delta ? (config?.color ?? '#10b981')   : '#525252',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* What-if result */}
            {whatIf && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                  {whatIf.interpretation}
                </p>
                <div className="flex items-center gap-3 justify-center py-2">
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">
                      Saat Ini
                    </div>
                    <div
                      className="text-base font-black font-mono tabular-nums mt-1"
                      style={{ color: config?.color ?? '#10b981' }}
                    >
                      {sharpe.toFixed(2)}σ
                    </div>
                  </div>
                  <div
                    className="text-lg font-mono"
                    style={{ color: selectedDelta > 0 ? '#ef4444' : '#10b981' }}
                  >
                    {selectedDelta > 0 ? '→' : '←'}
                  </div>
                  <div className="text-center">
                    <div className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">
                      Estimasi Baru
                    </div>
                    <div
                      className="text-base font-black font-mono tabular-nums mt-1"
                      style={{
                        color: parseFloat(whatIf.newSharpe) < sharpe ? '#ef4444' : '#10b981',
                      }}
                    >
                      {whatIf.newSharpe}σ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[8px] font-mono text-neutral-700 leading-relaxed px-1">
        * Simulasi What-If menggunakan model elastisitas MPT yang disederhanakan.
        Bukan proyeksi akurat — hanya untuk referensi edukasi.
      </p>
    </div>
  );
}
