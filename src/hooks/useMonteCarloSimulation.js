// src/hooks/useMonteCarloSimulation.js
// UPGRADED: uses ComputeWorkerPool, supports cancellation,
// streaming progress, and auto-trigger on scenario change

import { useState, useEffect, useRef, useCallback } from 'react';
import { workerPool } from '../workers/computeWorkerPool.js';
import { useAnalytics, useScenarioId } from '../stores/selectors.js';

export function useMonteCarloSimulation(initialCapital = 100_000_000) {
  const analytics       = useAnalytics();
  const scenarioId      = useScenarioId();
  const [result,    setResult]    = useState(null);
  const [frontier,  setFrontier]  = useState(null);
  const [status,    setStatus]    = useState('idle');
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState(null);

  const cancelMCRef   = useRef(null);
  const cancelFRRef   = useRef(null);
  const isMountedRef  = useRef(true);
  const capitalRef    = useRef(initialCapital);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cancelMCRef.current?.();
      cancelFRRef.current?.();
    };
  }, []);

  const runSimulation = useCallback(async (capital) => {
    if (!analytics) return;
    const cap = capital ?? capitalRef.current;
    capitalRef.current = cap;

    // Cancel any running jobs
    cancelMCRef.current?.();
    cancelFRRef.current?.();

    setStatus('running');
    setProgress(0);
    setError(null);

    try {
      // Run Monte Carlo and Frontier in parallel
      const mcJob = workerPool.submit(
        'monteCarlo',
        {
          portfolioReturn:  analytics.portfolioReturn ?? 8,
          portfolioStdDev:  analytics.portfolioStdDev ?? 10,
          initialCapital:   cap,
          numSimulations:   1000,
          horizonDays:      252,
          expectedReturns:  analytics.expectedReturns ?? null,
          covMatrix:        analytics.covMatrix ?? null,
        },
        (prog) => {
          if (isMountedRef.current) {
            setProgress(Math.min(50, prog * 0.5)); // MC = 0-50%
          }
        }
      );

      const frJob = workerPool.submit(
        'frontier',
        {
          expectedReturns: analytics.expectedReturns ?? null,
          covMatrix:       analytics.covMatrix ?? null,
          numPoints:       400,
        },
        (prog) => {
          if (isMountedRef.current) {
            setProgress((p) => Math.min(99, p + prog * 0.5)); // FR = 50-100%
          }
        }
      );

      cancelMCRef.current = mcJob.cancel;
      cancelFRRef.current = frJob.cancel;

      const [mcResult, frResult] = await Promise.all([
        mcJob.promise,
        frJob.promise,
      ]);

      if (!isMountedRef.current) return;

      setResult({ ...mcResult, frontierPoints: frResult });
      setFrontier(frResult);
      setProgress(100);
      setStatus('complete');
      setError(null);

    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.message?.includes('cancel')) return; // cancelled — not an error
      setError(err.message);
      setStatus('error');
    }
  }, [analytics?.portfolioReturn, analytics?.portfolioStdDev,
      analytics?.expectedReturns]);

  // Auto-trigger when scenario changes or on first analytics load
  const prevScenarioRef = useRef(null);
  useEffect(() => {
    if (!analytics) return;
    if (prevScenarioRef.current !== scenarioId) {
      prevScenarioRef.current = scenarioId;
      runSimulation();
    } else if (status === 'idle') {
      runSimulation();
    }
  }, [scenarioId, analytics?.portfolioReturn]);

  return {
    result, frontier, status, progress, error,
    runSimulation,
    setCapital: (cap) => { capitalRef.current = cap; },
  };
}
