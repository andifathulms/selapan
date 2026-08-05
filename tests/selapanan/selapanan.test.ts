import { describe, expect, it } from 'vitest'
import { gregorianToJdn, parseGregorian } from '@/lib/jdn'
import { wetonOf } from '@/lib/cycles'
import { selapananDates, slametanDates } from '@/lib/selapanan'

const jdnOf = (iso: string) => gregorianToJdn(parseGregorian(iso)!)

describe('selapanan', () => {
  const birth = jdnOf('1990-04-12')

  it('recurs every 35 days', () => {
    const dates = selapananDates(birth, 12)
    expect(dates).toHaveLength(12)
    for (const [i, date] of dates.entries()) {
      expect(date.daysSince).toBe(35 * (i + 1))
      expect(date.jdn).toBe(birth + 35 * (i + 1))
    }
  })

  it('lands on the same weton every time — that is what makes it a selapan', () => {
    const original = wetonOf(birth).name
    for (const date of selapananDates(birth, 24)) {
      expect(wetonOf(date.jdn).name).toBe(original)
    }
  })
})

describe('slametan', () => {
  const death = jdnOf('2020-03-15')
  const entries = slametanDates(death, 'chronological')
  const find = (kind: string) => entries.find((e) => e.kind === kind)!

  it('counts the day of death as the first day', () => {
    expect(find('geblag').result).toEqual({ type: 'ok', value: death })
    expect(find('nelung-dina').result).toEqual({ type: 'ok', value: death + 2 })
    expect(find('mitung-dina').result).toEqual({ type: 'ok', value: death + 6 })
    expect(find('matang-puluh').result).toEqual({ type: 'ok', value: death + 39 })
    expect(find('nyatus').result).toEqual({ type: 'ok', value: death + 99 })
    expect(find('nyewu').result).toEqual({ type: 'ok', value: death + 999 })
  })

  it('states its counting rule with every date', () => {
    for (const entry of entries) {
      expect(entry.rule.length).toBeGreaterThan(10)
      expect(entry.name.length).toBeGreaterThan(0)
    }
  })

  it('computes the mendhak as Javanese-year anniversaries, not day counts', () => {
    const first = find('mendhak-sepisan').result
    expect(first.type).toBe('ok')
    if (first.type !== 'ok') return
    // A Javanese year is 354 or 355 days, so the anniversary must fall in
    // that window and never on a Gregorian anniversary.
    const elapsed = first.value - death
    expect(elapsed).toBeGreaterThanOrEqual(354)
    expect(elapsed).toBeLessThanOrEqual(355)
  })

  it('returns the dates in the order they are observed', () => {
    const ordered = entries
      .filter((e) => e.result.type === 'ok')
      .map((e) => (e.result.type === 'ok' ? e.result.value : 0))
    expect([...ordered].sort((a, b) => a - b)).toEqual(ordered)
  })

  it('refuses the mendhak rather than guessing when out of lunar range', () => {
    // A death before 1633 has no Javanese date, so it has no Javanese-year
    // anniversary either. The day counts still compute.
    const ancient = slametanDates(jdnOf('1500-01-01'), 'chronological')
    expect(ancient.find((e) => e.kind === 'mendhak-sepisan')!.result.type).toBe('refused')
    expect(ancient.find((e) => e.kind === 'mitung-dina')!.result.type).toBe('ok')
  })

  it('carries no interpretation of any kind', () => {
    // The engine must not acquire a category, a quality, or a recommendation
    // attached to these dates (PRD §4). Dates and rules only.
    for (const entry of entries) {
      expect(Object.keys(entry).sort()).toEqual(['kind', 'name', 'result', 'rule'])
    }
  })
})
