// src/components/DataHealthPanel/index.jsx
// Transparent data status panel for MarketPage
// Shows per-endpoint health, TTL, and manual refresh option

import { useState, useEffect } from 'react';
import { Landmark, LineChart, Coins, Wallet, AlertTriangle, TrendingDown, TrendingUp, Shield, Activity, Settings2, Dices, ArrowRight, ActivitySquare } from "lucide-react";
import { useRootStore } from "@/stores/rootStore";

const ENDPOINT_REGISTRY = [
  {
    key:       'biRate',
    label:     'BI Rate & Inflasi',
    provider:  'Supabase Edge',
    icon:      <Landmark size={16} className="text-indigo-400" />,
    ttlMs:     60 * 60 * 1000,
    userLabel: 'Bank Indonesia / BPS',
  },
  {
    key:       'gs10',
    label:     'US 10Y Treasury',
    provider:  'FRED API',
    icon:      '🇺🇸',
    ttlMs:     15 * 60 * 1000,
    userLabel: 'Federal Reserve St. Louis',
  },
  {
    key:       'dxy',
    label:     'DXY Dollar Index',
    provider:  'FRED API',
    icon:      <Wallet size={16} className="text-emerald-400" />,
    ttlMs:     15 * 60 * 1000,
    userLabel: 'Federal Reserve St. Louis',
  },
  {
    key:       'usdIdr',
    label:     'USD/IDR Spot',
    provider:  'Alpha Vantage',
    icon:      '💱',
    ttlMs:     10 * 60 * 1000,
    userLabel: 'Alpha Vantage Markets',
  },
  {
    key:       'ihsg',
    label:     'IHSG Composite',
    provider:  'Alpha Vantage',
    icon:      <TrendingUp size={16} className="text-emerald-400" />,
    ttlMs:     10 * 60 * 1000,
    userLabel: 'Alpha Vantage Markets',
  },
  {
    key:       'sbn_yields',
    label:     'SBN Yield Curve',
    provider:  'Supabase Edge',
    icon:      '📋',
    ttlMs:     15 * 60 * 1000,
    userLabel: 'DJPPR / Kementerian Keuangan',
  },
];

const STATUS_CONFIG = {
  ok:       { dot: '#10b981', label: 'LIVE',     labelColor: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
  stale:    { dot: '#f59e0b', label: 'ESTIMASI', labelColor: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  fallback: { dot: '#f59e0b', label: 'ESTIMASI', labelColor: '#f59e0b', bg: 'rgba(245,158,11,0.06)'  },
  idle:     { dot: 'var(--as-text-dim)', label: 'MEMUAT',   labelColor: 'var(--as-text-tertiary)', bg: 'rgba(64,64,64,0.06)'    },
  loading:  { dot: '#3b82f6', label: 'MEMUAT',   labelColor: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
};

function formatAge(ms) {
  if (!ms) return '—';
  if (ms < 60000)    return `${Math.floor(ms / 1000)}d lalu`;
  if (ms < 3600000)  return `${Math.floor(ms / 60000)}m lalu`;
  return `${Math.floor(ms / 3600000)}j lalu`;
}


export function DataHealthPanel() {
  const endpointStatus = useRootStore((s) => s.endpointStatus);
  const liveData       = useRootStore((s) => s.liveData);
  const lastSyncAt     = useRootStore((s) => s.lastSyncAt);
  const [now, setNow] = useState(() => Date.now());

  // Tick every 10 seconds to update TTL displays
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, []);

  const liveCount = Object.values(endpointStatus).filter(s => s === 'ok').length;
  const total     = ENDPOINT_REGISTRY.length;
  const allLive   = liveCount === total;

  return (
    <div className="flex items-center justify-between px-6 py-3 rounded-xl mb-8"
         style={{ background: 'var(--as-bg-tertiary)' }}>
      <div className="flex items-center gap-3">
        {/* status dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full
                           rounded-full opacity-40"
                style={{ backgroundColor: allLive ? '#10b981' : '#f59e0b' }} />
          <span className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: allLive ? '#10b981' : '#f59e0b' }} />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-widest"
              style={{ color: 'var(--as-text-secondary)' }}>
          STATUS SUMBER DATA
        </span>
        <span className="text-[10px] font-mono"
              style={{ color: 'var(--as-text-dim)' }}>
          {liveCount}/{total} sumber aktif
        </span>
      </div>

      {/* Endpoint pills — horizontal, compact */}
      <div className="flex items-center gap-2 flex-wrap hidden md:flex">
        {ENDPOINT_REGISTRY.map((ep) => {
          const status = endpointStatus[ep.key] ?? 'idle';
          const isOk   = status === 'ok';
          return (
            <span key={ep.key}
                  className="text-[8px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1.5"
                  style={{
                    background: isOk ? 'rgba(16,185,129,0.10)' : 'var(--as-bg-secondary)',
                    color:      isOk ? '#10b981' : 'var(--as-text-dim)',
                  }}>
              <span>{ep.icon}</span> <span>{isOk ? 'LIVE' : status.toUpperCase()}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
