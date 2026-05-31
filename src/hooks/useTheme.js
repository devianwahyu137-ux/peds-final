// src/hooks/useTheme.js
// Theme management hook — persists preference to localStorage
// Toggles data-theme attribute on document.documentElement
// All components use this hook to read/toggle theme

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'alphashield_theme';
const VALID_THEMES = ['dark', 'light'];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved)) return saved;
  } catch {}
  // Default to dark — matches the finance terminal aesthetic
  return 'dark';
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme'); // dark is the :root default
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply on mount and changes
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (VALID_THEMES.includes(newTheme)) setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
