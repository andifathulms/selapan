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
 * Every computed ratio is written to `contrast.config.json` at the repo
 * root, beside `tailwind.config.ts`, so the palette carries a written record
 * of what was checked and when — not just a pass/fail in a CI log.
 *
 * CLAUDE.md: do not weaken this gate to make a colour pass.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import tailwindConfig from '../tailwind.config'

const MIN_CONTRAST_NORMAL_TEXT = 4.5

type TokenName = keyof typeof COLORS

const COLORS = (tailwindConfig.theme?.extend?.colors ?? {}) as Record<string, string>

type Pair = {
  readonly foreground: string
  readonly background: string
  /** Where this combination is actually produced in the UI. Empty only for
      a defined-but-not-yet-used token, and then `gate` must be false. */
  readonly usedIn: ReadonlyArray<string>
  /** Whether a failure here fails the build. */
  readonly gate: boolean
}

const PAIRS: ReadonlyArray<Pair> = [
  { foreground: 'ink', background: 'paper', gate: true, usedIn: ['app/globals.css — html base text colour'] },
  { foreground: 'ink', background: 'paper-raised', gate: true, usedIn: ['components/grid/MonthGrid.tsx — day cells on bg-paper-raised/80'] },
  { foreground: 'ink', background: 'paper-deep', gate: true, usedIn: ["components/grid/MonthGrid.tsx — today's cell on bg-paper-deep/70"] },

  { foreground: 'indigo', background: 'paper', gate: true, usedIn: ['components/trace/TraceValue.tsx', 'components/home/TodayCard.tsx', 'app/[locale]/page.tsx'] },
  { foreground: 'indigo', background: 'paper-raised', gate: true, usedIn: ['.panel — app/globals.css, carrying computed values throughout'] },
  { foreground: 'indigo', background: 'paper-deep', gate: true, usedIn: ['.panel-inset — app/globals.css, carrying computed values throughout'] },

  { foreground: 'unverified', background: 'paper', gate: true, usedIn: ['components/trace/TraceValue.tsx — RefusalNotice', 'components/trace/Derivation.tsx', 'app/[locale]/sumber/page.tsx'] },
  { foreground: 'unverified', background: 'paper-raised', gate: true, usedIn: ['components/grid/MonthGrid.tsx — unverified wuku label on bg-paper-raised/80'] },
  { foreground: 'unverified', background: 'paper-deep', gate: true, usedIn: ['app/[locale]/kurup/DivergenceView.tsx — divergence banner on bg-paper-deep/35'] },

  // text-ochre in CycleWheels marks tick strokes and the coincidence ray,
  // not text glyphs — WCAG normal-text contrast (1.4.3) does not apply to a
  // graphical stroke. Recorded at the same threshold for visibility, not
  // gated at it.
  { foreground: 'ochre', background: 'paper', gate: false, usedIn: ['components/wheels/CycleWheels.tsx — tick marks and coincidence-ray stroke (graphical, not text)'] },

  { foreground: 'paper', background: 'indigo', gate: true, usedIn: ['app/[locale]/layout.tsx — header wordmark on bg-indigo', '.btn-solid — app/globals.css'] },
  { foreground: 'paper', background: 'indigo-deep', gate: true, usedIn: ['.btn-solid:hover — app/globals.css'] },

  // Reserved for the primbon layer (M6, gated on the reviewer in PRD §4).
  // Not used as text anywhere yet — checked in advance so the palette is
  // already known to clear AA before that layer ships.
  { foreground: 'rubric', background: 'paper', gate: false, usedIn: [] },
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

function resolveToken(name: string): string {
  const hex = COLORS[name as TokenName]
  if (!hex) throw new Error(`token "${name}" is not defined in tailwind.config.ts`)
  return hex
}

const results = PAIRS.map((pair) => {
  const foregroundHex = resolveToken(pair.foreground)
  const backgroundHex = resolveToken(pair.background)
  const ratio = contrastRatio(foregroundHex, backgroundHex)
  return {
    foreground: pair.foreground,
    foregroundHex,
    background: pair.background,
    backgroundHex,
    ratio: Math.round(ratio * 100) / 100,
    minRequired: MIN_CONTRAST_NORMAL_TEXT,
    passesAA: ratio >= MIN_CONTRAST_NORMAL_TEXT,
    gate: pair.gate,
    usedIn: pair.usedIn,
  }
})

const outPath = join(process.cwd(), 'contrast.config.json')
writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedBy: 'scripts/validate-contrast.ts',
      standard: 'WCAG 2.x, normal text',
      minContrast: MIN_CONTRAST_NORMAL_TEXT,
      pairs: results,
    },
    null,
    2,
  ) + '\n',
)

const failures = results.filter((r) => r.gate && !r.passesAA)

for (const r of results) {
  const status = r.passesAA ? 'lolos' : 'GAGAL'
  const marker = r.gate ? status : `${status} (dicatat, tidak menggagalkan build)`
  console.log(`  ${r.foreground} on ${r.background} — ${r.ratio}:1 — ${marker}`)
}

if (failures.length > 0) {
  console.error(`\ncontrast:validate GAGAL — ${failures.length} pasangan di bawah ${MIN_CONTRAST_NORMAL_TEXT}:1\n`)
  for (const f of failures) {
    console.error(`  ✗ ${f.foreground} on ${f.background} — ${f.ratio}:1 (dipakai di: ${f.usedIn.join(', ')})`)
  }
  console.error('')
  process.exit(1)
}

console.log(`\ncontrast:validate lolos — ${results.length} pasangan dicatat di contrast.config.json`)
