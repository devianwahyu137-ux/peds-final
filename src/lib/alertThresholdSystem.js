// src/lib/alertThresholdSystem.js
// In-app macro alert threshold management
// Persists to localStorage — no backend needed

const STORAGE_KEY = 'alphashield_alert_thresholds';

/**
 * The 4 monitored macro indicators.
 */
export const ALERT_INDICATORS = [
  {
    id:           'usdIdr',
    label:        'USD/IDR',
    icon:         '💱',
    defaultValue: 18000,
    unit:         '',
    description:  'Alert jika Rupiah melemah di atas level ini',
    direction:    'above',
    format:       v => v.toLocaleString('id-ID'),
  },
  {
    id:           'biRate',
    label:        'BI Rate',
    icon:         '🏦',
    defaultValue: 6.0,
    unit:         '%',
    description:  'Alert jika BI Rate naik di atas level ini',
    direction:    'above',
    format:       v => `${v}`,
  },
  {
    id:           'ihsg',
    label:        'IHSG',
    icon:         '📈',
    defaultValue: 5500,
    unit:         'pts',
    description:  'Alert jika IHSG jatuh di bawah level ini',
    direction:    'below',
    format:       v => v.toLocaleString('id-ID'),
  },
  {
    id:           'inflation',
    label:        'Inflasi YoY',
    icon:         '📊',
    defaultValue: 5.0,
    unit:         '%',
    description:  'Alert jika inflasi melampaui level ini',
    direction:    'above',
    format:       v => `${v}`,
  },
];

/**
 * Build default thresholds from indicator definitions.
 */
export function getDefaultThresholds() {
  return Object.fromEntries(
    ALERT_INDICATORS.map(ind => [
      ind.id,
      { value: ind.defaultValue, enabled: false },
    ])
  );
}

/**
 * Load thresholds from localStorage, merging with defaults.
 */
export function loadThresholds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultThresholds();
    return { ...getDefaultThresholds(), ...JSON.parse(saved) };
  } catch {
    return getDefaultThresholds();
  }
}

/**
 * Save thresholds to localStorage.
 */
export function saveThresholds(thresholds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
  } catch {
    // localStorage may be full or disabled — silently fail
  }
}

/**
 * Check which alerts are currently triggered.
 *
 * @param {object} thresholds - { [id]: { value, enabled } }
 * @param {object} currentData - { usdIdr, biRate, ihsg, inflation }
 * @returns {Array} - array of triggered alert descriptors
 */
export function checkAlerts(thresholds, currentData) {
  const triggered = [];

  for (const indicator of ALERT_INDICATORS) {
    const cfg = thresholds[indicator.id];
    if (!cfg?.enabled) continue;

    const current = currentData[indicator.id] ?? null;
    if (current === null) continue;

    const isTriggered = indicator.direction === 'above'
      ? current >= cfg.value
      : current <= cfg.value;

    if (isTriggered) {
      triggered.push({
        ...indicator,
        currentValue:   current,
        thresholdValue: cfg.value,
      });
    }
  }

  return triggered;
}
