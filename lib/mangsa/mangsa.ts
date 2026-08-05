import { gregorianToJdn, jdnToGregorian, type GregorianDate, type Jdn } from '@/lib/jdn'
import { MANGSA, type Mangsa } from '@/lib/data'
import { ok, refused, type Resolved } from '@/lib/trace/types'

/**
 * Pranata mangsa — the agricultural solar calendar (PRD §6.6).
 *
 * Twelve mangsa of unequal length tied to the tropical year, and therefore
 * tied to Gregorian dates rather than to any cycle above. It shares nothing
 * with the pasaran, the wuku, or the lunar year, which is exactly why it is
 * worth showing beside them.
 */

/**
 * The standard table is a nineteenth-century formalisation, so applying it to
 * earlier centuries would be using dates that had not been fixed yet. As
 * everywhere else in this engine, out of range means a refusal rather than a
 * plausible answer.
 */
export const MANGSA_VALID_FROM_YEAR = 1855

export type MangsaResult = {
  readonly entry: Mangsa
  readonly dayWithin: number
  readonly startJdn: Jdn
  readonly endJdn: Jdn
}

/**
 * Does a (month, day) pair fall inside a mangsa's window?
 *
 * Kapitu runs 22 December to 2 February, so the window wraps the year end and
 * the comparison has to allow for it.
 */
function contains(entry: Mangsa, month: number, day: number): boolean {
  const after = month > entry.startMonth || (month === entry.startMonth && day >= entry.startDay)
  const before = month < entry.endMonth || (month === entry.endMonth && day <= entry.endDay)
  const wraps = entry.startMonth > entry.endMonth
  return wraps ? after || before : after && before
}

/** The mangsa a Gregorian date falls in, or a refusal if it is out of range. */
export function mangsaFor(date: GregorianDate): Resolved<MangsaResult> {
  if (date.year < MANGSA_VALID_FROM_YEAR) {
    return refused({
      subsystem: 'mangsa',
      reason:
        `Tabel tanggal pranata mangsa yang dipakai di sini adalah tabel baku yang ditetapkan ` +
        `pada pertengahan abad ke-19. Menerapkannya jauh sebelum itu berarti memakai batas ` +
        `tanggal yang belum dibakukan, dan hasilnya akan terlihat persis seperti jawaban yang benar.`,
      validFrom: `${MANGSA_VALID_FROM_YEAR}-01-01`,
      validTo: null,
    })
  }

  // 29 February belongs to Kawolu, the mangsa that absorbs the leap day.
  const day = date.month === 2 && date.day === 29 ? 28 : date.day
  const entry = MANGSA.entries.find((e) => contains(e, date.month, day))

  if (!entry) {
    // Unreachable while the twelve windows tile the year, which the build
    // validator and the tests both assert.
    return refused({
      subsystem: 'mangsa',
      reason: `tidak ada mangsa yang mencakup ${date.month}-${date.day}`,
      validFrom: `${MANGSA_VALID_FROM_YEAR}-01-01`,
      validTo: null,
    })
  }

  // A wrapping mangsa that started last year began in the previous Gregorian
  // year, so the start date has to step back with it.
  const startsPreviousYear = entry.startMonth > entry.endMonth && date.month <= entry.endMonth
  const startJdn = gregorianToJdn({
    year: date.year - (startsPreviousYear ? 1 : 0),
    month: entry.startMonth,
    day: entry.startDay,
  })
  const jdn = gregorianToJdn(date)

  return ok({
    entry,
    dayWithin: jdn - startJdn + 1,
    startJdn,
    endJdn: startJdn + entry.lengthDays - 1,
  })
}

/** Every mangsa in order, with the Gregorian window it occupies. */
export function mangsaTable(): ReadonlyArray<Mangsa> {
  return MANGSA.entries
}

export function mangsaSource() {
  return MANGSA.source
}

/** Format a mangsa's window as a date range, using a reference year. */
export function windowLabel(entry: Mangsa): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(entry.startDay)}-${pad(entry.startMonth)} … ${pad(entry.endDay)}-${pad(entry.endMonth)}`
}

export function mangsaOfJdn(jdn: Jdn): Resolved<MangsaResult> {
  return mangsaFor(jdnToGregorian(jdn))
}
