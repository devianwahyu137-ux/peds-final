// src/components/AlertSystem/AlertSettings.jsx
// Settings panel for managing alert thresholds.
// Accessible from bell icon in navbar.

import { useState, useCallback } from 'react';
import { loadThresholds, saveThresholds, ALERT_INDICATORS }
  from '@/lib/alertThresholdSystem';

export function AlertSettings({ isOpen, onClose }) {
  const [thresholds, setThresholds] = useState(loadThresholds);

  const handleToggle = useCallback((id) => {
    setThresholds(prev => {
      const next = {
        ...prev,
        [id]: { ...prev[id], enabled: !prev[id].enabled },
      };
      saveThresholds(next);
      return next;
    });
  }, []);

  const handleValue = useCallback((id, value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setThresholds(prev => {
      const next = { ...prev, [id]: { ...prev[id], value: num } };
      saveThresholds(next);
      return next;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden
                   shadow-2xl border"
        style={{
          background:  'var(--as-bg-primary)',
          borderColor: 'var(--as-border-primary)',
          animation:   'fadeInUp 200ms ease both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--as-border-secondary)' }}
        >
          <div>
            <h3
              className="text-sm font-bold font-mono"
              style={{ color: 'var(--as-text-primary)' }}
            >
              🔔 Alert Thresholds
            </h3>
            <p
              className="text-[9px] font-mono mt-0.5"
              style={{ color: 'var(--as-text-dim)' }}
            >
              Pengaturan Notifikasi Makro
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] font-mono px-2 py-1 rounded-lg
                       cursor-pointer transition-colors"
            style={{ color: 'var(--as-text-dim)' }}
            onMouseOver={e =>
              (e.currentTarget.style.color = 'var(--as-text-primary)')
            }
            onMouseOut={e =>
              (e.currentTarget.style.color = 'var(--as-text-dim)')
            }
          >
            ✕
          </button>
        </div>

        {/* Indicator list */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {ALERT_INDICATORS.map(indicator => {
            const cfg = thresholds[indicator.id];
            return (
              <div
                key={indicator.id}
                className="rounded-xl p-4"
                style={{
                  background: cfg.enabled
                    ? 'rgba(239,68,68,0.05)'
                    : 'var(--as-bg-tertiary)',
                  border: `1px solid ${
                    cfg.enabled
                      ? 'rgba(239,68,68,0.20)'
                      : 'var(--as-border-secondary)'
                  }`,
                  transition: 'all 200ms',
                }}
              >
                {/* Top row: label + toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{indicator.icon}</span>
                    <div>
                      <div
                        className="text-[11px] font-mono font-bold"
                        style={{ color: 'var(--as-text-primary)' }}
                      >
                        {indicator.label}
                      </div>
                      <div
                        className="text-[8px] font-mono mt-0.5"
                        style={{ color: 'var(--as-text-dim)' }}
                      >
                        {indicator.description}
                      </div>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(indicator.id)}
                    className="relative w-10 h-5 rounded-full cursor-pointer
                               transition-colors duration-200 flex-shrink-0"
                    style={{
                      background: cfg.enabled
                        ? '#ef4444'
                        : 'rgba(255,255,255,0.10)',
                    }}
                    aria-label={`Toggle ${indicator.label} alert`}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full
                                 bg-white shadow-sm transition-transform
                                 duration-200"
                      style={{
                        transform: cfg.enabled
                          ? 'translateX(22px)'
                          : 'translateX(2px)',
                      }}
                    />
                  </button>
                </div>

                {/* Value input — visible when enabled */}
                {cfg.enabled && (
                  <div
                    className="flex items-center gap-2 mt-3 pt-3 border-t"
                    style={{ borderColor: 'rgba(239,68,68,0.15)' }}
                  >
                    <span
                      className="text-[8px] font-mono tracking-widest uppercase
                                 flex-shrink-0"
                      style={{ color: 'var(--as-text-dim)' }}
                    >
                      {indicator.direction === 'above'
                        ? 'Alert jika ≥'
                        : 'Alert jika ≤'}
                    </span>
                    <input
                      type="number"
                      value={cfg.value}
                      onChange={e =>
                        handleValue(indicator.id, e.target.value)
                      }
                      step={indicator.unit === '%' ? 0.25 : 100}
                      className="flex-1 rounded-lg px-3 py-1.5 text-[11px]
                                 font-mono font-bold text-right outline-none"
                      style={{
                        background: 'var(--as-bg-primary)',
                        color:      '#ef4444',
                        border:     '1px solid rgba(239,68,68,0.30)',
                      }}
                    />
                    <span
                      className="text-[9px] font-mono font-bold flex-shrink-0"
                      style={{ color: 'var(--as-text-dim)' }}
                    >
                      {indicator.unit}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: 'var(--as-border-secondary)' }}
        >
          <p
            className="text-[7px] font-mono leading-relaxed"
            style={{ color: 'var(--as-text-dim)' }}
          >
            Alert berbasis data estimasi/fallback. Disimpan di browser
            localStorage. Reset saat clear browser data.
          </p>
        </div>
      </div>
    </div>
  );
}
