// src/components/SectorPlaybook/SectorCard.jsx
import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { STANCE_CONFIG, RISK_SIGNALS } from '@/lib/sectorPlaybookData';

export function SectorCard({ sector }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = useCallback(() => setIsExpanded(p => !p), []);

  const stanceConf = STANCE_CONFIG[sector.stance]   ?? STANCE_CONFIG.NEUTRAL;
  const riskConf   = RISK_SIGNALS[sector.riskLevel] ?? RISK_SIGNALS.MEDIUM;

  return (
    <div className="!p-0 overflow-hidden transition-all duration-200 border border-white/5 bg-[#121212] rounded-xl">
      {/* Card header button — overflow safe */}
      <button
        onClick={toggle}
        className="w-full text-left p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-[#1a1a1a] transition-colors gap-4 min-w-0"
      >
        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-lg shrink-0">
            {sector.icon}
          </div>

          {/* Text — must have min-w-0 to allow truncation */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-slate-800 dark:text-neutral-200 truncate">
                {sector.sector}
              </span>
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 shrink-0"
                style={{ color: stanceConf.color, backgroundColor: stanceConf.bg, borderColor: stanceConf.border }}
              >
                <span>{stanceConf.icon}</span> <span>{stanceConf.label}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-neutral-500 uppercase tracking-widest font-mono min-w-0">
              <span className="truncate">Target Alokasi: <span className="font-bold text-slate-700 dark:text-neutral-300">{sector.targetPct}%</span></span>
              <span className="shrink-0">•</span>
              <span className="shrink-0" style={{ color: riskConf.color }}>{riskConf.label}</span>
            </div>
          </div>
        </div>

        {/* Ticker count + expand chevron */}
        <div className="flex items-center gap-4 ml-13 md:ml-0 text-xs font-mono text-slate-400 dark:text-neutral-500 shrink-0">
          <span>{sector.tickers.length} instrumen</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* ── EXPANDED DETAIL ── */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/10 space-y-5 animate-fadeIn">
          {/* Rationale */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-neutral-500 mb-2 tracking-widest uppercase">
              RATIONALE
            </div>
            <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
              {sector.rationale}
            </p>
          </div>

          {/* Catalysts + Risks — 2 column */}
          {(sector.catalysts.length > 0 || sector.risks.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Catalysts */}
              {sector.catalysts.length > 0 && (
                <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                  <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    ▲ KATALIS
                  </div>
                  <ul className="space-y-1.5">
                    {sector.catalysts.map((c, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-neutral-300 flex items-start gap-1.5">
                        <span className="text-emerald-500 mt-0.5">›</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {sector.risks.length > 0 && (
                <div className="p-3 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
                  <div className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    ▼ RISIKO
                  </div>
                  <ul className="space-y-1.5">
                    {sector.risks.map((r, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-neutral-300 flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ticker grid */}
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-neutral-500 mb-3 tracking-widest uppercase">
              INSTRUMEN REPRESENTATIF
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sector.tickers.map((ticker, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black/20 flex gap-3">
                  {/* Ticker badge */}
                  <div className="pt-1">
                    <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                      {ticker.code}
                    </span>
                  </div>

                  {/* Ticker info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-sm text-slate-800 dark:text-neutral-200 truncate">
                        {ticker.name}
                      </div>
                      <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 whitespace-nowrap">
                        {ticker.weight}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-neutral-400 leading-snug">
                      {ticker.note}
                    </div>
                    {ticker.marketCap && (
                      <div className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 pt-1">
                        Cap/Min: {ticker.marketCap}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
