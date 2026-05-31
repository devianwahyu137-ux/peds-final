// src/components/SessionResumeBanner/index.jsx
// Non-intrusive banner that appears when a saved portfolio state is found
// Auto-dismisses after 10 seconds if no action taken

import { useEffect, useState } from 'react';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';

function formatAge(minutes) {
  if (minutes < 2)    return 'baru saja';
  if (minutes < 60)   return `${minutes} menit lalu`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam lalu`;
  return `${Math.floor(minutes / 1440)} hari lalu`;
}

export function SessionResumeBanner({
  savedSession,
  onResume,
  onDismiss,
  onClear,
}) {
  const scenarioId = savedSession?.scenarioId ?? 'EQUILIBRIUM';
  const config     = SCENARIO_CONFIG[scenarioId] ?? SCENARIO_CONFIG.EQUILIBRIUM;
  const [countdown, setCountdown] = useState(10);

  // Auto-dismiss countdown
  useEffect(() => {
    if (countdown <= 0) { onDismiss(); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onDismiss]);

  if (!savedSession) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4"
      style={{ animation: 'card-rise 300ms ease-out forwards' }}
    >
      <div
        className="rounded-2xl border overflow-hidden shadow-2xl"
        style={{
          background:     'var(--as-bg-primary)',
          borderColor:    config.colorBorder,
          boxShadow:      `0 0 40px ${config.colorGlow}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Countdown progress bar */}
        <div className="h-[2px] bg-white dark:bg-neutral-900">
          <div
            className="h-full"
            style={{
              width:      `${(countdown / 10) * 100}%`,
              background: config.color,
              transition: 'width 1s linear',
            }}
          />
        </div>

        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: config.colorDim, border: `1px solid ${config.colorBorder}` }}
          >
            💾
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300">
              Sesi Portofolio Tersimpan
            </div>
            <div className="text-[9px] font-mono text-neutral-600 mt-0.5">
              Skenario{' '}
              <span style={{ color: config.color }}>{config.label}</span>
              {' · '}Disimpan {formatAge(savedSession.ageMinutes ?? 0)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClear}
              className="text-[8px] font-mono text-neutral-700 hover:text-slate-400 dark:text-neutral-500 transition-colors cursor-pointer"
            >
              Hapus
            </button>
            <button
              onClick={onDismiss}
              className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-neutral-800 text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Abaikan ({countdown})
            </button>
            <button
              onClick={onResume}
              className="text-[9px] font-mono px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer"
              style={{
                background: config.colorDim,
                border:     `1px solid ${config.colorBorder}`,
                color:      config.color,
              }}
            >
              Lanjutkan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
