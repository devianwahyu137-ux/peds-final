// src/components/PortfolioStoryPanel/index.jsx
// COMPLETE FILE — narrativo panel with What-If simulator

import { useState, useMemo } from 'react';
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore } from '@/stores/rootStore';
import { SCENARIO_CONFIG } from '@/lib/scenarioPulse';
import {
  narrateSharpRatio,
  narrateBeta,
  narrateMaxDrawdown,
  narrateVolatility,
} from '@/lib/portfolioNarrator';

const WHAT_IF_PRESETS = [
  { label: '+25bps', delta: 25  },
  { label: '+50bps', delta: 50  },
  { label: '+100bps', delta: 100 },
  { label: '-25bps', delta: -25 },
  { label: '-50bps', delta: -50 },
];

function generateWhatIfImpact(currentSharpe, biRateDelta) {
  const impact      = -(biRateDelta / 100) * 0.15;
  const newSharpe   = Math.max(0, currentSharpe + impact).toFixed(2);
  const abs         = Math.abs(biRateDelta);
  return {
    newSharpe,
    interpretation: biRateDelta > 0
      ? `Jika BI Rate naik ${abs}bps lagi (dari 5.25% saat ini), estimasi Sharpe turun dari ${currentSharpe?.toFixed(2)} ke ${newSharpe}. Tekanan berlanjut pada ekuitas dan obligasi jangka panjang.`
      : `Jika BI Rate turun ${abs}bps, estimasi Sharpe naik dari ${currentSharpe?.toFixed(2)} ke ${newSharpe}. Positif untuk ekuitas dan obligasi jangka menengah.`,
  };
}

export function PortfolioStoryPanel() {
  const scenarioId = useRootStore((s) => s.scenarioId);
  const analytics  = useRootStore((s) => s.analytics);
  const [selectedDelta, setSelectedDelta] = useState(25);
  const config = SCENARIO_CONFIG[scenarioId];
  const { sharpe, beta, estimatedMaxDrawdown, portfolioStdDev } = analytics ?? {};

  const whatIf = useMemo(
    () => sharpe != null ? generateWhatIfImpact(sharpe, selectedDelta) : null,
    [sharpe, selectedDelta]
  );

  const STORY_METRICS = [
    {
      id: 'sharpe', icon: '⚡', label: 'Efisiensi Portofolio',
      value: sharpe?.toFixed(2) ?? '—', unit: 'σ',
      narrative: sharpe != null ? narrateSharpRatio(sharpe, scenarioId) : '',
    },
    {
      id: 'beta', icon: '🧭', label: 'Sensitivitas Pasar',
      value: beta?.toFixed(2) ?? '—', unit: 'β',
      narrative: beta != null ? narrateBeta(beta) : '',
    },
    {
      id: 'mdd', icon: <Shield size={16} className="text-blue-400" />, label: 'Risiko Penurunan Maks',
      value: estimatedMaxDrawdown != null
        ? `-${Math.abs(estimatedMaxDrawdown).toFixed(1)}` : '—',
      unit: '%',
      narrative: estimatedMaxDrawdown != null
        ? narrateMaxDrawdown(estimatedMaxDrawdown) : '',
    },
    {
      id: 'vol', icon: <Activity size={16} className="text-slate-400" />, label: 'Volatilitas Portofolio',
      value: portfolioStdDev?.toFixed(1) ?? '—', unit: '%',
      narrative: portfolioStdDev != null
        ? narrateVolatility(portfolioStdDev, scenarioId) : '',
    },
  ];

  if (!analytics) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full" style={{ background: config.color }} />
        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
          Narasi Portofolio
        </div>
      </div>

      {STORY_METRICS.map((m) => (
        <div key={m.id}
             className="rounded-xl p-4 border border-slate-300 dark:border-neutral-800/40"
             style={{ background: 'rgba(10,10,10,0.6)' }}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg">{m.icon}</span>
            <span className="text-xl font-black font-mono tabular-nums"
                  style={{ color: config.color }}>
              {m.value}
            </span>
            <span className="text-xs font-mono text-neutral-600">{m.unit}</span>
            <span className="text-[9px] font-mono text-neutral-600 uppercase
                             tracking-widest ml-auto">
              {m.label}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 leading-relaxed">
            {m.narrative}
          </p>
        </div>
      ))}

      {/* What-If Simulator */}
      <div className="rounded-xl border overflow-hidden"
           style={{ borderColor: config.color + '30', background: config.color + '08' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: config.color + '20' }}>
          <div className="text-[9px] font-mono font-bold tracking-widest uppercase"
               style={{ color: config.color }}>
            🔮 Simulasi What-If — Perubahan BI Rate
          </div>
          <div className="text-[9px] font-mono text-slate-400 dark:text-neutral-500 mt-0.5">
            Konteks: BI Rate saat ini 5.25% (naik 50bps Mei 2026)
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {WHAT_IF_PRESETS.map((p) => (
              <button key={p.label} onClick={() => setSelectedDelta(p.delta)}
                      className="text-[9px] font-mono px-2.5 py-1.5 rounded-lg border
                                 transition-all duration-150 cursor-pointer"
                      style={{
                        background:  selectedDelta === p.delta ? config.color + '20' : 'rgba(0,0,0,0.4)',
                        borderColor: selectedDelta === p.delta ? config.color : 'rgba(255,255,255,0.08)',
                        color:       selectedDelta === p.delta ? config.color : '#525252',
                      }}>
                {p.label}
              </button>
            ))}
          </div>
          {whatIf && (
            <p className="text-[10px] font-mono text-slate-700 dark:text-neutral-300 leading-relaxed">
              {whatIf.interpretation}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <div className="text-center">
              <div className="text-[7px] font-mono text-neutral-700 uppercase">Saat Ini</div>
              <div className="text-base font-black font-mono text-slate-700 dark:text-neutral-300">
                {sharpe?.toFixed(2)}σ
              </div>
            </div>
            <div className="flex-1 h-px"
                 style={{ background: `linear-gradient(90deg, ${config.color}40, ${config.color})` }} />
            <div className="text-center">
              <div className="text-[7px] font-mono text-neutral-700 uppercase">Estimasi Baru</div>
              <div className="text-base font-black font-mono" style={{ color: config.color }}>
                {whatIf?.newSharpe}σ
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[8px] font-mono text-neutral-700 leading-relaxed">
        * Simulasi What-If menggunakan elastisitas MPT yang disederhanakan.
        Bukan proyeksi akurat — hanya referensi edukasi.
        Konteks aktual: BI Rate sudah naik ke 5.25% per 20 Mei 2026.
      </p>
    </div>
  );
}
