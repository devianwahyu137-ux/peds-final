import { useState } from 'react';
import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';

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
  const [compareKey, setCompareKey] = useState(
    activeKey === 'TIGHTENING' ? 'CURRENCY_STRESS' : 'TIGHTENING'
  );

  const allScenarios = ['EQUILIBRIUM', 'TIGHTENING', 'CURRENCY_STRESS'];
  const availableTargets = allScenarios.filter(s => s !== activeKey);

  const activeData = scenarioData[activeKey] || scenarioData['EQUILIBRIUM'];
  const compareData = scenarioData[compareKey] || scenarioData['TIGHTENING'];

  const leftConfig  = SCENARIO_CONFIG[activeKey] || SCENARIO_CONFIG['EQUILIBRIUM'];
  const rightConfig = SCENARIO_CONFIG[compareKey] || SCENARIO_CONFIG['TIGHTENING'];
  const assets      = ['stocks', 'bonds', 'gold', 'cash'];

  const sharpeDiff = activeData.sharpe - compareData.sharpe;

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
        {/* Scenario headers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { config: leftConfig, data: activeData, label: 'AKTIF SEKARANG', side: 'left' },
            { config: rightConfig, data: compareData, label: 'PERBANDINGAN', side: 'right' },
          ].map(({ config, data, label }) => (
            <div
              key={config.id}
              className="bg-neutral-900/40 rounded-lg border border-white/5 p-4 text-center"
            >
              <div
                className="text-[8px] font-mono tracking-widest uppercase mb-1"
                style={{ color: 'var(--as-text-dim)' }}
              >
                {label}
              </div>
              <div
                className="text-sm font-bold font-mono mb-2"
                style={{ color: config.color }}
              >
                {data.title}
              </div>
              <div
                className="text-[32px] font-black font-mono tabular-nums leading-none"
                style={{ color: config.color }}
              >
                {data.sharpe.toFixed(2)}
              </div>
              <div
                className="text-[8px] font-mono mt-1"
                style={{ color: 'var(--as-text-dim)' }}
              >
                Sharpe Ratio
              </div>
            </div>
          ))}
        </div>

        {/* Sharpe diff indicator */}
        <div
          className="flex items-center justify-center gap-3 mb-6 py-3 rounded-xl"
          style={{ background: 'var(--as-bg-tertiary)' }}
        >
          <span className="text-[10px] font-mono" style={{ color: 'var(--as-text-secondary)' }}>
            Perbedaan Sharpe:
          </span>
          <span
            className="text-[16px] font-black font-mono tabular-nums"
            style={{ color: sharpeDiff > 0 ? '#10b981' : sharpeDiff < 0 ? '#ef4444' : '#525252' }}
          >
            {sharpeDiff > 0 ? '+' : ''}{sharpeDiff.toFixed(2)} σ
          </span>
          <span className="text-[9px] font-mono" style={{ color: 'var(--as-text-dim)' }}>
            {sharpeDiff > 0
              ? `${leftConfig.label} lebih efisien`
              : sharpeDiff < 0
                ? `${rightConfig.label} lebih efisien`
                : 'Efisiensi setara'
            }
          </span>
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
              left:  `${activeData.drawdown.toFixed(1)}%`,
              right: `${compareData.drawdown.toFixed(1)}%`,
              lowerIsBetter: true },
            { label: 'Volatilitas',
              left:  `${activeData.volatility.toFixed(1)}%`,
              right: `${compareData.volatility.toFixed(1)}%`,
              lowerIsBetter: true },
            { label: 'Beta',
              left:  `${activeData.beta.toFixed(2)}β`,
              right: `${compareData.beta.toFixed(2)}β`,
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
      </div>
    </div>
  );
}
