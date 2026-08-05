'use client'

import { mangsaFor } from '@/lib/mangsa'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'

export function MangsaView({ t }: { t: Dictionary }) {
  const { state, jdn, setDate, stepDays, goToday } = useDateState()
  const result = mangsaFor(state.date)
  const trace = traceFor(jdn, state.options)

  return (
    <div>
      <DateControls
        date={state.date}
        options={state.options}
        t={t}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        showOptions={false}
      />

      <section className="mt-8 border hairline p-6">
        <span className="rule-label">{t.mangsa.current}</span>
        {result.type === 'ok' ? (
          <>
            <p className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="computed text-3xl">{result.value.entry.name}</span>
              <span className="font-mono text-lg text-ink/50">{result.value.entry.numeral}</span>
              <span className="font-mono text-sm text-ink/60">
                {result.value.dayWithin}/{result.value.entry.lengthDays}
              </span>
            </p>
            <p className="mt-4 max-w-prose text-ink/80">
              <span className="rule-label">{t.mangsa.marker}</span> {result.value.entry.marker}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 unverified-value text-3xl">{t.common.refused}</p>
            <p className="mt-3 max-w-prose text-sm text-ink/70">{result.refusal.reason}</p>
          </>
        )}

        {/* The independence is the point: the same day, reckoned two ways
            that share nothing. */}
        <p className="mt-5 border-t hairline pt-4 font-mono text-sm text-ink/55">
          {trace.weton.name} · {trace.wuku.name}
          {trace.lunar.type === 'ok'
            ? ` · ${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`
            : ''}
        </p>
      </section>
    </div>
  )
}
