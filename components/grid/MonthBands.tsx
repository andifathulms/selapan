'use client'

import { daysInMonth, gregorianToJdn } from '@/lib/jdn'
import { traceFor, type TraceOptions } from '@/lib/trace'
import { mangsaOfJdn } from '@/lib/mangsa'
import type { Dictionary } from '@/lib/i18n'

type Run = {
  readonly label: string
  readonly from: number
  readonly to: number
  readonly unverified: boolean
}

/**
 * Where the longer cycles turn inside this Gregorian month: the Javanese
 * month, the wuku, and the mangsa, each as a band across the days it covers.
 * Three systems with three different lengths, none of them aligned with the
 * Gregorian month — which is the thing a grid of small print hides and a
 * band shows at a glance.
 *
 * Every label is read off a trace or a mangsa lookup the engine produced;
 * this only groups consecutive equal labels into runs. A refused lunar day
 * (pre-1633) is a run of its own, marked as refused, never filled in.
 */
export function MonthBands({
  year,
  month,
  options,
  selected,
  t,
}: {
  year: number
  month: number
  options: TraceOptions
  selected?: number
  t: Dictionary
}) {
  const length = daysInMonth(year, month)
  const firstJdn = gregorianToJdn({ year, month, day: 1 })
  const days = Array.from({ length }, (_, i) => {
    const jdn = firstJdn + i
    const trace = traceFor(jdn, options)
    const mangsa = mangsaOfJdn(jdn)
    return {
      lunar:
        trace.lunar.type === 'ok'
          ? { label: `${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`, unverified: trace.lunar.value.derivation.status === 'unverified' }
          : { label: t.common.refused, unverified: true },
      wuku: { label: trace.wuku.name, unverified: trace.wuku.derivation.status === 'unverified' },
      mangsa:
        mangsa.type === 'ok'
          ? { label: `${mangsa.value.entry.name} (${mangsa.value.entry.numeral})`, unverified: false }
          : { label: t.common.refused, unverified: true },
    }
  })

  const rows: ReadonlyArray<{ name: string; runs: ReadonlyArray<Run> }> = [
    { name: t.labels.lunar, runs: runsOf(days.map((d) => d.lunar)) },
    { name: t.labels.wuku, runs: runsOf(days.map((d) => d.wuku)) },
    { name: t.labels.mangsa, runs: runsOf(days.map((d) => d.mangsa)) },
  ]

  return (
    <div className="space-y-1.5" aria-hidden="true">
      {rows.map((row) => (
        <div key={row.name} className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
          <span className="truncate font-ui text-[0.62rem] font-semibold uppercase tracking-wider text-ink/60 sm:text-[0.68rem]">
            {row.name}
          </span>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
            {row.runs.map((run) => {
              const current = selected !== undefined && selected >= run.from && selected <= run.to
              return (
                <span
                  key={`${run.from}-${run.label}`}
                  title={`${run.label} · ${run.from}–${run.to}`}
                  style={{ gridColumn: `${run.from} / ${run.to + 1}` }}
                  className={[
                    'truncate rounded-[6px] px-1.5 py-1 font-ui text-[0.65rem] leading-tight sm:text-xs',
                    run.unverified
                      ? 'border border-dashed border-unverified/60 text-unverified'
                      : current
                        ? 'bg-indigo/15 font-semibold text-indigo'
                        : 'bg-paper-deep text-ink/80',
                  ].join(' ')}
                >
                  {run.label}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function runsOf(values: ReadonlyArray<{ label: string; unverified: boolean }>): ReadonlyArray<Run> {
  const runs: Run[] = []
  values.forEach((value, i) => {
    const day = i + 1
    const last = runs[runs.length - 1]
    if (last && last.label === value.label) {
      runs[runs.length - 1] = { ...last, to: day }
    } else {
      runs.push({ label: value.label, from: day, to: day, unverified: value.unverified })
    }
  })
  return runs
}
