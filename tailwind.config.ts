import type { Config } from 'tailwindcss'

// Palette is PRD §9. The two-colour split is load-bearing, not decorative:
// `indigo` marks computed values only, `rubric` marks primbon material only.
//
// The surface tokens below are tints of the same paper and ink, not new
// hues. An almanac page is one paper stock under a few weights of impression,
// and a fourth colour here would start competing with the two that carry
// meaning.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFE8D8',
        'paper-deep': '#E4DAC5',
        'paper-raised': '#F5F1E6',
        ink: '#201C16',
        indigo: '#2B4470',
        'indigo-deep': '#1E3157',
        rubric: '#A83C28',
        ochre: '#B08A3E',
        unverified: '#8C8578',
      },
      fontFamily: {
        prose: ['var(--font-prose)', 'Petrona', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', '"Sometype Mono"', 'ui-monospace', 'monospace'],
        ui: ['var(--font-ui)', 'Karla', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Headings scale with the viewport, so a 360px phone gets a heading
        // that still reads as one without swallowing the column.
        display: [
          'clamp(2rem, 1.35rem + 3vw, 3.25rem)',
          { lineHeight: '1.08', letterSpacing: '-0.015em' },
        ],
        title: ['clamp(1.6rem, 1.3rem + 1.5vw, 2.25rem)', { lineHeight: '1.15' }],
        section: ['clamp(1.2rem, 1.08rem + 0.6vw, 1.45rem)', { lineHeight: '1.25' }],
        // The single figure a reader came for: a weton, a mangsa name.
        figure: [
          'clamp(1.75rem, 1.2rem + 2.2vw, 2.6rem)',
          { lineHeight: '1.1', letterSpacing: '-0.01em' },
        ],
      },
      maxWidth: {
        measure: '62ch',
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
    },
  },
  plugins: [],
}

export default config
