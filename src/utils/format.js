/**
 * src/utils/format.js
 * Centralized formatting helpers using Indonesian formatting convention:
 * - dot (.) for thousands separator
 * - comma (,) for decimal separator
 */

/**
 * Format IDR values without decimals and without currency prefix (e.g. 17.925)
 * @param {number|string} value
 * @returns {string}
 */
export function formatIDR(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format general numbers with specific decimal places (e.g. 5,25)
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentages with specific decimal places (e.g. 3,48%)
 * @param {number|string} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 2) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return '—';
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
  return `${formatted}%`;
}

/**
 * Format index points like DXY or IHSG with up to 2 decimal places and thousands separator (e.g. 6.170 or 104,5)
 * @param {number|string} value
 * @returns {string}
 */
export function formatPoints(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
