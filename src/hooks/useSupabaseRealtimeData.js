// src/hooks/useSupabaseRealtimeData.js
// Subscribes to Supabase Realtime for live macro data pushes
// Falls back gracefully if Supabase is unavailable

import { useEffect, useRef, useCallback } from 'react';
import { supabase, SUPABASE_KEY_MAP } from '../lib/supabaseClient';
import { useRootStore } from "@/stores/rootStore";

// Transform Supabase row → lean schema { v, d, t, src, ok }
function transformSupabaseRow(row) {
  return {
    v:   parseFloat(row.value)   || 0,
    d:   parseFloat(row.delta)   || 0,
    t:   new Date(row.fetched_at).getTime(),
    src: row.is_live ? 'supabase_live' : 'supabase_cache',
    ok:  row.is_live === true,
    _meta: row.metadata ?? {},
  };
}

export function useSupabaseRealtimeData() {
  const setLiveMetric     = useRootStore((s) => s.setLiveMetric);
  const setEndpointStatus = useRootStore((s) => s.setEndpointStatus);
  const channelRef        = useRef(null);
  const isMountedRef      = useRef(true);

  // Fetch all latest snapshots on mount (initial hydration)
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('macro_snapshots')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!data?.length) return;

      // Group by key — take only the latest per key
      const latestByKey = {};
      data.forEach((row) => {
        if (!latestByKey[row.key]) {
          latestByKey[row.key] = row;
        }
      });

      // Special handling: merge bi_rate + cpi into bi_macro
      const biRate = latestByKey['bi_rate'];
      const cpi    = latestByKey['cpi'];
      if (biRate || cpi) {
        const merged = {
          biRate: parseFloat(biRate?.value) || 6.0,
          cpi:    parseFloat(cpi?.value)    || 2.84,
          v:      parseFloat(biRate?.value) || 6.0,
          d:      0,
          t:      biRate ? new Date(biRate.fetched_at).getTime() : Date.now(),
          src:    (biRate?.is_live || cpi?.is_live) ? 'supabase_live' : 'supabase_cache',
          ok:     biRate?.is_live === true || cpi?.is_live === true,
        };
        if (isMountedRef.current) setLiveMetric('bi_macro', merged);
      }

      // Process other keys
      Object.entries(latestByKey).forEach(([key, row]) => {
        if (key === 'bi_rate' || key === 'cpi') return; // handled above
        const storeKey = SUPABASE_KEY_MAP[key];
        if (!storeKey || !isMountedRef.current) return;
        setLiveMetric(storeKey, transformSupabaseRow(row));
      });

    } catch (err) {
      console.warn('[useSupabaseRealtimeData] Hydration failed:', err.message);
      // Silently fail — existing fallback data remains
    }
  }, [setLiveMetric]);

  // Subscribe to realtime changes
  const subscribeToRealtime = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('macro_snapshots_changes')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'macro_snapshots',
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const row      = payload.new;
          const storeKey = SUPABASE_KEY_MAP[row.key];

          if (!storeKey) return;

          // Special merge for bi_macro
          if (row.key === 'bi_rate' || row.key === 'cpi') {
            // Re-hydrate to get combined state
            hydrateFromSupabase();
            return;
          }

          setLiveMetric(storeKey, transformSupabaseRow(row));
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        if (status === 'SUBSCRIBED') {
          console.info('[AlphaShield] Supabase Realtime connected ✓');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[AlphaShield] Supabase Realtime disconnected:', status);
        }
      });

    channelRef.current = channel;
  }, [setLiveMetric, hydrateFromSupabase]);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial data load
    hydrateFromSupabase();

    // Subscribe to realtime pushes
    subscribeToRealtime();

    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
}
