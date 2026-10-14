'use client'

import { useEffect, useState } from 'react'
import { gregorianToJdn } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import { mangsaFor } from '@/lib/mangsa'
import type { Dictionary } from '@/lib/i18n'
import { todayLocal } from '@/components/today'
import { useDateState } from '@/components/controls/useDateState'
import { useArrowStepping } from '@/components/controls/useArrowStepping'
import { CycleWheels } from '@/components/wheels/CycleWheels'
import { InstrumentStepper } from '@/components/wheels/InstrumentStepper'
import { longDate } from '@/components/format'

/**
 * The front page answers before it explains: the weton for the shared date
 * — today, unless the reader has set another — its neptu, Javanese date,
 * wuku and mangsa, and the instrument beside it, turning.
 *
 * The clock lives in the UI, never in the engine (invariant 1), so the date
 * arrives after mount; the frame keeps its height until then. Everything
 * shown is a lookup into a trace the engine produced (invariant 16).
 */
export function TodayHero({
  t,
  intro,
  form,
}: {
  t: Dictionary
  /** The page's heading and lede, rendered by the server. */
  intro: React.ReactNode
  /** The birth-date form. */
  form: React.ReactNode
}) {
  const { state, hydrated, jdn, stepDays } = useDateState(undefined, { passive: true })
  useArrowStepping(stepDays)
  const [todayJdn, setTodayJdn] = useState<number | null>(null)
  useEffect(() => setTodayJdn(gregorianToJdn(todayLocal())), [])

  const trace = traceFor(jdn, state.options)
  const mangsa = mangsaFor(state.date)
  const isToday = todayJdn === jdn

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
      <div className="space-y-9">
        {intro}

        <div className="min-h-[13rem]">
          {hydrated ? (
            <>
              <p className="rule-label">
                {isToday ? `${t.home.todayLabel} · ` : ''}
                {longDate(trace, t)}
              </p>
              <p key={trace.weton.name} className="answer-fade mt-2 font-display text-figure text-indigo">
                {trace.weton.name}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                <Fact label={t.labels.neptu} value={String(trace.weton.neptu.total)} />
                {trace.lunar.type === 'ok' ? (
                  <Fact
                    label={t.labels.lunar}
                    value={`${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`}
                    unverified={trace.lunar.value.derivation.status === 'unverified'}
                  />
                ) : null}
                <Fact label={t.labels.wuku} value={trace.wuku.name} />
                {mangsa.type === 'ok' ? <Fact label={t.labels.mangsa} value={mangsa.value.entry.name} /> : null}
              </ul>
            </>
          ) : null}
        </div>

        {form}
      </div>

      <div className="lg:sticky lg:top-24">
        {hydrated ? (
          <CycleWheels
            trace={trace}
            onStep={stepDays}
            footer={<InstrumentStepper trace={trace} t={t} onStep={stepDays} />}
          />
        ) : (
          <div className="instrument instrument-panel aspect-[5/6]" />
        )}
        <p className="mt-3 text-sm text-ink/65">{t.home.todayHint}</p>
      </div>
    </section>
  )
}

function Fact({ label, value, unverified = false }: { label: string; value: string; unverified?: boolean }) {
  return (
    <li className="chip">
      <span className="chip-label">{label}</span>
      <span className={unverified ? 'font-mono text-unverified' : 'font-mono text-indigo'}>{value}</span>
    </li>
  )
}
