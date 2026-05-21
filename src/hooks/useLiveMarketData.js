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
import { useDataStore } from "../stores/alphaShieldStore";
import { fetchSequentialWithAbort } from "../lib/apiFetcher";
import { buildLiveEngineParams } from "../lib/macroMappings";
import { runMPTEngine } from "../lib/mptEngine";
import { getCurrentPollingInterval } from "../lib/releaseWindows";

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
  const store = useDataStore();
  const { liveData, scenarioId, targetWeights, actualWeights, setLiveMetric, setEndpointStatus, macroInputs } = store;

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
  const scheduleNextCycle = useCallback(() => {
    if (!isMountedRef.current) return;

    // Abort any in-flight requests from previous cycle
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    // Execute the current fetch frame
    const runCycle = async () => {
      if (!isMountedRef.current || controller.signal.aborted) return;

      try {
        await fetchFnRef.current?.(controller.signal);
      } catch {
        // Swallow — individual fetch errors are handled inside fetchSequentialWithAbort
      }

      // Schedule next cycle with dynamic interval from release windows
      if (isMountedRef.current && !controller.signal.aborted) {
        const { interval } = getCurrentPollingInterval();
        timeoutRef.current = setTimeout(scheduleNextCycle, interval);
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
    scheduleNextCycle();

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
  }, [scheduleNextCycle]);

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
          scheduleNextCycle();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleNextCycle]);

  // ── Automated MPT analytics recalculation when liveData streams arrive ──────
  useEffect(() => {
    if (!liveData.dxy || !liveData.biRate) return;

    const liveParams = buildLiveEngineParams(liveData);

    const decMacro = {
      biRate: (liveData.biRate || macroInputs.biRate || 0) / 100,
      inflation: (liveData.cpi || liveData.inflation || macroInputs.inflation || 0) / 100,
      usdIdr: liveData.usdIdr ? (liveData.usdIdr / 1000) : (macroInputs.usdIdr || 0),
      sbn10y: (liveData.sbnYield10Y || macroInputs.sbn10y || 0) / 100,
      dxy: liveData.dxy || macroInputs.dxy || 0,

      // Inject DXY live multipliers
      dxyEquityAdj: liveParams.dxyEquityAdj,
      dxyBondsAdj: liveParams.dxyBondsAdj,
      dxyGoldAdj: liveParams.dxyGoldAdj,
      dxyCashAdj: liveParams.dxyCashAdj,
    };

    const decWeightsTarget = {
      stocks: (targetWeights.stocks || 0) / 100,
      bonds: (targetWeights.bonds || 0) / 100,
      gold: (targetWeights.gold || 0) / 100,
      cash: (targetWeights.cash || 0) / 100
    };

    const decWeightsActual = {
      stocks: (actualWeights.stocks || 0) / 100,
      bonds: (actualWeights.bonds || 0) / 100,
      gold: (actualWeights.gold || 0) / 100,
      cash: (actualWeights.cash || 0) / 100
    };

    const targetAnalytics = runMPTEngine(decWeightsTarget, scenarioId, decMacro);
    const actualAnalytics = runMPTEngine(decWeightsActual, scenarioId, decMacro);

    useDataStore.setState({
      targetAnalytics,
      actualAnalytics,
      analytics: {
        target: targetAnalytics,
        actual: actualAnalytics
      }
    });
  }, [liveData, scenarioId, targetWeights, actualWeights, macroInputs]);

  return { liveData };
}
