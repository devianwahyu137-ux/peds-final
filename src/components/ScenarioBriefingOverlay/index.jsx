// src/components/ScenarioBriefingOverlay/index.jsx
// Full-screen overlay that appears for 3.5s on scenario change
// Auto-dismisses, also has manual close button

import { useEffect, useState } from 'react';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';

const OVERLAY_DURATION = 3500; // ms

export function ScenarioBriefingOverlay({ scenarioId, isVisible, onDismiss }) {
  const [progress, setProgress] = useState(0);
  const config = SCENARIO_CONFIG[scenarioId];

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const startTime = Date.now();
    let rafId;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / OVERLAY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, onDismiss]);

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
        background: 'rgba(0,0,0,0.80)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'overlay-appear 200ms ease-out forwards',
      }}
      onClick={onDismiss}
    >
      <div
        className="relative max-w-lg w-full mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(5,5,5,0.95)',
          border: `1px solid ${config.colorBorder}`,
          boxShadow: `0 0 60px ${config.colorGlow}, 0 0 120px ${config.colorDim}`,
          animation: 'card-rise 300ms ease-out forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar — auto countdown */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full transition-none"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${config.color}, ${config.color}88)`,
            }}
          />
        </div>

        <div className="p-6 space-y-4">
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
              className="text-[9px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer px-2 py-1 rounded border border-neutral-800 hover:border-neutral-700"
              onClick={onDismiss}
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
          <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
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
            <p className="text-[11px] font-mono text-neutral-300 leading-relaxed">
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
    </div>
  );
}
