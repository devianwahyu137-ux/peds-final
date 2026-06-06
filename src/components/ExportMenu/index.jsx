// src/components/ExportMenu/index.jsx
// Dropdown export menu — CSV and JSON download options
// Uses native browser APIs — zero external dependencies

import { useState, useRef, useEffect } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { exportPortfolioCSV, exportPortfolioJSON } from '@/lib/dataExporter';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';

const EXPORT_OPTIONS = [
  {
    type:     'csv',
    icon:     '📊',
    label:    'Export CSV',
    subLabel: 'Excel / Google Sheets compatible',
  },
  {
    type:     'json',
    icon:     '{ }',
    label:    'Export JSON',
    subLabel: 'Raw data untuk analisis lanjutan',
  },
];

export function ExportMenu() {
  const [isOpen, setIsOpen]   = useState(false);
  const [status, setStatus]   = useState(null); // 'success' | 'error'
  const menuRef = useRef(null);

  const scenarioId  = useRootStore(s => s.scenarioId);
  const weights     = useRootStore(s => s.weights);
  const analytics   = useRootStore(s => s.analytics);
  const macroInputs = useRootStore(s => s.macroInputs);
  const config      = SCENARIO_CONFIG[scenarioId] ?? SCENARIO_CONFIG.EQUILIBRIUM;

  const exportParams = { scenarioId, weights, analytics, macroInputs };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = (type) => {
    try {
      if (type === 'csv')  exportPortfolioCSV(exportParams);
      if (type === 'json') exportPortfolioJSON(exportParams);
      setStatus('success');
      setIsOpen(false);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('[AlphaShield] Export error:', err);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border
                   text-[9px] font-mono font-bold tracking-widest uppercase
                   cursor-pointer transition-all duration-150"
        style={{
          background:  isOpen ? 'rgba(255,255,255,0.08)' : 'var(--as-bg-tertiary)',
          borderColor: isOpen ? config.color + '40' : 'var(--as-border-primary)',
          color:       isOpen ? config.color : 'var(--as-text-secondary)',
        }}
      >
        <span>⬇</span>
        <span>EXPORT</span>
        <span className="text-[7px] opacity-50">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 z-50 rounded-xl
                     overflow-hidden shadow-2xl border backdrop-blur-xl"
          style={{
            background:  'rgba(15,15,20,0.95)',
            borderColor: 'var(--as-border-primary)',
          }}
        >
          <div className="p-2 space-y-1">
            {EXPORT_OPTIONS.map(opt => (
              <button
                key={opt.type}
                onClick={() => handleExport(opt.type)}
                className="w-full flex items-center gap-3 px-3 py-3
                           rounded-xl cursor-pointer transition-colors
                           duration-150 text-left"
                style={{ background: 'transparent' }}
                onMouseOver={e =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center
                             text-sm flex-shrink-0"
                  style={{
                    background: 'var(--as-bg-tertiary)',
                    border:     '1px solid var(--as-border-secondary)',
                  }}
                >
                  {opt.icon}
                </span>
                <div>
                  <div
                    className="text-[10px] font-mono font-bold"
                    style={{ color: 'var(--as-text-primary)' }}
                  >
                    {opt.label}
                  </div>
                  <div
                    className="text-[8px] font-mono mt-0.5"
                    style={{ color: 'var(--as-text-dim)' }}
                  >
                    {opt.subLabel}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer info */}
          <div
            className="px-4 py-2 border-t"
            style={{ borderColor: 'var(--as-border-secondary)' }}
          >
            <div
              className="text-[7px] font-mono leading-relaxed"
              style={{ color: 'var(--as-text-dim)' }}
            >
              Data: alokasi, MPT analytics, kondisi makro aktif
            </div>
          </div>
        </div>
      )}

      {/* Status toast */}
      {status && (
        <div
          className="absolute right-0 top-full mt-2 px-3 py-2
                     rounded-xl text-[9px] font-mono z-50 whitespace-nowrap"
          style={{
            background: status === 'success'
              ? 'rgba(16,185,129,0.15)'
              : 'rgba(239,68,68,0.15)',
            color: status === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${status === 'success' ? '#10b98130' : '#ef444430'}`,
          }}
        >
          {status === 'success' ? '✓ File berhasil didownload' : '✗ Export gagal'}
        </div>
      )}
    </div>
  );
}
