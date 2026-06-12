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

  // Arc SVG parameters
  const RADIUS  = 14;
  const CIRCUM  = 2 * Math.PI * RADIUS;
  const arcLen  = (health.score / 100) * CIRCUM * 0.75; // 270° arc
  const dashArr = `${arcLen} ${CIRCUM}`;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-[#121212] border border-white/10 rounded-md min-w-fit">
      {/* Mini arc gauge */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        <svg className="absolute inset-0 w-full h-full transform -rotate-135" viewBox="0 0 32 32">
          {/* Background track */}
          <circle cx="16" cy="16" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"
                  strokeDasharray={`${CIRCUM * 0.75} ${CIRCUM}`} />
          {/* Score arc */}
          <circle cx="16" cy="16" r={RADIUS} fill="none" stroke={health.color} strokeWidth="3"
                  strokeDasharray={dashArr} strokeLinecap="round"
                  className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="text-sm font-bold font-mono" style={{ color: health.color }}>
          {health.grade}
        </span>
      </div>

      {/* Score text */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold tracking-tight font-mono" style={{ color: health.color }}>
            {health.score}/100
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase opacity-70 font-sans" style={{ color: health.color }}>
            Estimasi
          </span>
        </div>
        <span className="text-[11px] font-sans text-neutral-500 whitespace-nowrap mt-0.5">
          <span className="font-mono">{counts.live}/{counts.total}</span> sumber aktif
        </span>
      </div>
    </div>
  );
}
