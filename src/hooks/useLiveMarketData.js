/**
 * AlphaShield Live Market Data Hook
 * 
 * Re-engineered with:
 * - Recursive setTimeout lifecycle (no setInterval)
 * - useLayoutEffect mutable pointer for stable fetch reference
 * - Page Visibility API synchronization
 * - Dynamic polling intervals from releaseWindows
 * - AbortController integration for clean unmount cancellation
 * 
 * @module useLiveMarketData
 */

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useRootStore } from "@/stores/rootStore";
import { fetchSequentialWithAbort } from "../lib/apiFetcher";
import { buildLiveEngineParams } from "../lib/macroMappings";
import { runMPTEngine } from "../lib/mptEngine";
import { getCurrentPollingInterval } from "../lib/releaseWindows";
import { useSupabaseRealtimeData } from "./useSupabaseRealtimeData";

// ─── Transformers for data normalization ───────────────────────────────────────

const fredTransformer = (data) => {
  if (data?.observations?.length) {
    const val = parseFloat(data.observations[data.observations.length - 1].value);
    if (!isNaN(val)) return val;
  }
  throw new Error("FRED invalid data");
};

const avExchangeRateTransformer = (data) => {
  const rate = data?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];
  if (rate) return parseFloat(rate);
  throw new Error("AV Exchange Rate invalid data");
};

const avQuoteTransformer = (data) => {
  const price = data?.["Global Quote"]?.["05. price"];
  if (price) return parseFloat(price);
  throw new Error("AV Quote invalid");
};

const biRateTransformer = (data) => {
  if (data && typeof data.value === "number") return data.value;
  if (data && data.value) return parseFloat(data.value);
  throw new Error("BI Rate invalid data");
};

const cpiTransformer = (data) => {
  if (data && typeof data.value === "number") return data.value;
  if (data && data.value) return parseFloat(data.value);
  throw new Error("CPI Inflation invalid data");
};

const TRANSFORMERS = {
  fred: fredTransformer,
  avExchangeRate: avExchangeRateTransformer,
  avQuote: avQuoteTransformer,
  biRate: biRateTransformer,
  cpi: cpiTransformer
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useLiveMarketData() {
  // PRIMARY: Supabase Realtime (WebSocket push)
  // This resolves the FALLBACK badge issue permanently
  useSupabaseRealtimeData();

  // SECONDARY: Direct API polling (backup if Supabase unavailable)
  const setLiveMetric     = useRootStore((s) => s.setLiveMetric);
  const setEndpointStatus = useRootStore((s) => s.setEndpointStatus);

  // ── Mutable refs for stable lifecycle management ──
  const timeoutRef = useRef(null);
  const abortRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * useLayoutEffect mutable pointer — tracks the newest data execution frame
   * without re-triggering effect dependencies.
   */
  const fetchFnRef = useRef(null);

  useLayoutEffect(() => {
    fetchFnRef.current = async (signal) => {
      await fetchSequentialWithAbort(signal, setLiveMetric, setEndpointStatus, TRANSFORMERS);
    };
  });

  /**
   * Core recursive self-scheduling controller.
   * Replaces all setInterval loops with dynamic setTimeout chains.
   */
  const scheduleNextCycleCb = useCallback(function scheduleNextCycle() {
    if (!isMountedRef.current) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const runCycle = async () => {
      if (!isMountedRef.current || controller.signal.aborted) return;

      try {
        await fetchFnRef.current?.(controller.signal);
      } catch {
        // Swallow
      }

      if (isMountedRef.current && !controller.signal.aborted) {
        const { interval } = getCurrentPollingInterval();
        timeoutRef.current = setTimeout(() => scheduleNextCycle(), interval);
      }
    };

    runCycle();
  }, []);

  /**
   * Primary lifecycle effect — initializes the recursive polling controller.
   * Runs once on mount, cleans up on unmount.
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Kick off the initial fetch cycle
    scheduleNextCycleCb();

    return () => {
      isMountedRef.current = false;

      // Clear scheduled timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Abort any in-flight requests
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [scheduleNextCycleCb]);

  /**
   * Page Visibility API synchronization.
   * Dedicated useEffect container:
   * - document.hidden === true  → clearTimeout to freeze background polling
   * - Tab focus returns         → immediately invoke fetch loop and re-register timeout
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Freeze background polling activity
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        // Abort any in-flight network requests
        if (abortRef.current) {
          abortRef.current.abort();
          abortRef.current = null;
        }
      } else {
        // Tab is active again — immediately invoke fetch and re-register cycle
        if (isMountedRef.current) {
          scheduleNextCycleCb();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleNextCycleCb]);

  // ── Automated MPT analytics recalculation when liveData streams arrive ──────
  const liveData     = useRootStore((s) => s.liveData);
  const scenarioId   = useRootStore((s) => s.scenarioId);
  const macroInputs  = useRootStore((s) => s.macroInputs);
  const weights      = useRootStore((s) => s.weights);

  useEffect(() => {
    if (!liveData.dxy && !liveData.biRate && !liveData.bi_macro) return;

    try {
      const liveParams = buildLiveEngineParams(liveData);

      const biRateVal = liveData?.bi_macro?.biRate ?? liveData?.biRate?.v ?? macroInputs.biRate ?? 0;
      const cpiVal = liveData?.bi_macro?.cpi ?? liveData?.cpi?.v ?? macroInputs.inflation ?? 0;
      const usdIdrVal = liveData?.usdIdr?.v ?? (typeof liveData?.usdIdr === 'number' ? liveData.usdIdr : null) ?? macroInputs.usdIdr ?? 0;
      const sbn10yVal = liveData?.sbn_yields?.y10 ?? macroInputs.sbn10y ?? 0;
      const dxyVal = liveData?.dxy?.v ?? (typeof liveData?.dxy === 'number' ? liveData.dxy : null) ?? macroInputs.dxy ?? 0;

      const decMacro = {
        biRate: biRateVal / 100,
        inflation: cpiVal / 100,
        usdIdr: usdIdrVal > 1000 ? usdIdrVal / 1000 : usdIdrVal,
        sbn10y: sbn10yVal / 100,
        dxy: dxyVal,
        dxyEquityAdj: liveParams.dxyEquityAdj,
        dxyBondsAdj: liveParams.dxyBondsAdj,
        dxyGoldAdj: liveParams.dxyGoldAdj,
        dxyCashAdj: liveParams.dxyCashAdj,
      };

      const decWeights = {
        stocks: (weights?.stocks || 0) / 100,
        bonds: (weights?.bonds || 0) / 100,
        gold: (weights?.gold || 0) / 100,
        cash: (weights?.cash || 0) / 100
      };

      const analytics = runMPTEngine(decWeights, scenarioId, decMacro);

      if (analytics) {
        useRootStore.setState({
          analytics: {
            ...analytics,
            sharpe: analytics.sharpeRatio ?? 0,
            beta: analytics.portfolioBeta ?? 0,
            portfolioStdDev: analytics.portfolioVolatility ?? 0,
            estimatedMaxDrawdown: analytics.maxDrawdown ?? 0,
            expectedReturns: analytics.shockedReturns ?? {},
          }
        });
      }
    } catch (err) {
      console.error('[AlphaShield] Live MPT recalc error:', err.message);
    }
  }, [liveData, scenarioId, weights, macroInputs]);

  return { liveData };
}
