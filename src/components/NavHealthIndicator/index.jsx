// src/components/NavHealthIndicator/index.jsx
// Compact health gauge displayed in the top navbar
// Shows unified system health score + live/total count
// Replaces confusing per-endpoint status scattered in navbar

import { useMemo } from 'react';
import { useRootStore } from "@/stores/rootStore";
import { computeHealthScore, getLiveEndpointCount }
  from '@/lib/dataHealthScorer';

export function NavHealthIndicator() {
  const endpointStatus = useRootStore((s) => s.endpointStatus);
  const lastSyncAt     = useRootStore((s) => s.lastSyncAt);

  const health  = useMemo(
    () => computeHealthScore(endpointStatus),
    [endpointStatus]
  );
  const counts  = useMemo(
    () => getLiveEndpointCount(endpointStatus),
    [endpointStatus]
  );

  const syncAgo = lastSyncAt
    ? Math.floor((new Date().getTime() - lastSyncAt) / 1000)
    : null;

  const syncLabel = syncAgo === null
    ? '—'
    : syncAgo < 60
      ? `${syncAgo}d`
      : syncAgo < 3600
        ? `${Math.floor(syncAgo / 60)}m`
        : `${Math.floor(syncAgo / 3600)}j`;

  // Arc SVG parameters
  const RADIUS  = 14;
  const CIRCUM  = 2 * Math.PI * RADIUS;
  const arcLen  = (health.score / 100) * CIRCUM * 0.75; // 270° arc
  const dashArr = `${arcLen} ${CIRCUM}`;

  return (
    <div className="flex items-center gap-1 md:gap-3 px-1 md:px-3 py-1 rounded-lg
                    border border-slate-300 dark:border-neutral-800/50 cursor-default"
         style={{ background: 'var(--as-bg-secondary)' }}
         title={`Kesehatan Data: ${health.score}/100 — ${counts.live}/${counts.total} sumber aktif`}
    >
      {/* Mini arc gauge */}
      <div className="relative w-6 h-6 md:w-10 md:h-10 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-135" viewBox="0 0 32 32">
          {/* Background track */}
          <circle cx="16" cy="16" r={RADIUS} fill="none" stroke="var(--as-border-divider)" strokeWidth="3"
                  strokeDasharray={`${CIRCUM * 0.75} ${CIRCUM}`} />
          {/* Score arc */}
          <circle cx="16" cy="16" r={RADIUS} fill="none" stroke={health.color} strokeWidth="3"
                  strokeDasharray={dashArr} strokeLinecap="round"
                  className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="text-[10px] font-bold font-mono" style={{ color: health.color }}>
          {health.grade}
        </span>
      </div>

      {/* Score text */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[8px] md:text-xs font-bold font-mono tracking-tight" style={{ color: health.color }}>
            {health.score}
          </span>
          <span className="text-[9px] font-mono text-slate-400 dark:text-neutral-500">/100</span>
          <span className="text-[6px] md:text-[8px] font-mono font-bold tracking-widest ml-1 md:ml-2" style={{ color: health.color }}>
            {health.label}
          </span>
        </div>
        <div className="text-[6px] md:text-[8px] font-mono text-slate-400 dark:text-neutral-500 mt-0.5 whitespace-nowrap">
          {counts.live}/{counts.total} live · {syncLabel} ago
        </div>
      </div>
    </div>
  );
}
