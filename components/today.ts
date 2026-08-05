import type { GregorianDate } from '@/lib/jdn'

/**
 * The one place a clock is read.
 *
 * The engine has no clock and cannot ask what day it is (CLAUDE.md invariant
 * 1). "Today" is resolved here, at the UI boundary, and passed in as a plain
 * integer triple. This is also the only `Date` in the repository, and it uses
 * the local calendar fields deliberately: a reader in Indonesia asking for
 * today means their today, not UTC's.
 */
export function todayLocal(): GregorianDate {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

/** The current local hour, for sunset reckoning. */
export function currentHourLocal(): number {
  return new Date().getHours()
}
