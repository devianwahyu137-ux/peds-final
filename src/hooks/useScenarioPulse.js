// src/hooks/useScenarioPulse.js
// Detects scenario changes and triggers overlay + animations

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlphaShieldStore } from '../stores/alphaShieldStore';

export function useScenarioPulse() {
  const scenarioId      = useAlphaShieldStore((s) => s.scenarioId);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevScenarioRef = useRef(null);
  const isFirstMount    = useRef(true);

  useEffect(() => {
    // Skip overlay on first mount — only trigger on actual changes
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevScenarioRef.current = scenarioId;
      return;
    }

    if (prevScenarioRef.current !== scenarioId) {
      prevScenarioRef.current = scenarioId;

      // Trigger transition sequence
      setIsTransitioning(true);
      setShowOverlay(true);

      // End transition state after CSS animations complete
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
  }, [scenarioId]);

  const dismissOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  return { showOverlay, isTransitioning, dismissOverlay, scenarioId };
}
