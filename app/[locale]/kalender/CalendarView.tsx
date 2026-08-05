'use client'

import { gregorianToJdn } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { MonthGrid } from '@/components/grid/MonthGrid'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'

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

export function CalendarView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate, stepDays, goToday, setReckoning, setDayBoundary } =
    useDateState()

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
      <DateControls
        date={state.date}
        options={state.options}
        t={t}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        onReckoning={setReckoning}
        onDayBoundary={setDayBoundary}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-prose text-section">
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

      <div className="mt-4">
        <MonthGrid
          year={year}
          month={month}
          options={state.options}
          today={hydrated ? jdn : undefined}
          onSelect={(day) => setDate({ year, month, day })}
        />
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
        <dd className="unverified-value">{trace.wuku.name}</dd>
        <dt className="rule-label pt-[0.2em]">{t.labels.jdn}</dt>
        <dd className="computed">{gregorianToJdn(state.date)}</dd>
      </dl>
    </div>
  )
}
