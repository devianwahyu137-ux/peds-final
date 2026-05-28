// src/hooks/usePortfolioPersistence.js
// Manages session save/load lifecycle
// Auto-saves every 30 seconds + on scenario/weight changes (debounced 2s)

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAlphaShieldStore } from '../stores/alphaShieldStore';
import {
  persistSessionState,
  loadSessionState,
  clearSessionState,
  hasSavedSession,
} from '../lib/persistenceEngine';

const AUTO_SAVE_INTERVAL = 30_000; // Save every 30 seconds

export function usePortfolioPersistence() {
  const scenarioId     = useAlphaShieldStore((s) => s.scenarioId);
  const targetWeights  = useAlphaShieldStore((s) => s.targetWeights);
  const setScenario    = useAlphaShieldStore((s) => s.setScenario);
  const setWeightBulk  = useAlphaShieldStore((s) => s.setWeightBulk);

  const [savedSession, setSavedSession]   = useState(null);
  const [showBanner, setShowBanner]       = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const autoSaveRef  = useRef(null);
  const isMountedRef = useRef(true);

  // Check for saved session on mount
  useEffect(() => {
    isMountedRef.current = true;

    async function checkSession() {
      const session = await loadSessionState();
      if (!isMountedRef.current) return;

      if (session) {
        setSavedSession(session);
        setShowBanner(true);
      }
      setIsLoading(false);
    }

    checkSession();
    return () => { isMountedRef.current = false; };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      persistSessionState({
        scenarioId,
        weights: targetWeights,
      });
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSaveRef.current);
  }, [scenarioId, targetWeights]);

  // Save on scenario/weight changes (debounced 2s)
  const saveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSessionState({
        scenarioId,
        weights: targetWeights,
      });
    }, 2000);
    return () => clearTimeout(saveTimerRef.current);
  }, [scenarioId, targetWeights]);

  // Resume saved session
  const resumeSession = useCallback(() => {
    if (!savedSession) return;
    if (savedSession.scenarioId) setScenario(savedSession.scenarioId);
    if (savedSession.weights && setWeightBulk) setWeightBulk(savedSession.weights);
    setShowBanner(false);
  }, [savedSession, setScenario, setWeightBulk]);

  // Dismiss without resuming
  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  // Clear all saved data
  const clearSession = useCallback(async () => {
    await clearSessionState();
    setShowBanner(false);
    setSavedSession(null);
  }, []);

  return {
    savedSession,
    showBanner,
    isLoading,
    resumeSession,
    dismissBanner,
    clearSession,
  };
}
