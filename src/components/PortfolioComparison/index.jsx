import { useState } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import { formatNumber } from '@/utils/format';

const scenarioData = {
  'TIGHTENING': {
    title: 'Pengetatan Moneter',
    sharpe: 0.57,
    beta: 0.23,
    volatility: 4.8,
    drawdown: -8.0,
    allocation: { stocks: 15, bonds: 45, gold: 15, cash: 25 }
  },
  'EQUILIBRIUM': {
    title: 'Ekspansi Normal',
    sharpe: 0.82,
    beta: 0.85,
    volatility: 8.5,
    drawdown: -12.0,
    allocation: { stocks: 40, bonds: 30, gold: 10, cash: 20 }
  },
  'CURRENCY_STRESS': {
    title: 'Krisis Nilai Tukar',
    sharpe: 0.35,
    beta: 0.15,
    volatility: 12.4,
    drawdown: -22.5,
    allocation: { stocks: 5, bonds: 15, gold: 45, cash: 35 }
  }
};

const ASSET_LABELS = {
  stocks: 'Ekuitas (IDX)',
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

export function PortfolioComparison() {
  const activeKey = useRootStore((s) => s.scenarioId);
  const [compareKey, setCompareKey] = useState(null);

  const allScenarios = ['EQUILIBRIUM', 'TIGHTENING', 'CURRENCY_STRESS'];
  const availableTargets = allScenarios.filter(s => s !== activeKey);

  const activeData = scenarioData[activeKey] || scenarioData['EQUILIBRIUM'];
  const compareData = compareKey ? (scenarioData[compareKey] || scenarioData['TIGHTENING']) : null;

  const leftConfig  = SCENARIO_CONFIG[activeKey] || SCENARIO_CONFIG['EQUILIBRIUM'];
  const rightConfig = compareKey ? (SCENARIO_CONFIG[compareKey] || SCENARIO_CONFIG['TIGHTENING']) : null;
  const assets      = ['stocks', 'bonds', 'gold', 'cash'];

  const sharpeDiff = compareData ? activeData.sharpe - compareData.sharpe : 0;

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
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ background: 'var(--as-bg-primary)', borderColor: 'var(--as-border-secondary)' }}
      >
        <div>
          <div
            className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1.5"
            style={{ color: 'var(--as-text-dim)' }}
          >
            PORTFOLIO COMPARISON MODE
          </div>
          <h3
            className="text-base font-bold font-mono"
            style={{ color: 'var(--as-text-primary)' }}
          >
            Perbandingan Skenario Alokasi
          </h3>
        </div>

        {/* Target selector */}
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-mono"
            style={{ color: 'var(--as-text-dim)' }}
          >
            Bandingkan dengan:
          </span>
          <div className="flex gap-1.5">
            {availableTargets.map((s) => {
              const conf    = SCENARIO_CONFIG[s];
              const isActive = compareKey === s;
              return (
                <button
                  key={s}
                  onClick={() => setCompareKey(s)}
                  className={`text-[8px] font-mono font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-500 hover:bg-neutral-800/50"
                  }`}
                  style={isActive ? {} : { border: `1px solid var(--as-border-secondary)` }}
                >
                  {s.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-6">
        {!compareKey ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-500/[0.015] border border-slate-300/10 py-16 text-center font-mono">
            <svg className="w-14 h-14 mb-4 text-slate-400 dark:text-neutral-600 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-xs font-bold text-[var(--as-text-primary)] mb-2 uppercase tracking-widest">
              Bandingkan Alokasi Portofolio
            </div>
            <p className="text-[11px] text-[var(--as-text-secondary)] max-w-sm leading-relaxed mb-6">
              Silakan pilih salah satu target skenario di kanan atas untuk membandingkan Sharpe Ratio, alokasi aset, serta tingkat risiko secara real-time.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              {availableTargets.map((s) => (
                <button
                  key={s}
                  onClick={() => setCompareKey(s)}
                  className="text-[9px] font-mono font-bold px-3 py-2 rounded-lg border border-[var(--as-border-secondary)] text-[var(--as-text-secondary)] hover:bg-neutral-800/40 cursor-pointer transition-colors duration-150"
                >
                  Pilih {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Scenario headers — stronger contrast */}
            <div className="grid grid-cols-2 gap-0 rounded-2xl overflow-hidden mb-6"
                 style={{ border: '1px solid var(--as-border-primary)' }}>
              {[
                { config: leftConfig, data: activeData, label: '◉ AKTIF SEKARANG', side: 'left' },
                { config: rightConfig, data: compareData, label: '◎ PERBANDINGAN', side: 'right' },
              ].map(({ config, data, label, side }) => (
                <div
                  key={config.id}
                  className="p-6 text-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${config.color}15, transparent)`,
                    borderRight: side === 'left' ? '1px solid var(--as-border-secondary)' : 'none',
                  }}
                >
                  <div
                    className="text-[8px] font-mono tracking-[0.25em] uppercase mb-2"
                    style={{ color: config.color, opacity: 0.7 }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-[11px] font-bold font-mono mb-4"
                    style={{ color: config.color }}
                  >
                    {data.title}
                  </div>
                  <div
                    className="font-black font-mono tabular-nums leading-none"
                    style={{
                      fontSize: '48px',
                      color: config.color,
                      textShadow: `0 0 32px ${config.color}50`,
                    }}
                  >
                    {formatNumber(data.sharpe, 2)}
                  </div>
                  <div
                    className="text-[9px] font-mono mt-2"
                    style={{ color: 'var(--as-text-dim)' }}
                  >
                    Sharpe Ratio
                  </div>
                </div>
              ))}
            </div>

            {/* Sharpe diff — centered bridge */}
            <div
              className="flex items-center justify-center gap-4 py-3 px-5
                         rounded-xl mb-6"
              style={{ background: 'var(--as-bg-tertiary)' }}
            >
              <div
                className="w-8 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${leftConfig.color})`,
                }}
              />
              <div className="text-center">
                <div className="text-[8px] font-mono tracking-widest uppercase mb-0.5"
                     style={{ color: 'var(--as-text-dim)' }}>
                  Perbedaan Sharpe
                </div>
                <div
                  className="text-[22px] font-black font-mono tabular-nums"
                  style={{ color: sharpeDiff > 0 ? '#10b981' : sharpeDiff < 0 ? '#ef4444' : '#525252' }}
                >
                  {sharpeDiff > 0 ? '+' : ''}{formatNumber(sharpeDiff, 2)} σ
                </div>
              </div>
              <div
                className="w-8 h-px"
                style={{
                  background: `linear-gradient(90deg, ${rightConfig.color}, transparent)`,
                }}
              />
            </div>

            {/* Asset allocation comparison */}
            <div className="space-y-4">
              <div
                className="text-[9px] font-mono tracking-[0.2em] uppercase mb-4"
                style={{ color: 'var(--as-text-dim)' }}
              >
                PERBANDINGAN ALOKASI ASET
              </div>

              {assets.map((asset) => {
                const leftPct  = activeData.allocation[asset]  ?? 0;
                const rightPct = compareData.allocation[asset] ?? 0;
                const diff     = rightPct - leftPct;
                const color    = ASSET_COLORS[asset];

                return (
                  <div key={asset}>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: 'var(--as-text-secondary)' }}
                      >
                        {ASSET_LABELS[asset]}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: diff > 0 ? '#10b98115' : diff < 0 ? '#ef444415' : 'transparent',
                          color:      diff > 0 ? '#10b981'   : diff < 0 ? '#ef4444'   : 'var(--as-text-dim)',
                        }}
                      >
                        {diff > 0 ? '+' : ''}{diff}%
                      </span>
                    </div>

                    {/* Two bars side by side */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Left (active) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] font-mono" style={{ color: leftConfig.color }}>
                            {leftConfig.label.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-bold font-mono tabular-nums"
                                style={{ color }}>
                            {leftPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800/50 rounded-full overflow-hidden relative">
                          <div
                            className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700"
                            style={{ width: `${leftPct}%`, background: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>

                      {/* Right (compare) */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[8px] font-mono" style={{ color: rightConfig.color }}>
                            {rightConfig.label.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-bold font-mono tabular-nums"
                                style={{ color }}>
                            {rightPct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800/50 rounded-full overflow-hidden relative">
                          <div
                            className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700"
                            style={{ width: `${rightPct}%`, background: color, opacity: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk metrics comparison */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Max Drawdown',
                  left:  `${formatNumber(activeData.drawdown, 1)}%`,
                  right: `${formatNumber(compareData.drawdown, 1)}%`,
                  lowerIsBetter: true },
                { label: 'Volatilitas',
                  left:  `${formatNumber(activeData.volatility, 1)}%`,
                  right: `${formatNumber(compareData.volatility, 1)}%`,
                  lowerIsBetter: true },
                { label: 'Beta',
                  left:  `${formatNumber(activeData.beta, 2)}β`,
                  right: `${formatNumber(compareData.beta, 2)}β`,
                  lowerIsBetter: true },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-neutral-900/40 rounded-lg border border-white/5 p-3"
                >
                  <div
                    className="text-[8px] font-mono tracking-widest uppercase mb-3"
                    style={{ color: 'var(--as-text-dim)' }}
                  >
                    {metric.label}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px] font-bold font-mono"
                      style={{ color: leftConfig.color }}
                    >
                      {metric.left}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--as-text-dim)' }}>vs</span>
                    <span
                      className="text-[12px] font-bold font-mono"
                      style={{ color: rightConfig.color }}
                    >
                      {metric.right}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
