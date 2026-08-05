'use client'

import { useState } from 'react'
import { formatGregorian, jdnToGregorian } from '@/lib/jdn'
import { SASI } from '@/lib/cycles'
import { ERA_YEAR_AJ, MAX_YEAR_AJ, jdnFromLunar } from '@/lib/lunar'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { CycleWheels } from '@/components/wheels/CycleWheels'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'
import { RefusalNotice, TraceValue } from '@/components/trace/TraceValue'

/**
 * Gregorian in, the full Javanese reckoning out, every value expandable
 * (PRD §6.2). Nothing is computed in this component — it renders a trace the
 * engine produced (CLAUDE.md invariant 16).
 */
export function ConversionView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate, stepDays, goToday, setReckoning, setDayBoundary, setHour } =
    useDateState()

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
        onReckoning={setReckoning}
        onDayBoundary={setDayBoundary}
        onHour={setHour}
      />

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section>
          {/* The weton is the pair, so it has no derivation of its own —
              the dina and pasaran rows below carry the two that make it. */}
          <TraceValue label={t.labels.weton} value={trace.weton.name} t={t} emphasis />
          <TraceValue
            label={t.labels.dina}
            value={trace.dina.name}
            derivation={trace.dina.derivation}
            t={t}
          />
          <TraceValue
            label={t.labels.pasaran}
            value={trace.pasaran.name}
            derivation={trace.pasaran.derivation}
            t={t}
          />
          <TraceValue
            label={t.labels.neptu}
            value={`${trace.weton.neptu.dina} + ${trace.weton.neptu.pasaran} = ${trace.weton.neptu.total}`}
            t={t}
          />
          <TraceValue
            label={t.labels.wuku}
            value={`${trace.wuku.name} · ${trace.dayInWuku}/7`}
            derivation={trace.wuku.derivation}
            t={t}
          />

          {trace.lunar.type === 'ok' ? (
            <>
              <TraceValue
                label={t.labels.lunar}
                value={`${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`}
                derivation={trace.lunar.value.derivation}
                t={t}
                emphasis
              />
              <TraceValue
                label={t.labels.windu}
                value={trace.lunar.value.windu}
                t={t}
              />
              <TraceValue
                label={t.labels.kurup}
                value={`${trace.lunar.value.kurupName} · ${trace.lunar.value.kurupMnemonic}`}
                t={t}
              />
            </>
          ) : (
            <RefusalNotice
              label={t.labels.lunar}
              reason={trace.lunar.refusal.reason}
              validFrom={trace.lunar.refusal.validFrom}
              validTo={trace.lunar.refusal.validTo}
              t={t}
            />
          )}

          <TraceValue label={t.labels.jdn} value={String(trace.jdn)} t={t} />
          <TraceValue
            label={t.labels.gregorian}
            value={formatGregorian(trace.gregorian)}
            t={t}
          />
        </section>

        <section>
          {hydrated ? <CycleWheels trace={trace} /> : <div className="aspect-square" />}
          <p className="mt-4 text-sm text-ink/60">{t.ubah.wheelsCaption}</p>
        </section>
      </div>

      <ReverseConversion t={t} reckoning={state.options.reckoning} onResult={setDate} />
    </div>
  )
}

/** Javanese date in, Gregorian out — the same engine, run backwards. */
function ReverseConversion({
  t,
  reckoning,
  onResult,
}: {
  t: Dictionary
  reckoning: 'chronological' | 'aboge'
  onResult: (date: { year: number; month: number; day: number }) => void
}) {
  const [year, setYear] = useState(1959)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)

  const result = jdnFromLunar(year, month, day, reckoning)

  return (
    <section className="mt-14 border-t hairline pt-8">
      <h2 className="font-prose text-2xl">{t.ubah.reverse}</h2>
      <p className="mt-2 max-w-prose text-ink/75">{t.ubah.reverseIntro}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="rule-label">{t.ubah.year}</span>
          <input
            type="number"
            min={ERA_YEAR_AJ}
            max={MAX_YEAR_AJ}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-28 border hairline bg-transparent px-3 py-1.5 font-mono tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="rule-label">{t.ubah.month}</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border hairline bg-transparent px-3 py-1.5 font-ui"
          >
            {SASI.map((name, i) => (
              <option key={name} value={i + 1}>
                {i + 1}. {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="rule-label">{t.ubah.day}</span>
          <input
            type="number"
            min={1}
            max={30}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-24 border hairline bg-transparent px-3 py-1.5 font-mono tabular-nums"
          />
        </label>
      </div>

      <div className="mt-5 border-t hairline pt-4">
        {result.type === 'ok' ? (
          <button
            type="button"
            onClick={() => onResult(jdnToGregorian(result.value))}
            className="text-left"
          >
            <span className="rule-label block">{t.labels.gregorian}</span>
            <span className="computed text-2xl underline decoration-indigo/30 underline-offset-4">
              {formatGregorian(jdnToGregorian(result.value))}
            </span>
            <span className="ml-3 font-mono text-sm text-ink/55">
              {traceFor(result.value).weton.name}
            </span>
          </button>
        ) : (
          <>
            <span className="rule-label block">{t.common.refused}</span>
            <p className="mt-1 max-w-prose text-sm text-ink/70">{result.refusal.reason}</p>
          </>
        )}
      </div>
    </section>
  )
}
