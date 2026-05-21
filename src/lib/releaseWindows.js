/**
 * AlphaShield Release Windows — System Context Module
 * 
 * Determines the optimal polling interval based on the current WIB time
 * and known economic data release windows (BI Rate, US Macro, BPS CPI).
 * 
 * @module releaseWindows
 */

const RELEASE_WINDOWS = [
  {
    id: "BI_RATE",
    days: [4], // Thursday
    startHour: 13, startMinute: 45,
    endHour: 15, endMinute: 0,
    interval: 180000 // 3 minutes
  },
  {
    id: "US_MACRO",
    days: [1, 2, 3, 4, 5], // Monday–Friday
    startHour: 19, startMinute: 20,
    endHour: 21, endMinute: 30,
    interval: 180000 // 3 minutes
  },
  {
    id: "BPS_CPI",
    days: [1, 2, 3], // Monday–Wednesday
    startHour: 11, startMinute: 0,
    endHour: 12, endMinute: 30,
    interval: 300000 // 5 minutes
  }
];

const DEFAULT_INTERVAL = 3600000; // 60 minutes

/**
 * Resolve the current WIB (UTC+7) date components.
 * Uses Intl.DateTimeFormat for timezone-safe resolution.
 */
function getWIBComponents() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    weekday: "short"
  });

  const parts = formatter.formatToParts(now);
  const hourPart = parts.find(p => p.type === "hour");
  const minutePart = parts.find(p => p.type === "minute");
  const weekdayPart = parts.find(p => p.type === "weekday");

  const hour = parseInt(hourPart?.value ?? "0", 10);
  const minute = parseInt(minutePart?.value ?? "0", 10);

  // Map weekday abbreviation to ISO day number (1=Mon ... 7=Sun)
  const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const dayOfWeek = dayMap[weekdayPart?.value] ?? 0;

  return { hour, minute, dayOfWeek };
}

/**
 * Check if the current WIB time falls inside a given release window.
 */
function isInsideWindow(wib, window) {
  if (!window.days.includes(wib.dayOfWeek)) return false;

  const currentMinutes = wib.hour * 60 + wib.minute;
  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Returns the current polling interval based on active release windows.
 * 
 * @returns {{ interval: number, windowId: string|null, isHot: boolean }}
 *   - interval: Polling interval in milliseconds
 *   - windowId: Active window identifier, or null if outside all windows
 *   - isHot: true if inside any release window
 */
export function getCurrentPollingInterval() {
  const wib = getWIBComponents();

  for (const window of RELEASE_WINDOWS) {
    if (isInsideWindow(wib, window)) {
      return {
        interval: window.interval,
        windowId: window.id,
        isHot: true
      };
    }
  }

  return {
    interval: DEFAULT_INTERVAL,
    windowId: null,
    isHot: false
  };
}
