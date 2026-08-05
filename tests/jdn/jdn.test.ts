import { describe, expect, it } from 'vitest'
import {
  formatGregorian,
  gregorianToJdn,
  isLeapYear,
  jdnToGregorian,
  parseGregorian,
} from '@/lib/jdn'

/**
 * Test vectors from the standard literature. The first three are the
 * conventional check values for Fliegel & Van Flandern; the rest fix dates
 * this project depends on elsewhere.
 */
const VECTORS: ReadonlyArray<{ readonly iso: string; readonly jdn: number; readonly note: string }> = [
  { iso: '2000-01-01', jdn: 2451545, note: 'J2000 epoch day' },
  { iso: '1970-01-01', jdn: 2440588, note: 'Unix epoch day' },
  { iso: '1858-11-17', jdn: 2400001, note: 'Modified Julian Day 0' },
  { iso: '1582-10-15', jdn: 2299161, note: 'first day of the Gregorian reform' },
  { iso: '1633-07-08', jdn: 2317690, note: '1 Sura AJ 1555 — start of the Javanese lunar era' },
  { iso: '1936-03-24', jdn: 2428252, note: '1 Sura AJ 1867 — start of kurup Asapon' },
  { iso: '1945-08-17', jdn: 2431685, note: 'Proklamasi Kemerdekaan Indonesia' },
]

describe('gregorianToJdn', () => {
  for (const { iso, jdn, note } of VECTORS) {
    it(`${iso} → ${jdn} (${note})`, () => {
      expect(gregorianToJdn(parseGregorian(iso)!)).toBe(jdn)
    })
  }

  it('rejects a day that does not exist', () => {
    expect(() => gregorianToJdn({ year: 2023, month: 2, day: 29 })).toThrow(RangeError)
    expect(() => gregorianToJdn({ year: 2023, month: 13, day: 1 })).toThrow(RangeError)
  })

  it('handles the proleptic range below year 1', () => {
    // Astronomical year numbering: year 0 is 1 BCE.
    expect(gregorianToJdn({ year: 1, month: 1, day: 1 })).toBe(1721426)
    expect(gregorianToJdn({ year: 0, month: 1, day: 1 })).toBe(1721060)
  })
})

describe('jdnToGregorian', () => {
  for (const { iso, jdn } of VECTORS) {
    it(`${jdn} → ${iso}`, () => {
      expect(formatGregorian(jdnToGregorian(jdn))).toBe(iso)
    })
  }
})

describe('round trip', () => {
  it('holds for every day across four centuries', () => {
    const start = gregorianToJdn({ year: 1600, month: 1, day: 1 })
    const end = gregorianToJdn({ year: 2000, month: 1, day: 1 })
    for (let jdn = start; jdn <= end; jdn++) {
      expect(gregorianToJdn(jdnToGregorian(jdn))).toBe(jdn)
    }
  })

  it('advances exactly one day at a time with no gaps or repeats', () => {
    const start = gregorianToJdn({ year: 1899, month: 12, day: 1 })
    let previous = jdnToGregorian(start)
    for (let jdn = start + 1; jdn <= start + 40000; jdn++) {
      const current = jdnToGregorian(jdn)
      const sameDay =
        current.year === previous.year &&
        current.month === previous.month &&
        current.day === previous.day
      expect(sameDay).toBe(false)
      expect(gregorianToJdn(current) - gregorianToJdn(previous)).toBe(1)
      previous = current
    }
  })
})

describe('isLeapYear', () => {
  it('follows the Gregorian rule including the century exceptions', () => {
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2023)).toBe(false)
  })
})

describe('parseGregorian', () => {
  it('accepts an ISO day and rejects everything else', () => {
    expect(parseGregorian('1945-08-17')).toEqual({ year: 1945, month: 8, day: 17 })
    expect(parseGregorian('1945-02-30')).toBeNull()
    expect(parseGregorian('17/08/1945')).toBeNull()
    expect(parseGregorian('')).toBeNull()
  })
})
