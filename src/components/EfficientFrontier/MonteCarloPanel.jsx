// src/components/EfficientFrontier/MonteCarloPanel.jsx
// Container panel integrating simulation worker + frontier chart + summary stats

import { useState, useEffect, useRef } from 'react';
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore } from "@/stores/rootStore";
import { EfficientFrontierChart } from './EfficientFrontierChart';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';
import { formatNumber, formatIDR } from "@/utils/format";
import MonteCarloWorker from '../../workers/monteCarloWorker?worker';

const CAPITAL_PRESETS = [
  { label: '10 Juta',  value: 10_000_000  },
  { label: '50 Juta',  value: 50_000_000  },
  { label: '100 Juta', value: 100_000_000 },
  { label: '500 Juta', value: 500_000_000 },
  { label: '1 Miliar', value: 1_000_000_000 },
];

// Fallback matrices if store is still syncing
const FALLBACK_EXPECTED_RETURNS = { stocks: 0.12, bonds: 0.065, gold: 0.08, cash: 0.045 };
const FALLBACK_COV_MATRIX = [
  [ 0.0324, -0.0162, -0.0135, 0.0000],
  [-0.0162,  0.0036,  0.0090, 0.0003],
  [-0.0135,  0.0090,  0.0225, 0.0003],
  [ 0.0000,  0.0003,  0.0003, 0.0001],
];

// Scenario-based return floors for realistic simulation
// Even in crisis, portfolio has some expected return
const SCENARIO_RETURN_FLOOR = {
  EQUILIBRIUM:     8.5,
  TIGHTENING:      6.0,
  CURRENCY_STRESS: 4.5,  // Gold + USD still provide positive real return
};

// Scenario-specific expected return (mu) and volatility (sigma) multipliers for realistic Monte Carlo paths
const SCENARIO_MC_MULTIPLIERS = {
  EQUILIBRIUM:     { mu: 1.0, sigma: 1.0 },
  TIGHTENING:      { mu: 0.8, sigma: 1.2 },
  CURRENCY_STRESS: { mu: 0.3, sigma: 2.5 },
  HIPERINFLASI:     { mu: 0.1, sigma: 3.0 },
  RUPIAH_CRASH:     { mu: 0.0, sigma: 3.5 },
};

export function MonteCarloPanel() {
  const scenarioId      = useRootStore((s) => s.scenarioId);
  const crisisMode      = useRootStore((s) => s.crisisMode);
  const targetAnalytics = useRootStore((s) => s.targetAnalytics);
  const analytics       = useRootStore((s) => s.analytics);
  const effectiveScenarioId = crisisMode
    ? (crisisMode === 'HYPERINFLATION' ? 'HIPERINFLASI' : crisisMode)
    : scenarioId;
  const config          = SCENARIO_CONFIG[effectiveScenarioId] || SCENARIO_CONFIG.EQUILIBRIUM;
  
  const [capital, setCapital]   = useState(100_000_000);
  const [inputVal, setInputVal] = useState('100000000');

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const workerRef = useRef(null);

  // Use targetAnalytics with fallback to analytics
  const effectiveAnalytics = targetAnalytics || analytics;

  // Map store analytics to currentPortfolio for the frontier chart
  const currentPortfolio = effectiveAnalytics ? {
    riskPct:   (effectiveAnalytics.portfolioVolatility ?? 0) * 100,
    returnPct: (effectiveAnalytics.portfolioReturn ?? 0) * 100,
    sharpe:    effectiveAnalytics.sharpeRatio ?? 0,
  } : null;

  const handleCapitalChange = (val) => {
    const cleaned = val.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      setInputVal(cleaned);
      setCapital(num);
    }
  };

  const handleRunSimulation = () => {
    // ── ROBUST NORMALIZATION ──────────────────────────────────
    // portfolioReturn from store may be in decimal form (0.085 = 8.5%)
    // but the worker expects percentage (8.5). Normalize here.
    const rawReturn  = effectiveAnalytics?.portfolioReturn ?? 0;
    const rawStdDev  = effectiveAnalytics?.portfolioStdDev
                    ?? effectiveAnalytics?.portfolioVolatility ?? 0;

    // Normalize: values < 1 are likely decimals, convert to percent
    // E.g.: 0.085 → 8.5, but 8.5 → 8.5 (already correct)
    const normReturn = rawReturn < 1 && rawReturn > 0
      ? rawReturn * 100
      : rawReturn;
    const normStdDev = rawStdDev < 1 && rawStdDev > 0
      ? rawStdDev * 100
      : rawStdDev;

    // Apply scenario-based minimums for realistic simulation
    const baseReturn = normReturn > 0.1
      ? normReturn
      : (SCENARIO_RETURN_FLOOR[effectiveScenarioId] ?? 6.0);

    const baseStdDev = normStdDev > 0.1
      ? normStdDev
      : 10.0; // default 10% volatility if calculation fails

    // Apply scenario-specific multipliers
    const mult = SCENARIO_MC_MULTIPLIERS[effectiveScenarioId] ?? SCENARIO_MC_MULTIPLIERS.EQUILIBRIUM;
    const finalReturn = baseReturn * mult.mu;
    const finalStdDev = baseStdDev * mult.sigma;

    // ── SAFE EXPECTED RETURNS & COVARIANCE ────────────────────
    const expReturns = effectiveAnalytics?.expectedReturns;
    const covMx      = effectiveAnalytics?.covMatrix;

    const safeExpReturns = (expReturns && typeof expReturns === 'object' && Object.keys(expReturns).length > 0)
      ? expReturns
      : FALLBACK_EXPECTED_RETURNS;

    const safeCovMatrix = (Array.isArray(covMx) && covMx.length === 4)
      ? covMx
      : FALLBACK_COV_MATRIX;

    setIsCalculating(true);
    setError(null);
    setResult(null);

    // Terminate existing worker if user clicks again while running
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // Instantiate Web Worker directly
    const worker = new MonteCarloWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, result: wResult, error: wError } = e.data;
      if (type === 'SUCCESS') {
        setResult(wResult);
      } else if (type === 'ERROR') {
        setError(wError);
      }
      setIsCalculating(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = (evt) => {
      console.error('[Web Worker Error]:', evt.message || 'Unknown worker initialization error');
      setError('Gagal memuat Worker Simulasi. Pastikan path import.meta.url benar.');
      setIsCalculating(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({
      portfolioReturn:  finalReturn,
      portfolioStdDev:  finalStdDev,
      initialCapital:   capital,
      numSimulations:   1000,
      horizonDays:      252,
      expectedReturns:  safeExpReturns,
      covMatrix:        safeCovMatrix,
    });
  };

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return (
    <div className="card-tier-1 !p-0 overflow-hidden">

      {/* Panel header */}
      <div className="p-5 pb-3 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base"><Dices size={16} className="text-slate-400" /></span>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 uppercase font-mono">
              <GlossaryTerm termId="monteCarlo">Monte Carlo</GlossaryTerm> Simulation Engine
            </span>
          </div>
          <div className="text-[9px] font-mono text-neutral-600">
            1.000 simulasi × 252 hari perdagangan · Geometric Brownian Motion
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isCalculating && (
            <span className="text-[9px] font-mono text-emerald-400 animate-pulse tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded">
              ENGINE RUNNING: CALCULATING PROBABILITIES...
            </span>
          )}
          <button
            onClick={handleRunSimulation}
            disabled={isCalculating}
            className="text-[9px] font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer"
            style={{
              background:  isCalculating ? 'var(--as-bg-tertiary)' : (config?.colorDim ?? 'rgba(16,185,129,0.12)'),
              borderColor: isCalculating ? '#333' : (config?.colorBorder ?? 'rgba(16,185,129,0.30)'),
              color:       isCalculating ? 'var(--as-text-dim)' : (config?.color ?? '#10b981'),
              opacity:     isCalculating ? 0.5 : 1,
            }}
          >
            {isCalculating ? '⟳ MEMPROSES...' : '▶ JALANKAN SIMULASI'}
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
                value={capital ? formatIDR(capital) : ''}
                onChange={(e) => handleCapitalChange(e.target.value)}
                disabled={isCalculating}
                className="bg-slate-50 dark:bg-black border border-slate-300 dark:border-neutral-800/70 rounded-lg pl-8 pr-3 py-2 text-slate-900 dark:text-white font-mono text-xs tabular-nums focus:outline-none w-40 disabled:opacity-50"
                style={{ borderColor: (config?.colorBorder ?? 'rgba(16,185,129,0.30)') + '80' }}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {CAPITAL_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setCapital(p.value); setInputVal(String(p.value)); }}
                  disabled={isCalculating}
                  className="text-[8px] font-mono px-2 py-1 rounded-md border transition-colors duration-100 cursor-pointer disabled:opacity-50"
                  style={{
                    background:  capital === p.value ? (config?.colorDim ?? 'rgba(16,185,129,0.12)') : 'var(--as-bg-tertiary)',
                    borderColor: capital === p.value ? (config?.color ?? '#10b981') : '#333',
                    color:       capital === p.value ? (config?.color ?? '#10b981') : 'var(--as-text-tertiary)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation summary stats */}
        {result?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Median 1 Tahun',
                value: `Rp ${formatIDR(result.summary.median)}`,
                sub:   `${result.summary.medianReturnPct > 0 ? '+' : ''}${formatNumber(result.summary.medianReturnPct, 2)}%`,
                color: '#10b981',
              },
              {
                label: 'Proyeksi Stokastik P95',
                value: `Rp ${formatIDR(result.summary.bestCase)}`,
                sub:   `+${formatNumber(result.summary.bestReturnPct, 2)}%`,
                color: '#3b82f6',
              },
              {
                label: 'Proyeksi Stokastik P5',
                value: `Rp ${formatIDR(result.summary.worstCase)}`,
                sub:   `${result.summary.worstReturnPct > 0 ? '+' : ''}${formatNumber(result.summary.worstReturnPct, 2)}%`,
                color: '#ef4444',
              },
              {
                label: 'Probabilitas Rugi',
                value: `${formatNumber(result.summary.probOfLoss, 1)}%`,
                sub:   'dari 1.000 simulasi',
                color: result.summary.probOfLoss > 30 ? '#ef4444'
                      : result.summary.probOfLoss > 15 ? '#f59e0b'
                      : '#10b981',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-6 flex flex-col gap-2"
                style={{ background: 'var(--as-bg-secondary)', border: '1px solid var(--as-border-primary)' }}
              >
                <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-sans font-bold">
                  {stat.label}
                </div>
                <div className="text-xl md:text-3xl font-mono font-bold tracking-tighter tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Efficient Frontier Chart */}
        <div className="space-y-2">
          <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
            Peta Efisiensi Portofolio — <GlossaryTerm termId="efficientFrontier">Efficient Frontier</GlossaryTerm>
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
        {error && (
          <div className="text-[10px] font-mono text-red-400 p-3 rounded-lg border border-red-900/40 bg-red-950/10">
            Error simulasi: {error}. Coba jalankan ulang.
          </div>
        )}

        {/* Idle state */}
        {!isCalculating && !result && !error && (
          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-500/[0.015] border border-slate-300/10 py-12">
            <svg className="w-14 h-14 mb-4 text-slate-400 dark:text-neutral-600 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              {/* Distribution curve + charts */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18M3 20c1.5-3.5 3-7 5.5-7s3 4 5 4 4-11 7.5-11" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 14v2m3-5v5m3-3v3m3-6v6m3-9v9m3-12v12" opacity={0.3} />
            </svg>
            <div className="text-center text-[10px] font-mono text-[var(--as-text-secondary)] uppercase tracking-[0.15em] leading-relaxed max-w-sm">
              Klik <span className="text-slate-800 dark:text-white font-bold">JALANKAN SIMULASI</span> untuk memulai analisis 1.000 skenario portofoliomu
            </div>
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
