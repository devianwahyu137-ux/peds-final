// src/components/EfficientFrontier/MonteCarloPanel.jsx
// Container panel integrating simulation hook + frontier chart + summary stats

import { useState } from 'react';
import { useAlphaShieldStore } from '../../stores/alphaShieldStore';
import { useMonteCarloSimulation } from '../../hooks/useMonteCarloSimulation';
import { EfficientFrontierChart } from './EfficientFrontierChart';
import { SimulationProgressBar } from './SimulationProgressBar.jsx';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';

const CAPITAL_PRESETS = [
  { label: '10 Juta',  value: 10_000_000  },
  { label: '50 Juta',  value: 50_000_000  },
  { label: '100 Juta', value: 100_000_000 },
  { label: '500 Juta', value: 500_000_000 },
  { label: '1 Miliar', value: 1_000_000_000 },
];

function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n);
}

export function MonteCarloPanel() {
  const scenarioId      = useAlphaShieldStore((s) => s.scenarioId);
  const targetAnalytics = useAlphaShieldStore((s) => s.targetAnalytics);
  const config          = SCENARIO_CONFIG[scenarioId];
  const [capital, setCapital]   = useState(100_000_000);
  const [inputVal, setInputVal] = useState('100000000');

  const { result, status, progress, error, runSimulation, setCapital: setHookCapital } =
    useMonteCarloSimulation(capital);

  // Map store analytics to currentPortfolio for the frontier chart
  // Store values are decimals — convert to percentages for display
  const currentPortfolio = targetAnalytics ? {
    riskPct:   (targetAnalytics.portfolioVolatility ?? 0) * 100,
    returnPct: (targetAnalytics.portfolioReturn ?? 0) * 100,
    sharpe:    targetAnalytics.sharpeRatio ?? 0,
  } : null;

  const handleCapitalChange = (val) => {
    const cleaned = val.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      setInputVal(cleaned);
      setCapital(num);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">

      {/* Panel header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎲</span>
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase font-mono">
              Monte Carlo Simulation Engine
            </span>
          </div>
          <div className="text-[9px] font-mono text-neutral-600">
            1.000 simulasi × 252 hari perdagangan · Geometric Brownian Motion
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {status === 'running' && (
            <span className="text-[9px] font-mono text-amber-400 animate-pulse">
              SIMULASI BERJALAN...
            </span>
          )}
          <button
            onClick={() => { setHookCapital(capital); runSimulation(capital); }}
            disabled={status === 'running'}
            className="text-[9px] font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer"
            style={{
              background:  status === 'running' ? 'rgba(0,0,0,0.4)' : (config?.colorDim ?? 'rgba(16,185,129,0.12)'),
              borderColor: status === 'running' ? '#333' : (config?.colorBorder ?? 'rgba(16,185,129,0.30)'),
              color:       status === 'running' ? '#404040' : (config?.color ?? '#10b981'),
              opacity:     status === 'running' ? 0.5 : 1,
            }}
          >
            {status === 'running' ? '⟳ MEMPROSES...' : '▶ JALANKAN SIMULASI'}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">

        {/* Capital input */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
            Modal Awal:
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-600">
                Rp
              </span>
              <input
                type="text"
                value={parseInt(inputVal || '0').toLocaleString('id-ID')}
                onChange={(e) => handleCapitalChange(e.target.value)}
                className="bg-black border border-neutral-800/70 rounded-lg pl-8 pr-3 py-2 text-white font-mono text-xs tabular-nums focus:outline-none w-40"
                style={{ borderColor: (config?.colorBorder ?? 'rgba(16,185,129,0.30)') + '80' }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {CAPITAL_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setCapital(p.value); setInputVal(String(p.value)); }}
                  className="text-[8px] font-mono px-2 py-1 rounded-md border transition-colors duration-100 cursor-pointer"
                  style={{
                    background:  capital === p.value ? (config?.colorDim ?? 'rgba(16,185,129,0.12)') : 'rgba(0,0,0,0.4)',
                    borderColor: capital === p.value ? (config?.color ?? '#10b981') : '#333',
                    color:       capital === p.value ? (config?.color ?? '#10b981') : '#525252',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SimulationProgressBar progress={progress} status={status} />

        {/* Simulation summary stats */}
        {result?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Median 1 Tahun',
                value: formatIDR(result.summary.median),
                sub:   `${result.summary.medianReturnPct > 0 ? '+' : ''}${result.summary.medianReturnPct}%`,
                color: '#10b981',
              },
              {
                label: 'Skenario Terbaik (P95)',
                value: formatIDR(result.summary.bestCase),
                sub:   `+${result.summary.bestReturnPct}%`,
                color: '#3b82f6',
              },
              {
                label: 'Skenario Terburuk (P5)',
                value: formatIDR(result.summary.worstCase),
                sub:   `${result.summary.worstReturnPct}%`,
                color: '#ef4444',
              },
              {
                label: 'Probabilitas Rugi',
                value: `${result.summary.probOfLoss}%`,
                sub:   'dari 1.000 simulasi',
                color: result.summary.probOfLoss > 30 ? '#ef4444'
                      : result.summary.probOfLoss > 15 ? '#f59e0b'
                      : '#10b981',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg p-3 space-y-1"
                style={{ background: 'rgba(10,10,10,0.50)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">
                  {stat.label}
                </div>
                <div className="text-sm font-black font-mono tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[9px] font-mono text-neutral-500">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Efficient Frontier Chart */}
        <div className="space-y-2">
          <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
            Peta Efisiensi Portofolio — Efficient Frontier
          </div>
          <div className="text-[9px] font-mono text-neutral-600 leading-relaxed">
            Setiap titik = satu kombinasi alokasi aset acak.
            Titik berwarna hijau = paling efisien (Sharpe tinggi).
            Titik berpendar = posisi portofolio kamu saat ini.
          </div>
          <EfficientFrontierChart
            frontierPoints={result?.frontierPoints ?? []}
            currentPortfolio={currentPortfolio}
          />
        </div>

        {/* Error state */}
        {status === 'error' && (
          <div className="text-[10px] font-mono text-red-400 p-3 rounded-lg border border-red-900/40 bg-red-950/10">
            Error simulasi: {error}. Coba jalankan ulang.
          </div>
        )}

        {/* Idle state */}
        {status === 'idle' && !result && (
          <div className="text-center text-[10px] font-mono text-neutral-600 py-8 tracking-wider">
            Klik "JALANKAN SIMULASI" untuk memulai analisis probabilistik
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[8px] font-mono text-neutral-700 leading-relaxed">
          * Simulasi Monte Carlo menggunakan Geometric Brownian Motion
          dengan asumsi return dan volatilitas dari MPT engine.
          Hasil adalah distribusi probabilistik, bukan prediksi pasti.
          Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  );
}
