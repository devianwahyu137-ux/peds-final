// src/components/TearSheet/TearSheetDocument.jsx
// Hidden DOM element that gets captured by html2canvas
// Rendered off-screen — never visible to user during normal usage
// Contains complete portfolio snapshot: scenario, allocation, MPT metrics,
// Monte Carlo summary, and disclaimer

import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';

const ASSET_COLORS = {
  stocks: '#3b82f6',
  bonds:  '#a78bfa',
  gold:   '#fbbf24',
  cash:   '#34d399',
};

const ASSET_LABELS = {
  stocks: 'Equities (IDX)',
  bonds:  'Fixed Income (SBN)',
  gold:   'Precious Metals (Gold)',
  cash:   'Liquidity (Cash / USD)',
};

export function TearSheetDocument() {
  const scenarioId  = useRootStore((s) => s.scenarioId);
  const weights     = useRootStore((s) => s.weights);
  const analytics   = useRootStore((s) => s.analytics);
  const macroInputs = useRootStore((s) => s.macroInputs);
  const config      = SCENARIO_CONFIG[scenarioId];

  const now     = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const ASSETS = ['stocks', 'bonds', 'gold', 'cash'];

  return (
    <div
      id="tear-sheet-render"
      style={{
        display:         'none',      // hidden by default, shown during capture
        width:           '794px',     // A4 width at 96dpi
        minHeight:       '560px',
        backgroundColor: '#000000',
        color:           '#e5e5e5',
        fontFamily:      '"Courier New", Courier, monospace',
        padding:         '32px',
        boxSizing:       'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ borderBottom: '1px solid #262626', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>
              ALPHASHIELD · PEDS CORE SYSTEM v3.6
            </div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
              PORTFOLIO TEAR SHEET
            </div>
            <div style={{ fontSize: '10px', color: '#737373', marginTop: '4px' }}>
              Macro-Driven Asset Allocation Report · {dateStr} · {timeStr} WIB
            </div>
          </div>
          <div style={{
            border: `1px solid ${config?.colorBorder ? config.colorBorder : config?.color ? config.color + '40' : '#333'}`,
            background: config?.colorDim ? config.colorDim : config?.color ? config.color + '15' : '#111',
            padding: '8px 16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '8px', color: '#525252', letterSpacing: '2px', textTransform: 'uppercase' }}>SKENARIO AKTIF</div>
            <div style={{ fontSize: '14px', fontWeight: '900', color: config?.color ?? '#10b981', marginTop: '2px' }}>
              {config?.label ?? scenarioId}
            </div>
            <div style={{ fontSize: '8px', color: (config?.color ?? '#10b981') + 'aa', marginTop: '2px' }}>{config?.riskLevel ?? ''}</div>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN MAIN CONTENT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Col 1: Macro Indicators */}
        <div>
          <div style={{ fontSize: '8px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            MACRO INDICATORS
          </div>
          {[
            { label: 'BI Rate',       value: `${macroInputs?.biRate ?? 5.25}%`  },
            { label: 'Inflasi YoY',   value: `${macroInputs?.inflation ?? 3.48}%` },
            { label: 'USD/IDR',       value: (macroInputs?.usdIdr ?? 17700).toLocaleString('id-ID') },
            { label: 'SBN 10Y',       value: '6.71%'  },
            { label: 'US 10Y UST',    value: '4.40%'  },
            { label: 'DXY Index',     value: '104.50 pts' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: '9px', color: '#737373' }}>{label}</span>
              <span style={{ fontSize: '9px', color: '#e5e5e5', fontWeight: '700' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Col 2: Asset Allocation */}
        <div>
          <div style={{ fontSize: '8px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            ASSET ALLOCATION
          </div>
          {ASSETS.map((asset) => {
            const pct   = weights?.[asset] ?? 0;
            const color = ASSET_COLORS[asset];
            return (
              <div key={asset} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '9px', color: color }}>{ASSET_LABELS[asset]}</span>
                  <span style={{ fontSize: '9px', color: color, fontWeight: '900' }}>{pct}%</span>
                </div>
                <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Col 3: MPT Analytics */}
        <div>
          <div style={{ fontSize: '8px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            MPT ANALYTICS ENGINE
          </div>
          {[
            { label: 'Sharpe Ratio',   value: `${(analytics?.sharpe ?? 0).toFixed(2)} σ`,           color: config?.color ?? '#10b981' },
            { label: 'Portfolio Beta',  value: `${(analytics?.beta ?? 0).toFixed(2)} β`,              color: '#a78bfa'    },
            { label: 'Max Drawdown',    value: `-${Math.abs(analytics?.estimatedMaxDrawdown ?? 0).toFixed(1)}%`, color: '#ef4444'    },
            { label: 'Volatilitas σ',   value: `${(analytics?.portfolioStdDev ?? 0).toFixed(1)}%`,   color: '#f59e0b'    },
            { label: 'E(Return)',       value: `${(analytics?.portfolioReturn ?? 0).toFixed(1)}%`,   color: '#10b981'    },
            { label: 'Risk-Free Rate',  value: `${(analytics?.riskFreeRate ?? 0).toFixed(2)}%`,       color: '#737373'    },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: '9px', color: '#737373' }}>{label}</span>
              <span style={{ fontSize: '9px', color, fontWeight: '900' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── EXECUTION STRATEGY ── */}
      <div style={{ border: '1px solid #1a1a1a', borderRadius: '8px', padding: '12px', marginBottom: '16px', background: '#0a0a0a' }}>
        <div style={{ fontSize: '8px', color: '#525252', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
          EXECUTION STRATEGY · {scenarioId}
        </div>
        <div style={{ fontSize: '9px', color: '#a3a3a3', lineHeight: '1.6' }}>
          {scenarioId === 'EQUILIBRIUM' &&
            'Maintain 40% allocation to top-tier IDX banking & consumer staples (BBCA, BMRI, ICBP) for growth. Hold 30% in Government Bonds (SBN FR series) for baseline yield. 10% Physical Gold as portfolio insurance. 20% Liquidity buffer.'
          }
          {scenarioId === 'TIGHTENING' &&
            'Scale back equities to 15% — high capital costs squeeze corporate margins. Aggressively rotate into SBN (ORI/SR/FR) to lock in risk-free yields above policy rate. 15% Gold hedge against IDR pressure. 25% Cash for opportunistic deployment.'
          }
          {scenarioId === 'CURRENCY_STRESS' &&
            'WEALTH PRESERVATION MODE: Shift 45% into Physical Gold to hedge domestic inflation spiral. Convert 35% into USD or hard currency Liquidity. Maintain only 5% defensive equities (commodity exporters) and 15% short-duration SBN.'
          }
        </div>
      </div>

      {/* ── FOOTER DISCLAIMER ── */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '12px' }}>
        <div style={{ fontSize: '7px', color: '#404040', lineHeight: '1.5', textAlign: 'center' }}>
          EDUCATIONAL SIMULATION MODEL ONLY · NOT INVESTMENT ADVICE · COMPLIANT WITH OJK SIMULATION FRAMEWORK STANDARDS
          · PEDS ALPHASHIELD ENGINE v3.6 · ALL DATA IS HYPOTHETICAL FOR SIMULATION DEMONSTRATION PURPOSES
          · DATA MAKRO BERSIFAT ESTIMASI BERDASARKAN KONDISI PASAR MEI 2026 · KONSULTASIKAN KEPUTUSAN INVESTASI DENGAN ADVISOR KEUANGAN TERDAFTAR OJK
        </div>
      </div>
    </div>
  );
}
