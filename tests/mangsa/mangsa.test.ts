import { describe, expect, it } from 'vitest'
import { gregorianToJdn, isLeapYear, jdnToGregorian, parseGregorian } from '@/lib/jdn'
import { MANGSA_VALID_FROM_YEAR, mangsaFor, mangsaTable } from '@/lib/mangsa'

const dateOf = (iso: string) => parseGregorian(iso)!

describe('the twelve mangsa tile the year', () => {
  it('covers every day of a non-leap year exactly once', () => {
    const seen = new Map<string, number>()
    const start = gregorianToJdn({ year: 2023, month: 1, day: 1 })
    for (let jdn = start; jdn < start + 365; jdn++) {
      const result = mangsaFor(jdnToGregorian(jdn))
      expect(result.type).toBe('ok')
      if (result.type !== 'ok') continue
      seen.set(result.value.entry.name, (seen.get(result.value.entry.name) ?? 0) + 1)
    }
    expect(seen.size).toBe(12)
    expect([...seen.values()].reduce((a, b) => a + b, 0)).toBe(365)
  })

  it('covers the leap day too, in Kawolu', () => {
    expect(isLeapYear(2024)).toBe(true)
    const result = mangsaFor(dateOf('2024-02-29'))
    expect(result.type).toBe('ok')
    if (result.type !== 'ok') return
    expect(result.value.entry.name).toBe('Kawolu')
  })

  it('has lengths summing to 365', () => {
    expect(mangsaTable().reduce((sum, e) => sum + e.lengthDays, 0)).toBe(365)
  })

  it('places the boundary days on the mangsa the table names', () => {
    const cases = [
      { iso: '2023-06-22', name: 'Kasa' },
      { iso: '2023-08-01', name: 'Kasa' },
      { iso: '2023-08-02', name: 'Karo' },
      { iso: '2023-12-21', name: 'Kanem' },
      { iso: '2023-12-22', name: 'Kapitu' },
      { iso: '2023-01-15', name: 'Kapitu' }, // the window that wraps the year end
      { iso: '2023-02-02', name: 'Kapitu' },
      { iso: '2023-02-03', name: 'Kawolu' },
      { iso: '2023-06-21', name: 'Sadha' },
    ]
    for (const { iso, name } of cases) {
      const result = mangsaFor(dateOf(iso))
      expect(result.type).toBe('ok')
      if (result.type !== 'ok') continue
      expect(result.value.entry.name, iso).toBe(name)
    }
  })
})

describe('mangsa is independent of every other cycle', () => {
  it('lands on the same mangsa on the same calendar date across years', () => {
    // Being solar, it is fixed to the Gregorian date — unlike everything else
    // in this engine. That independence is the point of showing it.
    for (const year of [1900, 1950, 2000, 2050]) {
      const result = mangsaFor({ year, month: 10, day: 20 })
      expect(result.type).toBe('ok')
      if (result.type !== 'ok') continue
      expect(result.value.entry.name).toBe('Kalima')
    }
  })
})

describe('range', () => {
  it('refuses before the table was standardised', () => {
    const result = mangsaFor({ year: MANGSA_VALID_FROM_YEAR - 1, month: 6, day: 1 })
    expect(result.type).toBe('refused')
    if (result.type !== 'refused') return
    expect(result.refusal.subsystem).toBe('mangsa')
    expect(result.refusal.validTo).toBeNull()
  })

  it('accepts the first supported year', () => {
    expect(mangsaFor({ year: MANGSA_VALID_FROM_YEAR, month: 6, day: 1 }).type).toBe('ok')
  })
})

describe('position within a mangsa', () => {
  it('numbers the days from one to the mangsa length', () => {
    const result = mangsaFor(dateOf('2023-06-22'))
    if (result.type !== 'ok') throw new Error('expected a mangsa')
    expect(result.value.dayWithin).toBe(1)
    expect(result.value.endJdn - result.value.startJdn + 1).toBe(result.value.entry.lengthDays)
  })

  it('counts correctly inside the window that wraps the year end', () => {
    const result = mangsaFor(dateOf('2023-01-01'))
    if (result.type !== 'ok') throw new Error('expected a mangsa')
    expect(result.value.entry.name).toBe('Kapitu')
    // Kapitu began on 22 December of the previous year.
    expect(jdnToGregorian(result.value.startJdn)).toEqual({ year: 2022, month: 12, day: 22 })
    expect(result.value.dayWithin).toBe(11)
  })
})
