import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { DARK, INSTRUMENT, LIGHT, TOKENS, cssVariables } from './theme/palette'

// Palette is PRD §9, held as data in theme/palette.ts. The two-colour split
// is load-bearing, not decorative: `indigo` marks computed values only,
// `rubric` marks primbon material only.
//
// Every colour token resolves through a CSS custom property, so one class —
// `text-indigo`, `bg-paper-raised/80` — reads correctly in the light page,
// in dark mode, and on the ink-dark `.instrument` surface the wheels sit on.
// The values themselves live in one file, which the contrast gate reads too.
const colors = Object.fromEntries(
  TOKENS.map((token) => [token, `rgb(var(--c-${token}) / <alpha-value>)`]),
)

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Young Serif for the figure a reader came for and for page titles;
        // Petrona for prose; Schibsted Grotesk for controls and labels;
        // Sometype Mono for the working-out — JDNs, offsets, moduli, dates
        // in tables. Mono says "arithmetic", not "result".
        display: ['var(--font-display)', '"Young Serif"', 'Georgia', 'serif'],
        prose: ['var(--font-prose)', 'Petrona', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', '"Sometype Mono"', 'ui-monospace', 'monospace'],
        ui: ['var(--font-ui)', '"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Headings scale with the viewport, so a 360px phone gets a heading
        // that still reads as one without swallowing the column.
        display: [
          'clamp(2.25rem, 1.4rem + 3.6vw, 4.25rem)',
          { lineHeight: '1.04', letterSpacing: '-0.012em' },
        ],
        title: ['clamp(1.75rem, 1.35rem + 1.8vw, 2.75rem)', { lineHeight: '1.1' }],
        section: ['clamp(1.05rem, 1rem + 0.3vw, 1.2rem)', { lineHeight: '1.3' }],
        // The single figure a reader came for: a weton, a mangsa name.
        figure: [
          'clamp(3rem, 1.9rem + 4.6vw, 5.25rem)',
          { lineHeight: '0.98', letterSpacing: '-0.015em' },
        ],
      },
      borderRadius: {
        // Two radii only: a control is a little softer than square, a panel
        // a little softer than that. Everything else stays square.
        control: '8px',
        panel: '14px',
      },
      maxWidth: {
        measure: '62ch',
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [
    plugin(({ addBase, addComponents }) => {
      addBase({
        ':root': { ...cssVariables(LIGHT), colorScheme: 'light' },
        '@media (prefers-color-scheme: dark)': {
          ':root': { ...cssVariables(DARK), colorScheme: 'dark' },
        },
      })
      addComponents({
        // The surface every wheel is drawn on. It re-scopes the same token
        // names, so nothing inside it needs a second set of classes.
        '.instrument': {
          ...cssVariables(INSTRUMENT),
          colorScheme: 'dark',
          backgroundColor: 'rgb(var(--c-instrument))',
          color: 'rgb(var(--c-ink))',
        },
      })
    }),
  ],
}

export default config
