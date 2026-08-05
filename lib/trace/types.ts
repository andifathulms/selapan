import type { GregorianDate, Jdn } from '@/lib/jdn'
import type { Source } from '@/lib/data/schema'

/**
 * How a value was arrived at.
 *
 * Every computed value in the app carries one of these, and every expandable
 * figure in the UI is built from it (CLAUDE.md invariant 8). A step without a
 * derivation is unfinished. The fields are chosen so that a reader can redo
 * the arithmetic by hand from what the screen shows:
 *
 *     (jdn - anchorJdn) mod modulus = index
 */
export type Derivation = {
  readonly kind: 'modulo'
  readonly anchorId: string
  readonly anchorJdn: Jdn
  readonly anchorGregorian: string
  readonly jdn: Jdn
  readonly offset: number
  readonly modulus: number
  readonly index: number
  readonly source: Source
  readonly status: 'verified' | 'unverified'
  readonly note?: string
}

/**
 * A derivation that is a running count rather than a modulo — the lunar
 * calendar, where the year and month are found by walking forward from the
 * era through known year and month lengths.
 */
export type CountDerivation = {
  readonly kind: 'count'
  readonly anchorId: string
  readonly anchorJdn: Jdn
  readonly anchorGregorian: string
  readonly jdn: Jdn
  readonly elapsedDays: number
  readonly steps: ReadonlyArray<{ readonly label: string; readonly days: number }>
  readonly source: Source
  readonly status: 'verified' | 'unverified'
  readonly note?: string
}

export type AnyDerivation = Derivation | CountDerivation

/** A named position in a cycle, with the arithmetic that produced it. */
export type CycleValue = {
  readonly name: string
  readonly index: number
  readonly derivation: AnyDerivation
}

/**
 * A structured refusal (CLAUDE.md invariant 4).
 *
 * Never a thrown string, never a silent null, and above all never a plausible
 * wrong date. A subsystem asked outside its validity range says so, names the
 * range, and stops.
 */
export type Refusal = {
  readonly subsystem: 'lunar' | 'kurup' | 'mangsa'
  readonly reason: string
  readonly validFrom: string
  readonly validTo: string | null
}

/** Either a value or a refusal, discriminated on `type`. */
export type Resolved<T> =
  | { readonly type: 'ok'; readonly value: T }
  | { readonly type: 'refused'; readonly refusal: Refusal }

export function ok<T>(value: T): Resolved<T> {
  return { type: 'ok', value }
}

export function refused<T>(refusal: Refusal): Resolved<T> {
  return { type: 'refused', refusal }
}

/** Which reckoning to use where Aboge and Asapon diverge. Neither is default-correct. */
export type KurupReckoning = 'chronological' | 'aboge'

/**
 * Where the day is taken to begin.
 *
 * Javanese days traditionally begin at sunset, as Hijri days do, so an
 * evening event belongs to the following weton. Most implementations ignore
 * this silently. Here it is explicit and defaults to midnight for
 * predictability (PRD §7).
 */
export type DayBoundary = 'midnight' | 'sunset'

export type TraceOptions = {
  readonly reckoning: KurupReckoning
  readonly dayBoundary: DayBoundary
  /** Only consulted when `dayBoundary` is 'sunset'. Whole hours, 0–23. */
  readonly hour?: number
}

export const DEFAULT_OPTIONS: TraceOptions = {
  reckoning: 'chronological',
  dayBoundary: 'midnight',
}

export type Weton = {
  readonly dina: CycleValue
  readonly pasaran: CycleValue
  readonly name: string
  readonly neptu: NeptuSum
}

export type NeptuSum = {
  readonly dina: number
  readonly pasaran: number
  readonly total: number
  readonly source: Source
}

export type LunarDate = {
  readonly yearAj: number
  readonly windu: string
  readonly winduIndex: number
  readonly monthIndex: number
  readonly monthName: string
  readonly day: number
  readonly yearLength: number
  readonly monthLength: number
  readonly kurupId: string
  readonly kurupName: string
  readonly kurupMnemonic: string
  readonly derivation: CountDerivation
}

/** Everything the engine knows about one day. `(jdn, options) → CalendarTrace`. */
export type CalendarTrace = {
  readonly jdn: Jdn
  readonly gregorian: GregorianDate
  readonly options: TraceOptions
  readonly dina: CycleValue
  readonly pasaran: CycleValue
  readonly weton: Weton
  readonly wuku: CycleValue
  readonly dayInWuku: number
  readonly lunar: Resolved<LunarDate>
}
