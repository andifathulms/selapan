'use client'

import { formatGregorian } from '@/lib/jdn'
import type { CalendarTrace } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The day either side, on the instrument itself — the rings turn under the
 * reader's thumb. Renders a trace it was handed; computes nothing.
 */
export function InstrumentStepper({
  trace,
  t,
  onStep,
}: {
  trace: CalendarTrace
  t: Dictionary
  onStep: (delta: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label={t.common.previousDay}
        title={t.common.previousDay}
        className="btn h-11 w-11 rounded-full px-0 text-xl"
      >
        ‹
      </button>
      <div className="min-w-0 flex-1 text-center sm:max-w-[14rem]">
        <span key={trace.weton.name} className="answer-fade block font-display text-xl leading-tight text-indigo">
          {trace.weton.name}
        </span>
        <span className="font-mono text-xs text-ink/60">{formatGregorian(trace.gregorian)}</span>
      </div>
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label={t.common.nextDay}
        title={t.common.nextDay}
        className="btn h-11 w-11 rounded-full px-0 text-xl"
      >
        ›
      </button>
    </div>
  )
}
