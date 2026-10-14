/**
 * Build-time WCAG contrast check for the token pairs the UI actually pairs
 * a text colour with a surface colour on.
 *
 * `unverified` on `paper` computed at roughly 3.0:1 — under the 4.5:1 floor
 * for normal text — and it is exactly the colour carrying refusal and
 * unverified-value copy: the honesty surface of the project (DESIGN-REWORK
 * §6). A token that renders illegibly is the same failure mode
 * `data:validate` already guards against for citations, so it gets the same
 * discipline: computed here, gated here, and never eyeballed.
 *
 * `PAIRS` below is a citation list, in the same spirit as an anchor: every
 * entry names where in the UI that foreground/background combination is
 * actually used, so a pair cannot be added to the gate without pointing at
 * the component that produces it. `gate: false` marks a token defined in
 * the palette but not yet used as text on that surface (e.g. `rubric`,
 * reserved for the primbon layer) — computed and recorded, not enforced.
 *
 * Every pair is checked in every palette in theme/palette.ts — the light
 * page, dark mode, and the ink-dark `.instrument` surface the wheels sit on
 * — because each re-scopes the same token names, and a class that clears AA
 * in one can fail in another. Text pairs need 4.5:1 (WCAG 1.4.3). `ochre`
 * is gated at 3:1 (WCAG 1.4.11, non-text) because it is the focus ring and
 * the wheel ticks: graphical, but a reader has to be able to see it.
 *
 * Every computed ratio is written to `contrast.config.json` at the repo
 * root, beside `tailwind.config.ts`, so the palette carries a written record
 * of what was checked and when — not just a pass/fail in a CI log.
 *
 * CLAUDE.md: do not weaken this gate to make a colour pass.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PALETTES, type Palette, type Token } from '../theme/palette'

const MIN_CONTRAST_NORMAL_TEXT = 4.5
const MIN_CONTRAST_NON_TEXT = 3

type ThemeName = keyof typeof PALETTES

type Pair = {
  readonly foreground: Token
  readonly background: Token
  /** Where this combination is actually produced in the UI. Empty only for
      a defined-but-not-yet-used token, and then `gate` must be false. */
  readonly usedIn: ReadonlyArray<string>
  /** Whether a failure here fails the build. */
  readonly gate: boolean
  /** 4.5 for text, 3 for a graphical mark. */
  readonly minRequired: number
  /** The palettes the pair occurs in. All three unless stated. */
  readonly themes?: ReadonlyArray<ThemeName>
}

const TEXT = MIN_CONTRAST_NORMAL_TEXT

const PAIRS: ReadonlyArray<Pair> = [
  { foreground: 'ink', background: 'paper', gate: true, minRequired: TEXT, usedIn: ['app/globals.css — html base text colour'] },
  { foreground: 'ink', background: 'paper-raised', gate: true, minRequired: TEXT, usedIn: ['.panel — app/globals.css', 'components/grid/MonthGrid.tsx — day cells'] },
  { foreground: 'ink', background: 'paper-deep', gate: true, minRequired: TEXT, usedIn: ['.chip — app/globals.css', '.panel-inset — app/globals.css'] },

  { foreground: 'indigo', background: 'paper', gate: true, minRequired: TEXT, usedIn: ['components/trace/TraceValue.tsx', 'app/[locale]/ubah/ConversionView.tsx — the weton figure'] },
  { foreground: 'indigo', background: 'paper-raised', gate: true, minRequired: TEXT, usedIn: ['.panel — app/globals.css, carrying computed values throughout', 'components/wheels/CycleWheels.tsx — labels on the instrument surface'] },
  { foreground: 'indigo', background: 'paper-deep', gate: true, minRequired: TEXT, usedIn: ['.chip — app/globals.css, computed value in a fact chip', '.panel-inset — app/globals.css'] },

  { foreground: 'unverified', background: 'paper', gate: true, minRequired: TEXT, usedIn: ['components/trace/TraceValue.tsx — RefusalNotice', 'components/trace/Derivation.tsx', 'app/[locale]/sumber/page.tsx'] },
  { foreground: 'unverified', background: 'paper-raised', gate: true, minRequired: TEXT, usedIn: ['components/grid/MonthGrid.tsx — unverified wuku label'] },
  { foreground: 'unverified', background: 'paper-deep', gate: true, minRequired: TEXT, usedIn: ['.chip — app/globals.css, an unverified value in a fact chip'] },

  { foreground: 'paper', background: 'ink', gate: true, minRequired: TEXT, usedIn: ['.btn-solid — app/globals.css', '.seg chosen option — app/globals.css'] },

  { foreground: 'ochre', background: 'paper', gate: true, minRequired: MIN_CONTRAST_NON_TEXT, usedIn: [':focus-visible — app/globals.css (focus ring)', 'components/wheels/CycleWheels.tsx — segment ticks (graphical, not text)'] },
  { foreground: 'ochre', background: 'paper-deep', gate: true, minRequired: MIN_CONTRAST_NON_TEXT, usedIn: [':focus-visible on a chip or inset panel — app/globals.css'] },

  // Reserved for the primbon layer (M6, gated on the reviewer in PRD §4).
  // Not used as text anywhere yet — checked in advance so the palette is
  // already known to clear AA before that layer ships.
  { foreground: 'rubric', background: 'paper', gate: false, minRequired: TEXT, usedIn: [] },
]

function hexToRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

function linearize(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/** WCAG 2.x contrast ratio, order-independent. */
function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

const results = (Object.keys(PALETTES) as ThemeName[]).flatMap((theme) => {
  const palette: Palette = PALETTES[theme]
  return PAIRS.filter((pair) => !pair.themes || pair.themes.includes(theme)).map((pair) => {
    const foregroundHex = palette[pair.foreground]
    const backgroundHex = palette[pair.background]
    const ratio = contrastRatio(foregroundHex, backgroundHex)
    return {
      theme,
      foreground: pair.foreground,
      foregroundHex,
      background: pair.background,
      backgroundHex,
      ratio: Math.round(ratio * 100) / 100,
      minRequired: pair.minRequired,
      passes: ratio >= pair.minRequired,
      gate: pair.gate,
      usedIn: pair.usedIn,
    }
  })
})

const outPath = join(process.cwd(), 'contrast.config.json')
writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedBy: 'scripts/validate-contrast.ts',
      source: 'theme/palette.ts',
      standard: 'WCAG 2.x — 1.4.3 for text (4.5:1), 1.4.11 for non-text marks (3:1)',
      themes: Object.keys(PALETTES),
      pairs: results,
    },
    null,
    2,
  ) + '\n',
)

const failures = results.filter((r) => r.gate && !r.passes)

for (const r of results) {
  const status = r.passes ? 'lolos' : 'GAGAL'
  const marker = r.gate ? status : `${status} (dicatat, tidak menggagalkan build)`
  console.log(`  [${r.theme}] ${r.foreground} on ${r.background} — ${r.ratio}:1 (min ${r.minRequired}) — ${marker}`)
}

if (failures.length > 0) {
  console.error(`\ncontrast:validate GAGAL — ${failures.length} pasangan di bawah ambang\n`)
  for (const f of failures) {
    console.error(`  ✗ [${f.theme}] ${f.foreground} on ${f.background} — ${f.ratio}:1, perlu ${f.minRequired}:1 (dipakai di: ${f.usedIn.join(', ')})`)
  }
  console.error('')
  process.exit(1)
}

console.log(`\ncontrast:validate lolos — ${results.length} pasangan dalam ${Object.keys(PALETTES).length} palet dicatat di contrast.config.json`)
