import type { GregorianDate, Jdn } from './types'

/**
 * Gregorian ↔ Julian Day Number.
 *
 * Fliegel & Van Flandern (1968), "A machine algorithm for processing
 * calendar dates", Communications of the ACM 11(10):657. The published
 * algorithm is integer arithmetic throughout, which is exactly the
 * property this project needs: no floats, no clock, no locale.
 *
 * The proleptic Gregorian calendar is used for all years, including those
 * before 1582. This is a stated convention, not an accident — the Javanese
 * lunar system begins in 1633 CE, safely after the Gregorian reform, and
 * the continuous cycles do not care which civil calendar labels the day.
 */

/** Integer division truncating toward negative infinity. */
function floorDiv(a: number, b: number): number {
  return Math.floor(a / b)
}

/** Positive remainder, correct for negative operands. */
export function mod(a: number, b: number): number {
  return ((a % b) + b) % b
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const

/** Proleptic Gregorian leap year. */
export function isLeapYear(year: number): boolean {
  return mod(year, 4) === 0 && (mod(year, 100) !== 0 || mod(year, 400) === 0)
}

/** Length of a Gregorian month in days. */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new RangeError(`month out of range: ${month}`)
  }
  if (month === 2 && isLeapYear(year)) return 29
  return DAYS_IN_MONTH[month - 1]!
}

/** True when the triple names a day that exists. */
export function isValidGregorian(date: GregorianDate): boolean {
  const { year, month, day } = date
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }
  if (month < 1 || month > 12) return false
  return day >= 1 && day <= daysInMonth(year, month)
}

/**
 * Proleptic Gregorian date → Julian Day Number.
 *
 * Throws on a date that does not exist. Callers at the UI boundary validate
 * first; inside `lib/` a bad triple is a programming error, not user input.
 */
export function gregorianToJdn(date: GregorianDate): Jdn {
  if (!isValidGregorian(date)) {
    throw new RangeError(
      `not a Gregorian date: ${date.year}-${date.month}-${date.day}`,
    )
  }
  const { year, month, day } = date
  const a = floorDiv(14 - month, 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3

  return (
    day +
    floorDiv(153 * m + 2, 5) +
    365 * y +
    floorDiv(y, 4) -
    floorDiv(y, 100) +
    floorDiv(y, 400) -
    32045
  )
}

/** Julian Day Number → proleptic Gregorian date. */
export function jdnToGregorian(jdn: Jdn): GregorianDate {
  if (!Number.isInteger(jdn)) {
    throw new RangeError(`JDN must be an integer: ${jdn}`)
  }
  const a = jdn + 32044
  const b = floorDiv(4 * a + 3, 146097)
  const c = a - floorDiv(146097 * b, 4)
  const d = floorDiv(4 * c + 3, 1461)
  const e = c - floorDiv(1461 * d, 4)
  const m = floorDiv(5 * e + 2, 153)

  return {
    day: e - floorDiv(153 * m + 2, 5) + 1,
    month: m + 3 - 12 * floorDiv(m, 10),
    year: 100 * b + d - 4800 + floorDiv(m, 10),
  }
}

/** `YYYY-MM-DD`, zero-padded. The only formatting the engine performs. */
export function formatGregorian(date: GregorianDate): string {
  const y = String(Math.abs(date.year)).padStart(4, '0')
  const sign = date.year < 0 ? '-' : ''
  const m = String(date.month).padStart(2, '0')
  const d = String(date.day).padStart(2, '0')
  return `${sign}${y}-${m}-${d}`
}

/**
 * Parse `YYYY-MM-DD` into a date, or `null` if it is not one.
 *
 * This is the UI boundary: strings become integers here and everything
 * downstream is arithmetic (CLAUDE.md invariant 1).
 */
export function parseGregorian(input: string): GregorianDate | null {
  const match = /^(-?\d{1,6})-(\d{1,2})-(\d{1,2})$/.exec(input.trim())
  if (!match) return null
  const date: GregorianDate = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
  return isValidGregorian(date) ? date : null
}
