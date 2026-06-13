import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'alphashield_theme';

export function useTheme() {
  const theme = 'dark';
  const isDark = true;

  // Apply default dark theme on mount and keep local storage synced
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme'); // default is dark theme
    try {
      localStorage.setItem(STORAGE_KEY, 'dark');
    } catch {}
  }, []);

  const setTheme = useCallback(() => {
    // No-op to prevent light mode activation
  }, []);

  const toggleTheme = useCallback(() => {
    // No-op to prevent light mode activation
  }, []);

  return { theme, setTheme, toggleTheme, isDark };
}

