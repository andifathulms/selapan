'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { daysInMonth, formatGregorian, gregorianToJdn } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import type { Dictionary, Locale } from '@/lib/i18n'

/**
 * A birth date as three plain fields. The native date picker opens on this
 * month and makes the reader scroll back through decades to reach 1972;
 * day, month and year are faster to give than to find.
 *
 * The weton is previewed as the fields change, so the answer arrives before
 * the button is pressed. An impossible date — 31 February — is said to be
 * impossible rather than silently rolled into March (CLAUDE.md invariant 4,
 * in spirit: never a plausible wrong date).
 */
export function BirthdayForm({ t, locale }: { t: Dictionary; locale: Locale }) {
  const id = useId()
  const [day, setDay] = useState(17)
  const [month, setMonth] = useState(8)
  const [year, setYear] = useState(1945)

  const validYear = Number.isInteger(year) && year >= 1 && year <= 9999
  const valid = validYear && day >= 1 && day <= daysInMonth(year, month)
  const date = { year, month, day }
  const trace = valid ? traceFor(gregorianToJdn(date)) : null

  return (
    <form
      className="panel grid gap-4 p-5 sm:p-6"
      onSubmit={(e) => e.preventDefault()}
      aria-describedby={`${id}-note`}
    >
      <div>
        <h2 className="font-ui text-section font-semibold">{t.home.birthTitle}</h2>
        <p id={`${id}-note`} className="mt-1 text-[0.95rem] text-ink/70">
          {t.home.birthNote}
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-2">
        <label htmlFor={`${id}-d`} className="flex min-w-0 flex-col gap-1.5">
          <span className="rule-label">{t.home.birthDay}</span>
          <select id={`${id}-d`} value={day} onChange={(e) => setDay(Number(e.target.value))} className="field w-full">
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-m`} className="flex min-w-0 flex-col gap-1.5">
          <span className="rule-label">{t.home.birthMonth}</span>
          <select id={`${id}-m`} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="field w-full">
            {t.common.months.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${id}-y`} className="flex min-w-0 flex-col gap-1.5">
          <span className="rule-label">{t.home.birthYear}</span>
          <input
            id={`${id}-y`}
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={Number.isNaN(year) ? '' : year}
            onChange={(e) => setYear(e.target.value === '' ? NaN : Number(e.target.value))}
            className="field w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4" aria-live="polite">
        {trace ? (
          <>
            <p className="min-w-0">
              <span key={trace.weton.name} className="answer-fade font-display text-2xl text-indigo">
                {trace.weton.name}
              </span>
              <span className="ml-2 font-mono text-sm text-ink/60">neptu {trace.weton.neptu.total}</span>
            </p>
            <Link
              href={`/${locale}/weton/#t=${formatGregorian(date)}`}
              prefetch={false}
              className="btn btn-solid px-5"
            >
              {t.home.birthSubmit} →
            </Link>
          </>
        ) : (
          <p className="unverified-value text-sm">{t.home.birthInvalid}</p>
        )}
      </div>
    </form>
  )
}
