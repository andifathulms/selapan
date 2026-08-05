import type { Jdn } from '@/lib/jdn'
import { mod } from '@/lib/jdn'
import { KURUPS, type KurupDefinition } from '@/lib/data'
import { SASI, WINDU, WINDU_LENGTH } from '@/lib/cycles/names'
import type { KurupReckoning } from '@/lib/trace/types'

/**
 * The lunar year: windu, year lengths, months, and the kurup correction.
 *
 * Everything here begins in 1633 CE and means nothing before it (PRD §3).
 * Nothing in this file consults the current date or assumes a current kurup
 * — which is the single most common error in existing implementations
 * (CLAUDE.md invariant 5).
 */

export const ERA_YEAR_AJ = 1555

/**
 * Year lengths by position in the windu, in days.
 *
 * Alip 354, Ehe 355, Jimawal 354, Je 354, Dal 355, Be 354, Wawu 354,
 * Jimakir 355 — 2835 days to the windu, an average of 354.375. That average
 * runs slightly fast against the true lunation, and the kurup is the
 * correction for the accumulated drift.
 */
export const WINDU_YEAR_LENGTHS = [354, 355, 354, 354, 355, 354, 354, 355] as const

/**
 * Month lengths for the first eleven months: alternating 30 and 29, totalling
 * 325 days. Besar takes whatever the year length leaves — 29 in a short year,
 * 30 in a long one.
 *
 * Known gap: the Surakarta tradition assigns year Dal an irregular
 * arrangement of month lengths. It is not implemented here because this
 * project will not infer a calendrical rule from the general shape of the
 * system (CLAUDE.md working style). The year *length* of Dal is unaffected,
 * so year boundaries and every date outside Dal years are unaffected; days
 * within a Dal year may be off. The trace says so, in the UI, on those years.
 */
const LEADING_MONTHS = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30] as const
const LEADING_MONTHS_TOTAL = 325

export const DAL_IRREGULARITY_NOTE =
  'Tahun Dal dalam tradisi Surakarta memakai susunan panjang bulan yang tidak beraturan. Aturan itu belum diterapkan di sini karena belum ditranskripsi dari sumber, dan proyek ini tidak menyimpulkan aturan pananggalan dari pola umumnya. Panjang tahun Dal tidak terpengaruh, sehingga batas tahun tetap benar; tanggal di dalam tahun Dal bisa meleset beberapa hari.'

/** Position in the windu, 0 = Alip. */
export function winduIndexOf(yearAj: number): number {
  return mod(yearAj - ERA_YEAR_AJ, WINDU_LENGTH)
}

export function winduNameOf(yearAj: number): string {
  return WINDU[winduIndexOf(yearAj)]!
}

/**
 * A kurup as the engine uses it, with an effective end.
 *
 * Under the Aboge reckoning the Aboge kurup never ends: communities keeping
 * it simply did not apply the 1867 correction. That is represented here by
 * extending its span, not by treating it as an error (CLAUDE.md invariant 6).
 */
export type EffectiveKurup = {
  readonly definition: KurupDefinition
  readonly startYearAj: number
  readonly endYearAj: number
  readonly startJdn: Jdn
  /** True where the kurup ends with the one-day correction. */
  readonly correctionAtEnd: boolean
}

/** The last year the engine will speak about, in either reckoning. */
export const MAX_YEAR_AJ = KURUPS[KURUPS.length - 1]!.endYearAj

function chronological(): ReadonlyArray<EffectiveKurup> {
  return KURUPS.map((definition, i) => ({
    definition,
    startYearAj: definition.startYearAj,
    endYearAj: definition.endYearAj,
    startJdn: definition.startJdn,
    // Every kurup but the last in the list is followed by a correction; the
    // last one's end is beyond the supported range, so nothing depends on it.
    correctionAtEnd: i < KURUPS.length - 1,
  }))
}

function abogeContinued(): ReadonlyArray<EffectiveKurup> {
  const aboge = KURUPS.find((k) => k.id === 'kurup.aboge.1747')
  if (!aboge) throw new Error('definisi kurup Aboge tidak ditemukan')

  const before = KURUPS.filter((k) => k.endYearAj < aboge.startYearAj).map(
    (definition) => ({
      definition,
      startYearAj: definition.startYearAj,
      endYearAj: definition.endYearAj,
      startJdn: definition.startJdn,
      correctionAtEnd: true,
    }),
  )

  return [
    ...before,
    {
      definition: aboge,
      startYearAj: aboge.startYearAj,
      // Extended, not corrected: the Aboge reckoning simply carries on.
      endYearAj: MAX_YEAR_AJ,
      startJdn: aboge.startJdn,
      correctionAtEnd: false,
    },
  ]
}

export function kurupsFor(reckoning: KurupReckoning): ReadonlyArray<EffectiveKurup> {
  return reckoning === 'aboge' ? abogeContinued() : chronological()
}

export function kurupForYear(
  yearAj: number,
  reckoning: KurupReckoning,
): EffectiveKurup | undefined {
  return kurupsFor(reckoning).find(
    (k) => yearAj >= k.startYearAj && yearAj <= k.endYearAj,
  )
}

/** Length of a year in days, including the kurup correction where it applies. */
export function yearLength(yearAj: number, reckoning: KurupReckoning): number {
  const base = WINDU_YEAR_LENGTHS[winduIndexOf(yearAj)]!
  const kurup = kurupForYear(yearAj, reckoning)
  if (!kurup) return base
  // The correction is applied by dropping the last day of Besar in the final
  // year of the kurup. That is what makes a 120-year kurup 42,524 days rather
  // than 15 × 2835 = 42,525.
  const isFinalYear = yearAj === kurup.endYearAj
  return isFinalYear && kurup.correctionAtEnd ? base - 1 : base
}

/** JDN of 1 Sura of a given year. */
export function yearStartJdn(yearAj: number, reckoning: KurupReckoning): Jdn {
  const kurup = kurupForYear(yearAj, reckoning)
  if (!kurup) {
    throw new RangeError(`tahun ${yearAj} AJ di luar kurup mana pun`)
  }
  let jdn = kurup.startJdn
  for (let y = kurup.startYearAj; y < yearAj; y++) {
    jdn += yearLength(y, reckoning)
  }
  return jdn
}

/** The twelve month lengths of a year, in order from Sura. */
export function monthLengths(
  yearAj: number,
  reckoning: KurupReckoning,
): ReadonlyArray<number> {
  const besar = yearLength(yearAj, reckoning) - LEADING_MONTHS_TOTAL
  return [...LEADING_MONTHS, besar]
}

export function monthNameOf(monthIndex: number): string {
  const name = SASI[monthIndex]
  if (!name) throw new RangeError(`bulan di luar 1–12: ${monthIndex + 1}`)
  return name
}

/** True where the Dal month-length gap above applies to this year. */
export function isDalYear(yearAj: number): boolean {
  return winduNameOf(yearAj) === 'Dal'
}
