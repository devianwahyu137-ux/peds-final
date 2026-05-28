// src/lib/autoRetryEngine.js
// Exponential backoff retry system for failed API endpoints
// Prevents FALLBACK badges from persisting indefinitely
// Manages retry state without blocking UI thread

// Retry configuration per endpoint type
const RETRY_CONFIG = {
  fred:    { maxAttempts: 5, baseDelayMs: 30_000,  maxDelayMs: 300_000  },
  av:      { maxAttempts: 3, baseDelayMs: 60_000,  maxDelayMs: 600_000  },
  edge:    { maxAttempts: 4, baseDelayMs: 45_000,  maxDelayMs: 360_000  },
  default: { maxAttempts: 3, baseDelayMs: 60_000,  maxDelayMs: 300_000  },
};

// Retry state registry — key: endpoint key, value: retry state
const RETRY_STATE = new Map();

// Pending retry timers — key: endpoint key, value: setTimeout ID
const RETRY_TIMERS = new Map();

/**
 * scheduleRetry
 * Schedules an exponential backoff retry for a failed endpoint.
 *
 * @param {string} key          - endpoint identifier
 * @param {string} type         - "fred" | "av" | "edge" | "default"
 * @param {Function} retryFn    - async function to call on retry
 * @param {Function} onSuccess  - callback when retry succeeds
 * @param {Function} onExhausted - callback when all retries exhausted
 */
export function scheduleRetry(key, type, retryFn, onSuccess, onExhausted) {
  const config    = RETRY_CONFIG[type] ?? RETRY_CONFIG.default;
  const existing  = RETRY_STATE.get(key);
  const attempt   = existing ? existing.attempt + 1 : 1;

  if (attempt > config.maxAttempts) {
    // All retries exhausted
    RETRY_STATE.delete(key);
    clearRetryTimer(key);
    if (onExhausted) onExhausted(key);
    return;
  }

  // Exponential backoff with jitter
  const exponential = config.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter      = Math.random() * 0.3 * exponential; // ±30% jitter
  const delay       = Math.min(exponential + jitter, config.maxDelayMs);

  RETRY_STATE.set(key, {
    attempt,
    nextRetryAt: Date.now() + delay,
    type,
  });

  // Clear existing timer for this key
  clearRetryTimer(key);

  const timerId = setTimeout(async () => {
    if (!RETRY_STATE.has(key)) return; // Was cancelled

    try {
      const result = await retryFn();
      if (result && result.ok) {
        // Success — clear retry state
        RETRY_STATE.delete(key);
        clearRetryTimer(key);
        if (onSuccess) onSuccess(key, result);
      } else {
        // Failed again — schedule next retry
        scheduleRetry(key, type, retryFn, onSuccess, onExhausted);
      }
    } catch {
      scheduleRetry(key, type, retryFn, onSuccess, onExhausted);
    }
  }, delay);

  RETRY_TIMERS.set(key, timerId);
}

/**
 * cancelRetry
 * Cancels pending retry for a key (e.g., when data comes from Supabase).
 */
export function cancelRetry(key) {
  clearRetryTimer(key);
  RETRY_STATE.delete(key);
}

/**
 * cancelAllRetries
 * Cancels all pending retries — call on app unmount.
 */
export function cancelAllRetries() {
  RETRY_TIMERS.forEach((id) => clearTimeout(id));
  RETRY_TIMERS.clear();
  RETRY_STATE.clear();
}

/**
 * getRetryState
 * Returns current retry state for UI display.
 */
export function getRetryState(key) {
  return RETRY_STATE.get(key) ?? null;
}

/**
 * getRetryCountdown
 * Returns seconds until next retry for a given key.
 */
export function getRetryCountdown(key) {
  const state = RETRY_STATE.get(key);
  if (!state) return null;
  const remaining = Math.max(0, state.nextRetryAt - Date.now());
  return Math.ceil(remaining / 1000);
}

function clearRetryTimer(key) {
  const existing = RETRY_TIMERS.get(key);
  if (existing) {
    clearTimeout(existing);
    RETRY_TIMERS.delete(key);
  }
}
