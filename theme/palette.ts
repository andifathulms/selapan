/**
 * The palette, as data — the single source for both the CSS custom
 * properties Tailwind's tokens resolve through (tailwind.config.ts) and the
 * build-time contrast gate (scripts/validate-contrast.ts), so the colour a
 * reader sees and the colour that was checked cannot drift apart.
 *
 * PRD §9. The roles are load-bearing, not decorative, and are identical in
 * every palette below:
 *
 * - `indigo` (nila) marks computed values only — dates, cycle positions,
 *   neptu sums, the "today" ray. Never a button, a link, or a surface.
 * - `rubric` (abang) marks primbon material only. Reserved until M6.
 * - `ochre` (prada) marks cycles on the wheels, month starts and focus
 *   rings. Graphical only; never body text.
 * - `unverified` carries refusal and unverified-value copy — the honesty
 *   surface of the project.
 * - `paper`, `paper-raised`, `paper-deep`, `ink` are the stock and its
 *   impression. `instrument` is the ink-dark surface the wheels sit on.
 *
 * Three palettes. `light` is the default; `dark` ("wengi") applies under
 * `prefers-color-scheme: dark`; `instrument` re-scopes the same token names
 * inside an `.instrument` surface, so a wheel or panel drawn with
 * `text-indigo` and `text-ink/60` reads correctly on the dark surface
 * without a second set of class names. The instrument surface is ink, not
 * indigo, deliberately: a blue surface would make blue mean "background" as
 * well as "computed", which is exactly the blur CLAUDE.md invariant 12
 * forbids.
 */
export const TOKENS = [
  'paper',
  'paper-raised',
  'paper-deep',
  'ink',
  'indigo',
  'rubric',
  'ochre',
  'unverified',
  'instrument',
] as const

export type Token = (typeof TOKENS)[number]
export type Palette = Readonly<Record<Token, string>>

export const LIGHT: Palette = {
  paper: '#F4F0E6',
  'paper-raised': '#FBF8F1',
  'paper-deep': '#E9E2D2',
  ink: '#1D1B18',
  // Was #2B4470 — close enough to grey-navy that a computed value read as
  // dark text at a distance. Lifted toward blue so the computed/tradition
  // split is visible without consulting the legend.
  indigo: '#2C4A8F',
  rubric: '#A63A26',
  // Darkened from the proposal's #A87A2A so it clears 3:1 (WCAG 1.4.11,
  // non-text) against paper-deep as well as paper — it is the focus ring.
  ochre: '#9E7226',
  unverified: '#5E5950',
  instrument: '#1A1815',
}

export const DARK: Palette = {
  paper: '#13120F',
  'paper-raised': '#1C1A16',
  'paper-deep': '#26231D',
  ink: '#ECE5D5',
  indigo: '#A9BCF5',
  rubric: '#E5826B',
  ochre: '#D2AC5E',
  unverified: '#A59E90',
  instrument: '#1A1815',
}

export const INSTRUMENT: Palette = {
  paper: '#1A1815',
  'paper-raised': '#221F1B',
  'paper-deep': '#2A2620',
  ink: '#EDE6D6',
  indigo: '#A9BCF5',
  rubric: '#E5826B',
  ochre: '#D2AC5E',
  unverified: '#A59E90',
  instrument: '#1A1815',
}

export const PALETTES = { light: LIGHT, dark: DARK, instrument: INSTRUMENT } as const

/** `#RRGGBB` → `R G B`, the channel form `rgb(var(--c-x) / <alpha>)` needs. */
export function channels(hex: string): string {
  const clean = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16)).join(' ')
}

/** The custom properties for one palette, keyed `--c-<token>`. */
export function cssVariables(palette: Palette): Record<string, string> {
  return Object.fromEntries(TOKENS.map((token) => [`--c-${token}`, channels(palette[token])]))
}
