// src/components/PortfolioHealthScore/index.jsx
// Portfolio Health Score panel — arc gauge + 5 dimension bars
// Reads from rootStore and scenarioDetector — no engine files touched

import { useMemo } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { computeHealthScore, HEALTH_DIMENSIONS } from '@/lib/healthScoreEngine';
import { getScenarioMismatch } from '@/lib/scenarioDetector';
import { ArcGauge } from './ArcGauge';
import { Zap, Activity, Shield, Compass, Target } from 'lucide-react';

const DIMENSION_ICONS = {
  'efisiensi': <Zap size={14} className="text-yellow-400" />,
  'stabilitas': <Activity size={14} className="text-blue-400" />,
  'perlindungan': <Shield size={14} className="text-emerald-400" />,
  'diversifikasi': <Compass size={14} className="text-purple-400" />,
  'skenario': <Target size={14} className="text-red-400" />,
};

const DIMENSION_ICONS_LARGE = {
  'efisiensi': <Zap size={18} className="text-yellow-400" />,
  'stabilitas': <Activity size={18} className="text-blue-400" />,
  'perlindungan': <Shield size={18} className="text-emerald-400" />,
  'diversifikasi': <Compass size={18} className="text-purple-400" />,
  'skenario': <Target size={18} className="text-red-400" />,
};

export function PortfolioHealthScore() {
  const scenarioId  = useRootStore(s => s.scenarioId);
  const crisisMode  = useRootStore(s => s.crisisMode);
  const analytics   = useRootStore(s => s.analytics);
  const macroInputs = useRootStore(s => s.macroInputs);
  const liveData    = useRootStore(s => s.liveData);
  const effectiveScenario = crisisMode
    ? (crisisMode === "HYPERINFLATION" ? "HIPERINFLASI" : crisisMode)
    : scenarioId;
  const config      = SCENARIO_CONFIG[effectiveScenario] ?? SCENARIO_CONFIG.EQUILIBRIUM;

  // Build macro snapshot for mismatch detection
  const macroData = useMemo(() => ({
    biRate: liveData?.bi_macro?.biRate  ?? macroInputs?.biRate    ?? 5.25,
    cpi:    liveData?.bi_macro?.cpi     ?? macroInputs?.inflation ?? 3.48,
    usdIdr: liveData?.usdIdr?.v         ?? macroInputs?.usdIdr    ?? 17700,
    dxy:    liveData?.dxy?.v            ?? 104.5,
  }), [liveData, macroInputs]);

  // Compute mismatch for DIM 5
  const mismatch = useMemo(
    () => getScenarioMismatch(scenarioId, macroData),
    [scenarioId, macroData]
  );

  // Compute final health score
  const { scores, total, grade } = useMemo(
    () => computeHealthScore({ analytics, mismatch }),
    [analytics, mismatch]
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--as-bg-secondary)',
        border:     '1px solid var(--as-border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{
          background:  'var(--as-bg-primary)',
          borderColor: 'var(--as-border-secondary)',
        }}
      >
        <div
          className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1.5"
          style={{ color: 'var(--as-text-dim)' }}
        >
          COMPOSITE RISK ASSESSMENT
        </div>
        <h3
          className="text-base font-bold font-mono"
          style={{ color: 'var(--as-text-primary)' }}
        >
          Skor Kesehatan Portofolio
        </h3>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Gauge + dimension bars */}
        <div className="flex items-center gap-8 flex-col md:flex-row">
          {/* Left: arc gauge + grade badge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <ArcGauge score={total} color={config.color} />
            <div className="text-center -mt-2">
              <span
                className="text-[11px] font-mono font-bold px-3 py-1
                           rounded-full tracking-widest"
                style={{
                  background: config.color + '18',
                  color:      config.color,
                  border:     `1px solid ${config.color}30`,
                }}
              >
                {grade.label}
              </span>
            </div>
          </div>

          {/* Right: dimension bars */}
          <div className="flex-1 min-w-[200px] w-full space-y-4">
            {HEALTH_DIMENSIONS.map(dim => {
              const dimScore = scores[dim.id] ?? 0;
              const pct      = (dimScore / 20) * 100;
              const dimColor = pct >= 80 ? '#10b981'
                             : pct >= 60 ? '#f59e0b'
                             : '#ef4444';

              return (
                <div key={dim.id} className="group">
                  {/* Label row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 flex items-center">{DIMENSION_ICONS[dim.id] || dim.icon}</span>
                      <span
                        className="text-[10px] font-mono font-bold uppercase
                                   tracking-wider"
                        style={{ color: 'var(--as-text-secondary)' }}
                      >
                        {dim.label}
                      </span>
                    </div>
                    <span
                      className="text-[12px] font-black font-mono tabular-nums"
                      style={{ color: dimColor }}
                    >
                      {dimScore}/20
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--as-bg-tertiary)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width:      `${pct}%`,
                        background: `linear-gradient(90deg, ${dimColor}aa, ${dimColor})`,
                        boxShadow:  `0 0 8px ${dimColor}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dimension description cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-6">
          {HEALTH_DIMENSIONS.map(dim => {
            const dimScore = scores[dim.id] ?? 0;
            const pct      = (dimScore / 20) * 100;
            const dimColor = pct >= 80 ? '#10b981'
                           : pct >= 60 ? '#f59e0b'
                           : '#ef4444';

            return (
              <div
                key={dim.id}
                className="rounded-xl p-3 text-center relative overflow-hidden"
                style={{
                  background: 'var(--as-bg-tertiary)',
                  border:     `1px solid ${dimColor}15`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: dimColor, opacity: 0.5 }}
                />
                <div className="mb-1.5 flex justify-center">{DIMENSION_ICONS_LARGE[dim.id] || dim.icon}</div>
                <div
                  className="text-[8px] font-mono leading-snug"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  {dim.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
