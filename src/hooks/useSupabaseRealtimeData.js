// src/hooks/useSupabaseRealtimeData.js
// Subscribes to Supabase Realtime for live macro data pushes from the macro_data table
// Falls back gracefully if Supabase is unavailable

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRootStore } from "@/stores/rootStore";

export function useSupabaseRealtimeData() {
  const channelRef        = useRef(null);
  const isMountedRef      = useRef(true);

  // Fetch all latest snapshots on mount (initial hydration)
  const hydrateFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('macro_data')
        .select('metric, value, updated_at');

      if (error) throw error;
      if (!data?.length) return;

      // Map rows by metric
      const metricsMap = {};
      data.forEach((row) => {
        metricsMap[row.metric] = row;
      });

      useRootStore.setState((state) => {
        const usdIdrRow = metricsMap['usd_idr'];
        const goldRow = metricsMap['gold_usd'];

        if (usdIdrRow) {
          const usdVal = parseFloat(usdIdrRow.value);
          const t = new Date(usdIdrRow.updated_at).getTime();

          state.macro.usdIdr = usdVal;
          state.macroInputs.usdIdr = usdVal;
          state.liveData.usdIdr = {
            v: usdVal,
            t: t,
            ok: true,
            src: 'supabase_live'
          };
          state.endpointStatus.usdIdr = 'ok';
        }

        if (goldRow) {
          const goldVal = parseFloat(goldRow.value);
          const t = new Date(goldRow.updated_at).getTime();

          state.macro.gold = goldVal;
          if (state.macroInputs) {
            state.macroInputs.gold = goldVal;
          }
          state.liveData.xauUsd = {
            v: goldVal,
            t: t,
            ok: true,
            src: 'supabase_live'
          };
          state.endpointStatus.xauUsd = 'ok';
        }
      });
    } catch (err) {
      console.warn('[useSupabaseRealtimeData] Hydration failed:', err.message);
      // Fallback is handled automatically as store initial state contains estimated defaults
    }
  }, []);

  // Subscribe to realtime changes on the macro_data table
  const subscribeToRealtime = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('macro_data_realtime_changes')
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'macro_data',
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const row = payload.new;
          if (!row) return;

          const val = parseFloat(row.value);
          const t = new Date(row.updated_at).getTime();

          useRootStore.setState((state) => {
            if (row.metric === 'usd_idr') {
              state.macro.usdIdr = val;
              state.macroInputs.usdIdr = val;
              state.liveData.usdIdr = {
                v: val,
                t: t,
                ok: true,
                src: 'supabase_live'
              };
              state.endpointStatus.usdIdr = 'ok';
            }
            if (row.metric === 'gold_usd') {
              state.macro.gold = val;
              if (state.macroInputs) {
                state.macroInputs.gold = val;
              }
              state.liveData.xauUsd = {
                v: val,
                t: t,
                ok: true,
                src: 'supabase_live'
              };
              state.endpointStatus.xauUsd = 'ok';
            }
          });
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return;
        if (status === 'SUBSCRIBED') {
          console.info('[AlphaShield] Supabase Realtime connected for macro_data ✓');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[AlphaShield] Supabase Realtime disconnected:', status);
        }
      });

    channelRef.current = channel;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial load
    hydrateFromSupabase();

    // Subscribe to realtime changes
    subscribeToRealtime();

    // Refresh dynamically every 5 minutes as a fallback check
    const intervalId = setInterval(() => {
      if (isMountedRef.current) {
        hydrateFromSupabase();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [hydrateFromSupabase, subscribeToRealtime]);
}
