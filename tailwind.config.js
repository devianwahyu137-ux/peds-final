/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'as-bg': {
          page:      'var(--as-bg-page)',
          primary:   'var(--as-bg-primary)',
          secondary: 'var(--as-bg-secondary)',
          tertiary:  'var(--as-bg-tertiary)',
          card:      'var(--as-bg-card)',
        },
        'as-border': {
          primary:   'var(--as-border-primary)',
          secondary: 'var(--as-border-secondary)',
          divider:   'var(--as-border-divider)',
        },
        'as-text': {
          primary:   'var(--as-text-primary)',
          secondary: 'var(--as-text-secondary)',
          tertiary:  'var(--as-text-tertiary)',
          dim:       'var(--as-text-dim)',
        },
      },
    },
  },
  plugins: [],
}
