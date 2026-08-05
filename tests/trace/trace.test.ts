import { describe, expect, it } from 'vitest'
import { gregorianToJdn, parseGregorian } from '@/lib/jdn'
import { DEFAULT_OPTIONS, SUNSET_HOUR, effectiveJdn, formatLunar, traceFor } from '@/lib/trace'

const jdnOf = (iso: string) => gregorianToJdn(parseGregorian(iso)!)

describe('traceFor', () => {
  it('assembles every cycle for a single day', () => {
    const trace = traceFor(jdnOf('1945-08-17'))
    expect(trace.weton.name).toBe('Jemuwah Legi')
    expect(trace.weton.neptu.total).toBe(11)
    expect(trace.gregorian).toEqual({ year: 1945, month: 8, day: 17 })
    expect(trace.lunar.type).toBe('ok')
    expect(trace.dayInWuku).toBeGreaterThanOrEqual(1)
    expect(trace.dayInWuku).toBeLessThanOrEqual(7)
  })

  it('carries the refusal through instead of a plausible wrong date', () => {
    const trace = traceFor(jdnOf('1500-01-01'))
    expect(trace.lunar.type).toBe('refused')
    expect(formatLunar(trace)).toBe('—')
    // The cycles still answer for the same day.
    expect(trace.weton.name).toMatch(/^\S+ \S+$/)
  })

  it('is deterministic — the same JDN and options give a byte-identical trace', () => {
    const jdn = jdnOf('1990-11-11')
    expect(JSON.stringify(traceFor(jdn))).toBe(JSON.stringify(traceFor(jdn)))
  })

  it('defaults to midnight and the chronological reckoning', () => {
    expect(DEFAULT_OPTIONS.dayBoundary).toBe('midnight')
    expect(DEFAULT_OPTIONS.reckoning).toBe('chronological')
  })
})

describe('day boundary', () => {
  const jdn = jdnOf('2026-08-06')

  it('ignores the hour under midnight reckoning', () => {
    for (const hour of [0, 12, 18, 23]) {
      expect(effectiveJdn(jdn, { ...DEFAULT_OPTIONS, hour })).toBe(jdn)
    }
  })

  it('moves an evening into the following day under sunset reckoning', () => {
    const sunset = { ...DEFAULT_OPTIONS, dayBoundary: 'sunset' } as const
    expect(effectiveJdn(jdn, { ...sunset, hour: SUNSET_HOUR - 1 })).toBe(jdn)
    expect(effectiveJdn(jdn, { ...sunset, hour: SUNSET_HOUR })).toBe(jdn + 1)
    expect(effectiveJdn(jdn, { ...sunset, hour: 23 })).toBe(jdn + 1)
  })

  it('shifts the whole weton, not just the label', () => {
    const sunset = { ...DEFAULT_OPTIONS, dayBoundary: 'sunset', hour: 20 } as const
    const evening = traceFor(jdn, sunset)
    const nextDay = traceFor(jdn + 1)
    expect(evening.weton.name).toBe(nextDay.weton.name)
    expect(evening.wuku.name).toBe(nextDay.wuku.name)
    expect(formatLunar(evening)).toBe(formatLunar(nextDay))
  })
})

describe('purity', () => {
  it('has no clock — the same call cannot drift between invocations', () => {
    const first = traceFor(jdnOf('2000-01-01'))
    const second = traceFor(jdnOf('2000-01-01'))
    expect(first).toEqual(second)
  })

  it('does not mutate the options it is given', () => {
    const options = { ...DEFAULT_OPTIONS }
    const frozen = JSON.stringify(options)
    traceFor(jdnOf('2000-01-01'), options)
    expect(JSON.stringify(options)).toBe(frozen)
  })
})
