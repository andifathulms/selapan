import type { Jdn } from '@/lib/jdn'
import { WETON_LENGTH } from '@/lib/cycles'
import { jdnFromLunar, lunarFromJdn } from '@/lib/lunar'
import type { KurupReckoning, Resolved } from '@/lib/trace/types'
import { ok, refused } from '@/lib/trace/types'

/**
 * Selapanan and slametan dates (PRD §6.5).
 *
 * Both are date calculation and nothing else. The slametan calculator in
 * particular serves people during bereavement, and it stays plain: dates,
 * the counting rule, and the citation. No interpretation is attached to it,
 * here or in the UI (CLAUDE.md invariant 13).
 */

/**
 * The counting rule.
 *
 * The day of death counts as the first day, so nelung dina is the third day
 * and not three days afterwards. This is inclusive counting, and it is stated
 * openly because practice varies by region and a reader needs to be able to
 * check the rule against their own.
 */
export const COUNTING_RULE_INCLUSIVE = 'inclusive'

export type SelapananDate = {
  readonly ordinal: number
  readonly jdn: Jdn
  readonly daysSince: number
}

/** Recurring selapanan dates from a weton, one every 35 days. */
export function selapananDates(fromJdn: Jdn, count: number): ReadonlyArray<SelapananDate> {
  return Array.from({ length: count }, (_, i) => ({
    ordinal: i + 1,
    jdn: fromJdn + WETON_LENGTH * (i + 1),
    daysSince: WETON_LENGTH * (i + 1),
  }))
}

export type SlametanKind =
  | 'geblag'
  | 'nelung-dina'
  | 'mitung-dina'
  | 'matang-puluh'
  | 'nyatus'
  | 'mendhak-sepisan'
  | 'mendhak-pindho'
  | 'nyewu'

export type SlametanEntry = {
  readonly kind: SlametanKind
  readonly name: string
  /** How the date is arrived at, in words. Shown beside the date. */
  readonly rule: string
  readonly result: Resolved<Jdn>
}

/** Day counts, inclusive of the day of death. */
const DAY_COUNTS: ReadonlyArray<{
  kind: SlametanKind
  name: string
  dayNumber: number
}> = [
  { kind: 'geblag', name: 'Geblag', dayNumber: 1 },
  { kind: 'nelung-dina', name: 'Nelung dina', dayNumber: 3 },
  { kind: 'mitung-dina', name: 'Mitung dina', dayNumber: 7 },
  { kind: 'matang-puluh', name: 'Matang puluh', dayNumber: 40 },
  { kind: 'nyatus', name: 'Nyatus', dayNumber: 100 },
  { kind: 'nyewu', name: 'Nyewu', dayNumber: 1000 },
]

/**
 * Slametan dates counted from the day of death.
 *
 * The mendhak are anniversaries in Javanese lunar years rather than day
 * counts, so they are computed through the lunar engine and inherit its
 * range: outside it they refuse, like everything else.
 */
export function slametanDates(
  deathJdn: Jdn,
  reckoning: KurupReckoning,
): ReadonlyArray<SlametanEntry> {
  const byCount: SlametanEntry[] = DAY_COUNTS.map(({ kind, name, dayNumber }) => ({
    kind,
    name,
    rule: `Hari ke-${dayNumber}, hari wafat dihitung sebagai hari pertama`,
    result: ok(deathJdn + dayNumber - 1),
  }))

  const mendhak: SlametanEntry[] = [1, 2].map((years) => ({
    kind: years === 1 ? ('mendhak-sepisan' as const) : ('mendhak-pindho' as const),
    name: years === 1 ? 'Mendhak sepisan' : 'Mendhak pindho',
    rule: `Tanggal Jawa yang sama, ${years} tahun Jawa sesudahnya`,
    result: lunarAnniversary(deathJdn, years, reckoning),
  }))

  // Ordered by date rather than by kind, which is the order they are observed.
  return [...byCount, ...mendhak].sort((a, b) => {
    const at = a.result.type === 'ok' ? a.result.value : Number.MAX_SAFE_INTEGER
    const bt = b.result.type === 'ok' ? b.result.value : Number.MAX_SAFE_INTEGER
    return at - bt
  })
}

/** The same Javanese date, a whole number of Javanese years later. */
function lunarAnniversary(
  jdn: Jdn,
  years: number,
  reckoning: KurupReckoning,
): Resolved<Jdn> {
  const lunar = lunarFromJdn(jdn, reckoning)
  if (lunar.type === 'refused') return refused(lunar.refusal)
  return jdnFromLunar(
    lunar.value.yearAj + years,
    lunar.value.monthIndex + 1,
    lunar.value.day,
    reckoning,
  )
}
