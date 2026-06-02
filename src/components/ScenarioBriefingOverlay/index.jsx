// src/components/ScenarioBriefingOverlay/index.jsx
// Full-screen overlay that appears on scenario change
// Stays open indefinitely until manually closed

import { useEffect } from 'react';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';

export function ScenarioBriefingOverlay({ scenarioId, isVisible, onDismiss }) {
  const config = SCENARIO_CONFIG[scenarioId];

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onDismiss]);

  if (!isVisible || !config) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'var(--as-bg-primary)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'overlay-appear 200ms ease-out forwards',
      }}
      onClick={onDismiss}
    >
      <div
        className="relative max-w-lg w-full mx-4 rounded-2xl overflow-hidden p-6 space-y-4"
        style={{
          background: 'var(--as-bg-primary)',
          border: `1px solid ${config.colorBorder}`,
          boxShadow: `0 0 60px ${config.colorGlow}, 0 0 120px ${config.colorDim}`,
          animation: 'card-rise 300ms ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scenario badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: config.colorDim,
              color: config.color,
              border: `1px solid ${config.colorBorder}`,
            }}
          >
            SKENARIO AKTIF: {config.riskBadge}
          </span>
          <button
            onClick={onDismiss}
            className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors cursor-pointer tracking-widest"
          >
            [ESC]
          </button>
        </div>

        {/* Title */}
        <h2
          className="text-lg font-black font-mono tracking-tight"
          style={{ color: config.color }}
        >
          {config.briefing.title}
        </h2>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: config.colorBorder }} />

        {/* Summary */}
        <p className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 leading-relaxed">
          {config.briefing.summary}
        </p>

        {/* Recommended action */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            background: config.colorDim,
            border: `1px solid ${config.colorBorder}`,
          }}
        >
          <div
            className="text-[9px] font-mono font-bold tracking-widest uppercase"
            style={{ color: config.color }}
          >
            💡 Tindakan yang Disarankan
          </div>
          <p className="text-[11px] font-mono text-slate-700 dark:text-neutral-300 leading-relaxed">
            {config.briefing.action}
          </p>
        </div>

        {/* Signal */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative flex-shrink-0">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: config.briefing.signalColor,
                boxShadow: `0 0 8px ${config.briefing.signalColor}`,
              }}
            />
            <div
              className="absolute inset-0 w-3 h-3 rounded-full"
              style={{
                backgroundColor: config.briefing.signalColor,
                animation: 'scenario-pulse-glow 2s ease-in-out infinite',
              }}
            />
          </div>
          <span
            className="text-[10px] font-mono font-bold tracking-wide"
            style={{ color: config.briefing.signalColor }}
          >
            {config.briefing.signal}
          </span>
        </div>
      </div>
    </div>
  );
}
