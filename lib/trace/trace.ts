import { jdnToGregorian, type Jdn } from '@/lib/jdn'
import { dayInWukuOf, dinaOf, pasaranOf, wetonOf, wukuOf } from '@/lib/cycles'
import { lunarFromJdn } from '@/lib/lunar'
import { DEFAULT_OPTIONS, type CalendarTrace, type TraceOptions } from './types'

/**
 * The engine's single entry point: `(jdn, options) → CalendarTrace`.
 *
 * Pure. No React, no DOM, no clock, no randomness, no module-level mutable
 * state (CLAUDE.md invariant 7). "Today" is resolved in the UI and passed in
 * as a JDN — this function has no way to ask what day it is, by design.
 */

/**
 * The hour at which a sunset-reckoned day is taken to turn over.
 *
 * A stated convention, not a computed sunset. Computing true sunset would
 * need a latitude, a longitude, and floating-point astronomy, none of which
 * belong in an integer day-count engine. Anyone reckoning by actual sunset
 * should treat this as an approximation and say so — which the UI does.
 */
export const SUNSET_HOUR = 18

/**
 * The day the reckoning actually lands on.
 *
 * Javanese days traditionally begin at sunset, as Hijri days do, so an
 * evening event belongs to the following weton. Most implementations ignore
 * this silently; here it is an explicit option defaulting to midnight
 * (CLAUDE.md invariant 14).
 */
export function effectiveJdn(jdn: Jdn, options: TraceOptions): Jdn {
  if (options.dayBoundary !== 'sunset') return jdn
  const hour = options.hour ?? 0
  return hour >= SUNSET_HOUR ? jdn + 1 : jdn
}

/** Everything the engine knows about one day. */
export function traceFor(
  jdn: Jdn,
  options: TraceOptions = DEFAULT_OPTIONS,
): CalendarTrace {
  const effective = effectiveJdn(jdn, options)

  return {
    jdn: effective,
    gregorian: jdnToGregorian(effective),
    options,
    dina: dinaOf(effective),
    pasaran: pasaranOf(effective),
    weton: wetonOf(effective),
    wuku: wukuOf(effective),
    dayInWuku: dayInWukuOf(effective),
    lunar: lunarFromJdn(effective, options.reckoning),
  }
}

/** Format a lunar date the way it is written, or say why there isn't one. */
export function formatLunar(trace: CalendarTrace): string {
  if (trace.lunar.type === 'refused') return '—'
  const { day, monthName, yearAj, windu } = trace.lunar.value
  return `${day} ${monthName} ${yearAj} ${windu}`
}
