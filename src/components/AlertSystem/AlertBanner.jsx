// src/components/AlertSystem/AlertBanner.jsx
// Persistent alert banner that shows when macro thresholds are breached.
// Dismissible per session via sessionStorage.

import { useState, useMemo } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { loadThresholds, checkAlerts } from '@/lib/alertThresholdSystem';
import { AlertTriangle } from 'lucide-react';

const SESSION_DISMISSED_KEY = 'alphashield_dismissed_alerts';

export function AlertBanner() {
  const liveData    = useRootStore(s => s.liveData);
  const macroInputs = useRootStore(s => s.macroInputs);

  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_DISMISSED_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  // Current macro values from live data or fallbacks
  const currentData = useMemo(() => ({
    usdIdr:    liveData?.usdIdr?.v        ?? macroInputs?.usdIdr    ?? 17700,
    biRate:    liveData?.bi_macro?.biRate  ?? macroInputs?.biRate    ?? 5.25,
    ihsg:      liveData?.ihsg?.v          ?? 6170,
    inflation: liveData?.bi_macro?.cpi    ?? macroInputs?.inflation ?? 3.48,
  }), [liveData, macroInputs]);

  const thresholds = useMemo(() => loadThresholds(), []);

  const triggered = useMemo(
    () => checkAlerts(thresholds, currentData).filter(
      a => !dismissed.includes(a.id)
    ),
    [thresholds, currentData, dismissed]
  );

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, JSON.stringify(next));
    } catch {}
  };

  if (!triggered.length) return null;

  return (
    <div className="space-y-2 mb-4 print:hidden">
      {triggered.map(alert => (
        <div
          key={alert.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border:     '1px solid rgba(239,68,68,0.20)',
          }}
        >
          {/* Pulsing alert icon */}
          <div className="flex-shrink-0 relative">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full
                           rounded-full opacity-50"
                style={{ backgroundColor: '#ef4444' }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: '#ef4444' }}
              />
            </span>
          </div>

          {/* Icon */}
          <span className="text-base flex-shrink-0">{alert.icon}</span>

          {/* Alert text */}
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1"
              style={{ color: '#ef4444' }}
            >
              <AlertTriangle size={12} className="text-red-500" /> ALERT: {alert.label}
            </div>
            <div
              className="text-[9px] font-mono mt-0.5"
              style={{ color: 'var(--as-text-secondary)' }}
            >
              {alert.direction === 'above' ? 'Melampaui' : 'Jatuh di bawah'} batas{' '}
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                {alert.format(alert.thresholdValue)}{alert.unit}
              </span>
              {' — '}nilai saat ini:{' '}
              <span style={{ color: '#ef4444', fontWeight: 700 }}>
                {alert.format(alert.currentValue)}{alert.unit}
              </span>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismiss(alert.id)}
            className="text-[11px] font-mono cursor-pointer flex-shrink-0
                       transition-colors px-2 py-1 rounded-lg"
            style={{ color: 'var(--as-text-dim)' }}
            onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--as-text-dim)')}
            title="Tutup alert ini untuk sesi ini"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
