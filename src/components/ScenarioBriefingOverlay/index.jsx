// src/components/ScenarioBriefingOverlay/index.jsx
// Full-screen rich briefing shown when scenario changes.
// Shows macro snapshot, key actions, risks, and new allocation preview.

import { useEffect, useCallback } from 'react';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';
import {
  SCENARIO_BRIEFINGS,
  ASSET_LABELS,
  ASSET_COLORS,
} from '@/lib/scenarioBriefingData';

const TREND_ICON  = { up: '↑', down: '↓', stable: '→' };

export function ScenarioBriefingOverlay({ scenarioId, isVisible, onDismiss }) {
  const config   = SCENARIO_CONFIG[scenarioId];
  const briefing = SCENARIO_BRIEFINGS[scenarioId];

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onDismiss]);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onDismiss, 15000);
    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!isVisible || !config || !briefing) return null;

  const trendColor = (trend) => {
    if (trend === 'up')   return scenarioId === 'EQUILIBRIUM' ? '#10b981' : '#f59e0b';
    if (trend === 'down') return '#ef4444';
    return '#525252';
  };

  const assets = Object.entries(briefing.portfolioChange);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center
                 overflow-y-auto py-8"
      style={{
        background:       'rgba(0,0,0,0.80)',
        backdropFilter:   'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation:        'overlay-appear 200ms ease-out forwards',
      }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden
                   shadow-2xl"
        style={{
          background: 'var(--as-bg-primary)',
          border:     `1px solid ${config.color}40`,
          boxShadow:  `0 0 80px ${config.color}20`,
          animation:  'card-rise 300ms ease-out forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Color accent top bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }}
        />

        <div className="p-6 space-y-5">
          {/* Headline row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-mono font-bold px-2.5 py-1
                             rounded-full tracking-widest"
                  style={{
                    background: config.colorDim,
                    color:      config.color,
                    border:     `1px solid ${config.colorBorder}`,
                  }}
                >
                  {briefing.badge}
                </span>
                <span
                  className="text-[8px] font-mono tracking-widest uppercase"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  SKENARIO DIAKTIFKAN
                </span>
              </div>
              <h2
                className="text-xl font-black font-mono tracking-tight"
                style={{ color: config.color }}
              >
                {briefing.headline}
              </h2>
              <p
                className="text-[11px] font-mono mt-1"
                style={{ color: 'var(--as-text-secondary)' }}
              >
                {briefing.subheadline}
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="text-[10px] font-mono font-bold px-3 py-1.5
                         rounded-lg cursor-pointer transition-colors
                         flex-shrink-0"
              style={{
                background: config.colorDim,
                color:      config.color,
                border:     `1px solid ${config.colorBorder}`,
              }}
            >
              LANJUT →
            </button>
          </div>

          {/* Summary */}
          <p
            className="text-[11px] font-mono leading-relaxed"
            style={{ color: 'var(--as-text-secondary)' }}
          >
            {briefing.summary}
          </p>

          {/* Macro snapshot grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {briefing.macroSnapshot.map(item => (
              <div
                key={item.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'var(--as-bg-tertiary)',
                  border:     '1px solid var(--as-border-secondary)',
                }}
              >
                <div
                  className="text-[8px] font-mono tracking-widest uppercase mb-1"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[14px] font-black font-mono tabular-nums"
                  style={{ color: trendColor(item.trend) }}
                >
                  {TREND_ICON[item.trend]} {item.value}
                </div>
                <div
                  className="text-[7px] font-mono mt-1"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  {item.note}
                </div>
              </div>
            ))}
          </div>

          {/* 2 column: Actions + Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Key actions */}
            <div
              className="rounded-xl p-4"
              style={{
                background: config.colorDim,
                border:     `1px solid ${config.colorBorder}`,
              }}
            >
              <div
                className="text-[9px] font-mono font-bold tracking-widest
                           uppercase mb-3"
                style={{ color: config.color }}
              >
                ▲ TINDAKAN KUNCI
              </div>
              <div className="space-y-2.5">
                {briefing.keyActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{a.icon}</span>
                    <span
                      className="text-[10px] font-mono leading-relaxed"
                      style={{ color: 'var(--as-text-secondary)' }}
                    >
                      {a.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key risks */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(239,68,68,0.05)',
                border:     '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <div
                className="text-[9px] font-mono font-bold tracking-widest
                           uppercase mb-3"
                style={{ color: '#ef4444' }}
              >
                ▼ RISIKO UTAMA
              </div>
              <div className="space-y-2.5">
                {briefing.keyRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="text-[10px] font-mono flex-shrink-0 mt-0.5"
                      style={{ color: '#ef4444' }}
                    >
                      ›
                    </span>
                    <span
                      className="text-[10px] font-mono leading-relaxed"
                      style={{ color: 'var(--as-text-secondary)' }}
                    >
                      {r}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New allocation preview */}
          <div>
            <div
              className="text-[8px] font-mono tracking-widest uppercase mb-2"
              style={{ color: 'var(--as-text-dim)' }}
            >
              ALOKASI BARU YANG DIREKOMENDASIKAN
            </div>
            <div className="flex gap-1.5">
              {assets.map(([asset, pct]) => (
                <div
                  key={asset}
                  className="flex-1 rounded-lg py-2 px-1 text-center"
                  style={{
                    background: ASSET_COLORS[asset] + '15',
                    border:     `1px solid ${ASSET_COLORS[asset]}30`,
                  }}
                >
                  <div
                    className="text-[8px] font-mono"
                    style={{ color: ASSET_COLORS[asset] }}
                  >
                    {ASSET_LABELS[asset]}
                  </div>
                  <div
                    className="text-[16px] font-black font-mono tabular-nums"
                    style={{ color: ASSET_COLORS[asset] }}
                  >
                    {pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-dismiss hint */}
          <div className="text-center pt-1">
            <span
              className="text-[7px] font-mono tracking-wider"
              style={{ color: 'var(--as-text-dim)' }}
            >
              Klik mana saja atau tekan LANJUT → untuk menutup · [ESC]
              · Auto-dismiss dalam 15 detik
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
