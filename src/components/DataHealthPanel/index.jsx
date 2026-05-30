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
  idle:     { dot: '#404040', label: 'MEMUAT',   labelColor: '#525252', bg: 'rgba(64,64,64,0.06)'    },
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
    <div className="glass-card rounded-xl p-4 space-y-4 mb-6">

      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            {allLive && (
              <div
                className="absolute w-5 h-5 rounded-full animate-ping"
                style={{ backgroundColor: 'rgba(16,185,129,0.30)' }}
              />
            )}
            <div
              className="w-2.5 h-2.5 rounded-full relative z-10"
              style={{
                backgroundColor: allLive ? '#10b981' : '#f59e0b',
                boxShadow: allLive ? '0 0 8px #10b981' : '0 0 6px #f59e0b',
              }}
            />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-neutral-400 uppercase font-mono">
            Status Sumber Data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
            {liveCount}/{total} sumber aktif
          </span>
          {lastSyncAt > 0 && (
            <span className="text-[9px] font-mono text-neutral-600">
              · sinkronisasi {formatAge(now - lastSyncAt)}
            </span>
          )}
        </div>
      </div>

      {/* Info bar for non-live data */}
      {!allLive && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <span className="text-[10px] mt-0.5">ℹ</span>
          <span className="text-[10px] font-mono text-amber-200/70 leading-relaxed">
            Beberapa data menggunakan estimasi terakhir yang tersimpan.
            Angka tetap valid sebagai referensi analisis.
          </span>
        </div>
      )}

      {/* Endpoint rows */}
      <div className="space-y-1">
        {ENDPOINT_REGISTRY.map((ep) => {
          const status  = endpointStatus[ep.key] ?? 'idle';
          const cfg     = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
          const data    = liveData[ep.key];
          const dataTimestamp = (typeof data === 'object' && data !== null) ? data.t : null;
          const age     = dataTimestamp ? now - dataTimestamp : null;
          const ttlLeft = ep.ttlMs - (age ?? ep.ttlMs);
          const ttlPct  = Math.max(0, Math.min(100, (ttlLeft / ep.ttlMs) * 100));

          // Extract numeric value for display
          let displayValue = null;
          if (typeof data === 'object' && data !== null) {
            displayValue = data.v ?? data.value ?? null;
          } else if (typeof data === 'number') {
            displayValue = data;
          }

          return (
            <div
              key={ep.key}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.02]"
              style={{ background: cfg.bg }}
            >
              {/* Status dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: cfg.dot,
                  boxShadow: status === 'ok' ? `0 0 6px ${cfg.dot}` : 'none',
                }}
              />

              {/* Icon */}
              <span className="text-sm flex-shrink-0">{ep.icon}</span>

              {/* Names + TTL bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300 truncate">
                    {ep.label}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-600 truncate hidden sm:inline">
                    via {ep.userLabel}
                  </span>
                </div>
                {/* TTL progress bar */}
                {status === 'ok' && (
                  <div className="h-[2px] w-full bg-white dark:bg-neutral-900 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${ttlPct}%`,
                        backgroundColor: ttlPct > 50 ? '#10b981' : ttlPct > 20 ? '#f59e0b' : '#ef4444',
                        transition: 'width 10s linear',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Value preview */}
              <div className="text-right flex-shrink-0 w-20">
                {displayValue != null ? (
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300 tabular-nums">
                    {typeof displayValue === 'number'
                      ? displayValue.toLocaleString('id-ID', { maximumFractionDigits: 2 })
                      : displayValue}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-700">—</span>
                )}
              </div>

              {/* Status badge */}
              <span
                className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  color: cfg.labelColor,
                  background: cfg.bg,
                  border: `1px solid ${cfg.dot}22`,
                }}
              >
                {cfg.label}
              </span>

              {/* Age */}
              <span className="text-[9px] font-mono text-neutral-600 w-12 text-right flex-shrink-0">
                {age ? formatAge(age) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
