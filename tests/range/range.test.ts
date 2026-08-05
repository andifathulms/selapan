import { describe, expect, it } from 'vitest'
import { gregorianToJdn, parseGregorian } from '@/lib/jdn'
import { wetonOf, wukuOf } from '@/lib/cycles'
import { jdnFromLunar, lunarFromJdn } from '@/lib/lunar'
import { LUNAR_VALID_FROM, lunarValidTo } from '@/lib/range'

const jdnOf = (iso: string) => gregorianToJdn(parseGregorian(iso)!)

/**
 * Range refusals, asserted in both directions (CLAUDE.md invariant 3).
 *
 * Half of this behaviour is refusing the lunar date. The other half — the
 * half that makes the refusal honest rather than a blanket error — is that
 * the continuous cycles still answer for the very same day.
 */

describe('before the lunar era', () => {
  const cases = ['1500-01-01', '1600-06-15', '1633-07-07']

  for (const iso of cases) {
    it(`${iso} refuses a lunar date`, () => {
      const result = lunarFromJdn(jdnOf(iso), 'chronological')
      expect(result.type).toBe('refused')
      if (result.type !== 'refused') return
      expect(result.refusal.subsystem).toBe('lunar')
      expect(result.refusal.validFrom).toBe('1633-07-08')
      expect(result.refusal.reason.length).toBeGreaterThan(20)
    })

    it(`${iso} still yields a weton and a wuku`, () => {
      const jdn = jdnOf(iso)
      expect(wetonOf(jdn).name).toMatch(/^\S+ \S+$/)
      expect(wukuOf(jdn).name.length).toBeGreaterThan(0)
      expect(wetonOf(jdn).neptu.total).toBeGreaterThan(0)
    })
  }

  it('accepts the very first day of the era', () => {
    expect(lunarFromJdn(LUNAR_VALID_FROM, 'chronological').type).toBe('ok')
    expect(lunarFromJdn(LUNAR_VALID_FROM - 1, 'chronological').type).toBe('refused')
  })

  it('refuses a year number that never existed', () => {
    const result = jdnFromLunar(1500, 1, 1, 'chronological')
    expect(result.type).toBe('refused')
    if (result.type !== 'refused') return
    expect(result.refusal.reason).toContain('1555')
  })
})

describe('past the last kurup', () => {
  it('accepts the final supported day and refuses the next one', () => {
    for (const reckoning of ['chronological', 'aboge'] as const) {
      const last = lunarValidTo(reckoning)
      expect(lunarFromJdn(last, reckoning).type).toBe('ok')
      expect(lunarFromJdn(last + 1, reckoning).type).toBe('refused')
    }
  })

  it('still yields a weton far beyond the lunar range', () => {
    const jdn = jdnOf('2500-01-01')
    expect(lunarFromJdn(jdn, 'chronological').type).toBe('refused')
    expect(wetonOf(jdn).name).toMatch(/^\S+ \S+$/)
  })
})

describe('refusals are structured, never thrown and never guessed', () => {
  it('names the subsystem and the range that does apply', () => {
    const result = lunarFromJdn(jdnOf('1200-01-01'), 'chronological')
    if (result.type !== 'refused') throw new Error('expected a refusal')
    expect(result.refusal).toMatchObject({
      subsystem: 'lunar',
      validFrom: '1633-07-08',
    })
    expect(result.refusal.validTo).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('does not throw for any out-of-range input', () => {
    for (const iso of ['1000-01-01', '1632-12-31', '3000-01-01']) {
      expect(() => lunarFromJdn(jdnOf(iso), 'chronological')).not.toThrow()
      expect(() => lunarFromJdn(jdnOf(iso), 'aboge')).not.toThrow()
    }
  })

  it('refuses an impossible day within a real month rather than rolling over', () => {
    // Sapar is 29 days. Asking for the 30th must refuse, not silently return
    // 1 Mulud — a plausible wrong date is the worst possible answer.
    const result = jdnFromLunar(1900, 2, 30, 'chronological')
    expect(result.type).toBe('refused')
    if (result.type !== 'refused') return
    expect(result.refusal.reason).toContain('29 hari')
  })

  it('refuses a month outside one to twelve', () => {
    expect(jdnFromLunar(1900, 13, 1, 'chronological').type).toBe('refused')
    expect(jdnFromLunar(1900, 0, 1, 'chronological').type).toBe('refused')
  })
})

describe('determinism', () => {
  it('produces identical output for identical input', () => {
    const jdn = jdnOf('1980-05-05')
    const a = JSON.stringify(lunarFromJdn(jdn, 'chronological'))
    const b = JSON.stringify(lunarFromJdn(jdn, 'chronological'))
    expect(a).toBe(b)
  })

  it('produces different output for different reckonings, as it must', () => {
    const jdn = jdnOf('1980-05-05')
    expect(JSON.stringify(lunarFromJdn(jdn, 'chronological'))).not.toBe(
      JSON.stringify(lunarFromJdn(jdn, 'aboge')),
    )
  })
})
