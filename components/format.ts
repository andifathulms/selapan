import type { CalendarTrace } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * Display formatting for values a trace already holds. Formatting only —
 * nothing here computes a date (CLAUDE.md invariant 16); the weekday comes
 * from the trace's own dina index, which shares the Gregorian week's order.
 */
export function longDate(trace: CalendarTrace, t: Dictionary): string {
  const { year, month, day } = trace.gregorian
  return `${t.common.weekdays[trace.dina.index] ?? ''}, ${day} ${t.common.months[month - 1] ?? ''} ${year}`
}

/** Fill a "{n} of {m}" template. */
export function positionOf(template: string, n: number, m: number): string {
  return template.replace('{n}', String(n)).replace('{m}', String(m))
}
