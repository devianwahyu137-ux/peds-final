// src/components/ThemeToggle/index.jsx
// Toggle button for dark/light mode
// Designed to fit inside the top navbar

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="flex items-center gap-1.5 px-1 py-1 md:px-3 md:py-1.5 rounded-lg
                 border cursor-pointer transition-all duration-200"
      style={{
        background:   'var(--as-bg-tertiary)',
        borderColor:  'var(--as-border-primary)',
        color:        'var(--as-text-secondary)',
      }}
    >
      {/* Track */}
      <div
        className="relative w-8 h-4 rounded-full transition-colors duration-300"
        style={{
          background: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
          border: `1px solid ${isDark ? 'rgba(16,185,129,0.40)' : 'rgba(245,158,11,0.40)'}`,
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300"
          style={{
            left:       isDark ? '2px' : 'calc(100% - 14px)',
            background: isDark ? '#10b981' : '#f59e0b',
            boxShadow:  isDark
              ? '0 0 6px rgba(16,185,129,0.6)'
              : '0 0 6px rgba(245,158,11,0.6)',
          }}
        />
      </div>

      {/* Label */}
      <span
        className="hidden md:inline text-[8px] font-mono font-bold tracking-widest uppercase"
        style={{ color: isDark ? '#10b981' : '#f59e0b', minWidth: '28px' }}
      >
        {isDark ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}
