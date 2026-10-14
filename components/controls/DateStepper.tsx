'use client'

import { formatGregorian, parseGregorian, type GregorianDate } from '@/lib/jdn'
import type { Dictionary } from '@/lib/i18n'

/**
 * Which date is being reckoned: a field, a day either side, and today.
 *
 * Used in the header's date pill, where it is the date for every page, and
 * on Hitungan, where the date has a meaning of its own (a day of birth or of
 * death) and so earns a labelled field on the page itself.
 */
export function DateStepper({
  id,
  label,
  date,
  t,
  onDate,
  onStep,
  onToday,
}: {
  id: string
  label: string
  date: GregorianDate
  t: Dictionary
  onDate: (date: GregorianDate) => void
  onStep: (delta: number) => void
  onToday: () => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5">
        <span className="rule-label">{label}</span>
        <input
          id={id}
          type="date"
          value={formatGregorian(date)}
          onChange={(e) => {
            const parsed = parseGregorian(e.target.value)
            if (parsed) onDate(parsed)
          }}
          className="field text-base"
        />
      </label>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label={t.common.previousDay}
          title={t.common.previousDay}
          className="btn w-11 px-0 text-lg"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={t.common.nextDay}
          title={t.common.nextDay}
          className="btn w-11 px-0 text-lg"
        >
          ›
        </button>
        <button type="button" onClick={onToday} className="btn">
          {t.common.today}
        </button>
      </div>
    </div>
  )
}
