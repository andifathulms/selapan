import type { Config } from 'tailwindcss'

// Palette is PRD §9. The two-colour split is load-bearing, not decorative:
// `indigo` marks computed values only, `rubric` marks primbon material only.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFE8D8',
        'paper-deep': '#E4DAC5',
        ink: '#201C16',
        indigo: '#2B4470',
        rubric: '#A83C28',
        ochre: '#B08A3E',
        unverified: '#8C8578',
      },
      fontFamily: {
        prose: ['var(--font-prose)', 'Petrona', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', '"Sometype Mono"', 'ui-monospace', 'monospace'],
        ui: ['var(--font-ui)', 'Karla', 'system-ui', 'sans-serif'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [],
}

export default config
