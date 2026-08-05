/**
 * A proleptic Gregorian calendar date.
 *
 * Plain integers. Not a `Date`: there is no time, no zone, no clock.
 * `year` is astronomical — 1 BCE is year 0, 2 BCE is year -1.
 */
export type GregorianDate = {
  readonly year: number
  readonly month: number // 1–12
  readonly day: number // 1–31
}

/**
 * Julian Day Number — an integer count of days.
 *
 * The internal representation for every subsystem (PRD §7). JDN 0 is
 * 1 January 4713 BCE in the proleptic Julian calendar. Because it is a
 * plain integer, every cycle reduces to a modulo and every conversion is
 * reproducible by hand.
 */
export type Jdn = number
