// src/components/MacroSentimentSummary/index.jsx
// Aggregated sentiment view combining news signals
// into a single directional bias indicator

import { useRootStore } from '@/stores/rootStore';

export const SENTIMENT_AGGREGATE = {
  EQUILIBRIUM: {
    overall:    'CONSTRUCTIVE',
    bullPct:    58,
    bearPct:    22,
    neutPct:    20,
    summary:    'Mayoritas sinyal pasar bersifat konstruktif. Ekuitas domestik mendapat dukungan dari stabilitas makro dan proyeksi laba korporasi yang solid.',
    signals: [
      { label: 'IHSG Momentum',    value: '+1.2%',  dir: 'up'   },
      { label: 'SBN Demand',       value: 'Kuat',   dir: 'up'   },
      { label: 'Rupiah Stability', value: 'Stabil', dir: 'flat' },
      { label: 'Asing Net Flow',   value: '+Beli',  dir: 'up'   },
    ],
  },
  TIGHTENING: {
    overall:    'CAUTIOUS',
    bullPct:    28,
    bearPct:    48,
    neutPct:    24,
    summary:    'Sentimen defensif mendominasi. Investor institusional merotasi keluar dari ekuitas berisiko menuju obligasi dan instrumen pasar uang.',
    signals: [
      { label: 'IHSG Momentum',    value: '-0.8%',   dir: 'down' },
      { label: 'SBN Demand',       value: 'Moderat', dir: 'flat' },
      { label: 'Rupiah Stability', value: 'Tertekan', dir: 'down' },
      { label: 'Asing Net Flow',   value: '-Jual',   dir: 'down' },
    ],
  },
  CURRENCY_STRESS: {
    overall:    'RISK-OFF',
    bullPct:    12,
    bearPct:    72,
    neutPct:    16,
    summary:    'Mode risk-off penuh. Modal mengalir ke aset safe haven. Emas dan USD menjadi tujuan utama. Pasar saham dan obligasi IDR dalam tekanan serentak.',
    signals: [
      { label: 'IHSG Momentum',    value: '-3.5%',   dir: 'down' },
      { label: 'SBN Demand',       value: 'Lemah',   dir: 'down' },
      { label: 'Rupiah Stability', value: 'Krisis',  dir: 'down' },
      { label: 'Asing Net Flow',   value: '-Keluar', dir: 'down' },
    ],
  },
};

export const OVERALL_STYLE = {
  CONSTRUCTIVE: { color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  CAUTIOUS:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'RISK-OFF':   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

export function MacroSentimentSummary() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const data   = SENTIMENT_AGGREGATE[scenarioId] ?? SENTIMENT_AGGREGATE.EQUILIBRIUM;
  const style  = OVERALL_STYLE[data.overall] ?? OVERALL_STYLE.CAUTIOUS;

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono font-bold">
            Agregat Sentimen Pasar
          </div>
          <div className="text-[10px] text-neutral-600 font-mono mt-0.5">
            Market Bias Indicator
          </div>
        </div>
        <span
          className="text-[9px] font-mono font-black px-2.5 py-1 rounded-lg border"
          style={{ color: style.color, borderColor: `${style.color}40`, background: style.bg }}
        >
          {data.overall}
        </span>
      </div>

      <div className="space-y-4">
        {/* Bull / Bear / Neutral bars */}
        <div className="space-y-2">
          {[
            { label: 'BULLISH',  pct: data.bullPct, color: '#10b981' },
            { label: 'BEARISH',  pct: data.bearPct, color: '#ef4444' },
            { label: 'NEUTRAL',  pct: data.neutPct, color: '#525252' },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-[8px] font-mono text-neutral-500 w-14 text-right uppercase tracking-wider">
                {label}
              </span>
              <div className="flex-1 h-2 bg-neutral-800/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-400 w-8 tabular-nums">
                {pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Summary text */}
        <div className="text-[10px] font-mono text-neutral-400 leading-relaxed p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/40">
          {data.summary}
        </div>

        {/* Signal grid */}
        <div className="grid grid-cols-2 gap-2">
          {data.signals.map((sig, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-800/40 bg-neutral-900/30">
              <span className="text-[9px] font-mono text-neutral-500">
                {sig.label}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] ${
                  sig.dir === 'up'   ? 'text-emerald-400'
                  : sig.dir === 'down' ? 'text-red-400'
                  : 'text-neutral-500'
                }`}>
                  {sig.dir === 'up' ? '↑' : sig.dir === 'down' ? '↓' : '→'}
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  sig.dir === 'up'   ? 'text-emerald-400'
                  : sig.dir === 'down' ? 'text-red-400'
                  : 'text-neutral-400'
                }`}>
                  {sig.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
