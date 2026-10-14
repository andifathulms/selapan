'use client'

import { useEffect, useState } from 'react'
import { gregorianToJdn } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { MonthGrid } from '@/components/grid/MonthGrid'
import { CycleWheels } from '@/components/wheels/CycleWheels'
import { useDateState } from '@/components/controls/useDateState'
import { MangsaYear } from './MangsaYear'

type View = 'month' | 'mangsa'

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

/**
 * Two readings of the calendar around the shared date: the month, in the
 * wall-calendar layout, and the solar year, as the twelve mangsa. Mangsa
 * lives here rather than on the weton page because it is a question about
 * the year — which season is this — not about one day.
 *
 * The date comes from the header's date pill; selecting a day here moves it.
 */
export function CalendarView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate } = useDateState()
  const [view, setView] = useState<View>('month')

  // The retired /mangsa/ route lands here with ?view=mangsa.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'mangsa') setView('mangsa')
  }, [])

  const { year, month } = state.date
  const trace = traceFor(jdn, state.options)

  const stepMonth = (delta: number) => {
    const target = month - 1 + delta
    const nextYear = year + Math.floor(target / 12)
    const nextMonth = ((target % 12) + 12) % 12 + 1
    setDate({ year: nextYear, month: nextMonth, day: 1 })
  }

  return (
    <div>
      <div className="seg" role="group" aria-label={t.kalender.title}>
        <button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>
          {t.kalender.viewMonth}
        </button>
        <button type="button" aria-pressed={view === 'mangsa'} onClick={() => setView('mangsa')}>
          {t.kalender.viewYear}
        </button>
      </div>

      {view === 'mangsa' ? (
        <MangsaYear t={t} date={state.date} trace={trace} />
      ) : (
        <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-ui text-section font-semibold">
          {MONTHS_ID[month - 1]} <span className="font-mono tabular-nums">{year}</span>
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            aria-label={t.common.previousMonth}
            title={t.common.previousMonth}
            className="btn w-11 font-mono"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            aria-label={t.common.nextMonth}
            title={t.common.nextMonth}
            className="btn w-11 font-mono"
          >
            →
          </button>
        </div>
      </div>

      {/* Selecting a cell moves the ray — the wheel renders the same trace
          the grid does, so there is nothing to wire beyond passing it
          (DESIGN-REWORK §3.3). Small here: the grid is the reading, not the
          instrument. */}
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
        <MonthGrid
          year={year}
          month={month}
          options={state.options}
          today={hydrated ? jdn : undefined}
          onSelect={(day) => setDate({ year, month, day })}
        />
        <div className="mx-auto w-full max-w-[220px] lg:sticky lg:top-24">
          {hydrated ? <CycleWheels trace={trace} /> : <div className="aspect-square" />}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/60">{t.kalender.legend}</p>

      <dl className="panel mt-6 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 p-5 text-sm">
        <dt className="rule-label pt-[0.2em]">{t.labels.weton}</dt>
        <dd className="computed">{trace.weton.name}</dd>
        <dt className="rule-label pt-[0.2em]">{t.labels.lunar}</dt>
        <dd className={trace.lunar.type === 'ok' ? 'computed' : 'unverified-value'}>
          {trace.lunar.type === 'ok'
            ? `${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj} ${trace.lunar.value.windu}`
            : t.common.refused}
        </dd>
        <dt className="rule-label pt-[0.2em]">{t.labels.wuku}</dt>
        <dd className={trace.wuku.derivation.status === 'unverified' ? 'unverified-value' : 'computed'}>
          {trace.wuku.name}
        </dd>
        <dt className="rule-label pt-[0.2em]">{t.labels.jdn}</dt>
        <dd className="computed">{gregorianToJdn(state.date)}</dd>
      </dl>
        </>
      )}
    </div>
  )
}
