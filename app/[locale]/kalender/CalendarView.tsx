'use client'

import { useEffect, useState } from 'react'
import { formatGregorian, gregorianToJdn, jdnToGregorian } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import { mangsaFor } from '@/lib/mangsa'
import { selapananDates } from '@/lib/selapanan'
import type { Dictionary } from '@/lib/i18n'
import { MonthGrid } from '@/components/grid/MonthGrid'
import { MonthBands } from '@/components/grid/MonthBands'
import { CycleWheels } from '@/components/wheels/CycleWheels'
import { useDateState } from '@/components/controls/useDateState'
import { todayLocal } from '@/components/today'
import { longDate, positionOf } from '@/components/format'
import { MangsaYear } from './MangsaYear'

type View = 'month' | 'mangsa'

/**
 * Two readings of the calendar around the shared date: the month, in the
 * wall-calendar layout, and the solar year, as the twelve mangsa. Mangsa
 * lives here rather than on the weton page because it is a question about
 * the year — which season is this — not about one day.
 *
 * The date comes from the header's date pill; selecting a day here moves
 * it, and the panel beside the grid reads that day on the instrument.
 */
export function CalendarView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate } = useDateState()
  const [view, setView] = useState<View>('month')
  const [todayJdn, setTodayJdn] = useState<number | undefined>(undefined)

  // The retired /mangsa/ route lands here with ?view=mangsa.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'mangsa') setView('mangsa')
    setTodayJdn(gregorianToJdn(todayLocal()))
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
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-title">
                {t.common.months[month - 1]} <span className="tabular-nums">{year}</span>
              </h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => stepMonth(-1)}
                  aria-label={t.common.previousMonth}
                  title={t.common.previousMonth}
                  className="btn h-11 w-11 rounded-full px-0 text-xl"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => stepMonth(1)}
                  aria-label={t.common.nextMonth}
                  title={t.common.nextMonth}
                  className="btn h-11 w-11 rounded-full px-0 text-xl"
                >
                  ›
                </button>
              </div>
            </div>

            <MonthBands year={year} month={month} options={state.options} selected={state.date.day} t={t} />

            <MonthGrid
              year={year}
              month={month}
              options={state.options}
              today={todayJdn}
              selected={hydrated ? state.date.day : undefined}
              onSelect={(day) => setDate({ year, month, day })}
              t={t}
            />

            <p className="text-sm text-ink/65">{t.kalender.legend}</p>
          </div>

          <aside className="lg:sticky lg:top-24">
            {hydrated ? (
              <CycleWheels trace={trace} compact footer={<SelectedDay jdn={jdn} t={t} options={state.options} />} />
            ) : (
              <div className="instrument instrument-panel aspect-[3/5]" />
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

/** The selected day, read off its trace, on the instrument surface. */
function SelectedDay({
  jdn,
  t,
  options,
}: {
  jdn: number
  t: Dictionary
  options: Parameters<typeof traceFor>[1]
}) {
  const trace = traceFor(jdn, options)
  const mangsa = mangsaFor(trace.gregorian)
  const next = selapananDates(jdn, 1)[0]

  return (
    <div aria-live="polite">
      <p className="rule-label">{t.kalender.selected}</p>
      <p key={trace.weton.name} className="answer-fade mt-1 font-display text-3xl leading-none text-indigo">
        {trace.weton.name}
      </p>
      <p className="mt-1 font-ui text-sm text-ink/70">{longDate(trace, t)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t hairline pt-3 text-sm">
        <Item label={t.labels.neptu}>
          {trace.weton.neptu.dina} + {trace.weton.neptu.pasaran} = {trace.weton.neptu.total}
        </Item>
        <Item label={t.labels.jdn}>{trace.jdn}</Item>
        <Item
          label={t.labels.lunar}
          wide
          unverified={trace.lunar.type !== 'ok' || trace.lunar.value.derivation.status === 'unverified'}
        >
          {trace.lunar.type === 'ok'
            ? `${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`
            : t.common.refused}
        </Item>
        <Item label={t.labels.wuku} unverified={trace.wuku.derivation.status === 'unverified'}>
          {trace.wuku.name} · {trace.dayInWuku}/7
        </Item>
        <Item label={t.labels.mangsa} unverified={mangsa.type !== 'ok'}>
          {mangsa.type === 'ok'
            ? `${mangsa.value.entry.name} · ${positionOf('{n}/{m}', mangsa.value.dayWithin, mangsa.value.entry.lengthDays)}`
            : t.common.refused}
        </Item>
        {next ? (
          <Item label={t.common.nextSelapanan} wide>
            {formatGregorian(jdnToGregorian(next.jdn))}
          </Item>
        ) : null}
      </dl>
    </div>
  )
}

function Item({
  label,
  children,
  wide = false,
  unverified = false,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
  unverified?: boolean
}) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <dt className="rule-label">{label}</dt>
      <dd className={['mt-0.5 font-mono', unverified ? 'text-unverified' : 'text-indigo'].join(' ')}>{children}</dd>
    </div>
  )
}
