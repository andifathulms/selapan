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

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-prose text-2xl">
          {MONTHS_ID[month - 1]} <span className="font-mono tabular-nums">{year}</span>
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            className="border hairline px-3 py-1 font-mono text-sm hover:border-indigo hover:text-indigo"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            className="border hairline px-3 py-1 font-mono text-sm hover:border-indigo hover:text-indigo"
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

      <dl className="mt-6 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-t hairline pt-4 text-sm">
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
