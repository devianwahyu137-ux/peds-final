// src/components/HistoricalBacktest/index.jsx
// Historical backtesting snapshot panel for AnalysisPage
// Shows estimated portfolio performance across 3 historical crises

import { useState } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { HISTORICAL_CRISES } from '@/lib/backtestingData';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { BarChart3, Lightbulb } from 'lucide-react';

const ASSET_LABELS = {
  stocks: 'Ekuitas',
  bonds:  'Obligasi SBN',
  gold:   'Emas Fisik',
  cash:   'Kas / USD',
};

const ASSET_COLORS = {
  stocks: '#3b82f6',
  bonds:  '#a78bfa',
  gold:   '#fbbf24',
  cash:   '#34d399',
};

export function HistoricalBacktest() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const config     = SCENARIO_CONFIG[scenarioId];
  const [activeTab, setActiveTab] = useState('krisis_1997_98');

  const activeCrisis = HISTORICAL_CRISES.find(c => c.id === activeTab)
    ?? HISTORICAL_CRISES[0];

  const myOutcome = activeCrisis.portfolioOutcomes[scenarioId];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--as-bg-secondary)',
        border:     '1px solid var(--as-border-primary)',
        boxShadow:  'var(--shadow-card)',
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-6 py-5
                   border-b"
        style={{
          background:   'var(--as-bg-primary)',
          borderColor:  'var(--as-border-secondary)',
        }}
      >
        <div>
          <div
            className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1.5"
            style={{ color: 'var(--as-text-dim)' }}
          >
            HISTORICAL BACKTESTING
          </div>
          <h3
            className="text-base font-bold font-mono"
            style={{ color: 'var(--as-text-primary)' }}
          >
            Simulasi Krisis Historis Indonesia
          </h3>
          <p
            className="text-[10px] font-mono mt-1"
            style={{ color: 'var(--as-text-tertiary)' }}
          >
            Estimasi performa portofolio di 3 periode krisis — data edukatif, bukan backtesting akurat
          </p>
        </div>
        <div
          className="text-[8px] font-mono px-2.5 py-1.5 rounded-lg"
          style={{
            background: config.color + '15',
            color:      config.color,
            border:     `1px solid ${config.color}30`,
          }}
        >
          Skenario: {scenarioId.replace('_', ' ')}
        </div>
      </div>

      {/* Crisis selector tabs */}
      <div
        className="flex border-b overflow-x-auto scrollbar-hide"
        style={{ borderColor: 'var(--as-border-secondary)' }}
      >
        {HISTORICAL_CRISES.map((crisis) => {
          const isActive    = activeTab === crisis.id;
          const myPerf      = crisis.portfolioOutcomes[scenarioId];
          const perfColor   = !myPerf ? '#525252'
                           : myPerf.returnPct > 0 ? '#10b981'
                           : myPerf.returnPct > -10 ? '#f59e0b'
                           : '#ef4444';
          return (
            <button
              key={crisis.id}
              onClick={() => setActiveTab(crisis.id)}
              className="flex-1 min-w-[130px] text-left cursor-pointer
                         transition-all duration-200 px-4 py-4"
              style={{
                background:   isActive ? crisis.severityColor + '10' : 'transparent',
                borderBottom: `3px solid ${isActive ? crisis.severityColor : 'transparent'}`,
              }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: crisis.severityColor + '20' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: crisis.severityColor }} />
              </div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-widest mb-1"
                   style={{ color: isActive ? crisis.severityColor : 'var(--as-text-dim)' }}>
                {crisis.severity}
              </div>
              <div className="text-[10px] font-mono mb-2"
                   style={{ color: 'var(--as-text-secondary)' }}>
                {crisis.period}
              </div>
              {myPerf && (
                <div className="text-[18px] font-black font-mono tabular-nums"
                     style={{ color: perfColor }}>
                  {myPerf.returnPct > 0 ? '+' : ''}{myPerf.returnPct}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6 space-y-6">

        {/* Crisis context */}
        <div>
          <h4
            className="text-sm font-bold font-mono mb-3"
            style={{ color: 'var(--as-text-primary)' }}
          >
            {activeCrisis.name}
          </h4>
          <p
            className="text-[11px] font-mono leading-loose"
            style={{ color: 'var(--as-text-secondary)' }}
          >
            {activeCrisis.context}
          </p>

          {/* Key macro conditions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {Object.entries(activeCrisis.macroConditions).map(([key, val]) => (
              <div
                key={key}
                className="rounded-xl p-3"
                style={{ background: 'var(--as-bg-tertiary)' }}
              >
                <div
                  className="text-[8px] font-mono tracking-widest uppercase mb-1.5"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  {key}
                </div>
                <div
                  className="text-[12px] font-bold font-mono"
                  style={{ color: 'var(--as-text-primary)' }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset class performance */}
        <div>
          <div
            className="text-[9px] font-mono tracking-[0.2em] uppercase mb-4"
            style={{ color: 'var(--as-text-dim)' }}
          >
            PERFORMA PER KELAS ASET
          </div>
          <div className="space-y-4">
            {Object.entries(activeCrisis.assetPerformance).map(([asset, perf]) => {
              const isPositive = perf.returnPct > 0;
              const barColor   = isPositive ? '#10b981' : '#ef4444';
              const maxAbs     = 420;
              const pct        = Math.min(100, (Math.abs(perf.returnPct) / maxAbs) * 100);
              const barWidth   = `${Math.max(2, pct * 0.5)}%`;

              return (
                <div key={asset}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                           style={{ backgroundColor: ASSET_COLORS[asset] }} />
                      <span className="text-[10px] font-mono"
                            style={{ color: 'var(--as-text-secondary)' }}>
                        {ASSET_LABELS[asset]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono"
                            style={{ color: 'var(--as-text-dim)' }}>
                        {perf.note}
                      </span>
                      <span
                        className="text-[14px] font-black font-mono tabular-nums min-w-[60px] text-right"
                        style={{ color: barColor }}
                      >
                        {isPositive ? '+' : ''}{perf.returnPct}%
                      </span>
                    </div>
                  </div>

                  {/* Bidirectional bar */}
                  <div
                    className="relative h-3 rounded-full overflow-hidden"
                    style={{ background: 'var(--as-bg-tertiary)' }}
                  >
                    {/* Center divider */}
                    <div className="absolute inset-y-0 left-1/2 w-px z-10"
                         style={{ background: 'rgba(255,255,255,0.15)' }} />

                    {/* Bar — starts from center */}
                    <div
                      className="absolute inset-y-0 rounded-full transition-all duration-1000"
                      style={{
                        width:     barWidth,
                        left:      isPositive ? '50%' : `calc(50% - ${barWidth})`,
                        background: `linear-gradient(${isPositive ? '90deg' : '270deg'}, ${barColor}cc, ${barColor})`,
                        boxShadow: `0 0 10px ${barColor}60`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My portfolio outcome — highlighted */}
        {myOutcome && (
          <div
            className="rounded-xl p-5"
            style={{
              background:  myOutcome.returnPct > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border:      `1px solid ${myOutcome.returnPct > 0 ? 'rgba(16,185,129,0.20)' : 'rgba(239,68,68,0.20)'}`,
            }}
          >
            <div
              className="text-[9px] font-mono tracking-[0.2em] uppercase mb-3 flex items-center gap-1"
              style={{ color: 'var(--as-text-dim)' }}
            >
              <BarChart3 size={11} className="text-indigo-400" /> ESTIMASI PORTOFOLIO KAMU ({scenarioId})
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div
                  className="text-[11px] font-mono mb-1"
                  style={{ color: 'var(--as-text-secondary)' }}
                >
                  {myOutcome.label}
                </div>
                <div
                  className="text-[42px] font-black font-mono tabular-nums leading-none"
                  style={{ color: myOutcome.returnPct > 0 ? '#10b981' : '#ef4444' }}
                >
                  {myOutcome.returnPct > 0 ? '+' : ''}{myOutcome.returnPct}%
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[9px] font-mono uppercase tracking-widest mb-1"
                  style={{ color: 'var(--as-text-dim)' }}
                >
                  vs Krisis {activeCrisis.period}
                </div>
                {activeCrisis.portfolioOutcomes.CURRENCY_STRESS && (
                  <div
                    className="text-[10px] font-mono"
                    style={{ color: 'var(--as-text-tertiary)' }}
                  >
                    Alokasi terbaik:{' '}
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      {activeCrisis.portfolioOutcomes.CURRENCY_STRESS.returnPct > 0 ? '+' : ''}
                      {activeCrisis.portfolioOutcomes.CURRENCY_STRESS.returnPct}%
                    </span>
                    {' '}(Alokasi Krisis)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson learned */}
        <div
          className="flex items-start gap-3 px-4 py-4 rounded-xl"
          style={{
            background: 'var(--as-bg-tertiary)',
            borderLeft: `3px solid ${config.color}`,
          }}
        >
          <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p
            className="text-[10px] font-mono leading-loose"
            style={{ color: 'var(--as-text-secondary)' }}
          >
            <span className="font-bold" style={{ color: config.color }}>
              Pelajaran Historis:{' '}
            </span>
            {activeCrisis.lesson}
          </p>
        </div>

        {/* Disclaimer */}
        <p
          className="text-[8px] font-mono leading-relaxed"
          style={{ color: 'var(--as-text-dim)' }}
        >
          * Angka return bersifat estimasi berdasarkan data historis publik yang tersedia.
          Bukan backtesting yang akurat secara statistik. Hanya untuk referensi edukasi.
          Performa masa lalu tidak menjamin hasil di masa depan.
        </p>
      </div>
    </div>
  );
}
