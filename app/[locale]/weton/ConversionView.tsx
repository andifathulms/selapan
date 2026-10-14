'use client'

import { useState } from 'react'
import { formatGregorian, jdnToGregorian } from '@/lib/jdn'
import { SASI } from '@/lib/cycles'
import { ERA_YEAR_AJ, MAX_YEAR_AJ, jdnFromLunar } from '@/lib/lunar'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { CycleWheels, type HighlightRing } from '@/components/wheels/CycleWheels'
import { useDateState } from '@/components/controls/useDateState'
import { ReckoningOptions } from '@/components/controls/ReckoningOptions'
import { ShareButton } from '@/components/controls/ShareButton'
import { RefusalNotice, TraceValue } from '@/components/trace/TraceValue'

/**
 * Gregorian in, the full Javanese reckoning out, every value expandable
 * (PRD §6.2). Nothing is computed in this component — it renders a trace the
 * engine produced (CLAUDE.md invariant 16).
 *
 * The date itself is set in the header's date pill, shared with every page;
 * this page carries the two choices that change how a date is reckoned, and
 * the way to share the result. Selapanan now lives on /hitungan/ and the
 * mangsa year on /kalender/, each on its own page.
 */
export function ConversionView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate, setReckoning, setDayBoundary, setHour } = useDateState()
  const [highlightRing, setHighlightRing] = useState<HighlightRing | null>(null)

  const trace = traceFor(jdn, state.options)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ReckoningOptions
          options={state.options}
          t={t}
          onReckoning={setReckoning}
          onDayBoundary={setDayBoundary}
          onHour={setHour}
        />
        <ShareButton t={t} title={`${trace.weton.name} · ${formatGregorian(trace.gregorian)}`} />
      </div>

      {/* The answer, before the apparatus that produced it. The weton is the
          pair, so it has no derivation of its own — the dina and pasaran rows
          below carry the two that make it. */}
      <section className="mt-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b hairline pb-6">
        <div>
          <span className="rule-label">{t.labels.weton}</span>
          <p key={trace.weton.name} className="computed answer-fade mt-1 font-display text-figure">
            {trace.weton.name}
          </p>
        </div>
        <p className="font-mono text-sm text-ink/60">
          {formatGregorian(trace.gregorian)} · {t.labels.neptu} {trace.weton.neptu.total}
        </p>
      </section>

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-12">
        <div className="order-2 space-y-8 md:order-1">
          <DateSweep trace={trace} t={t} onHighlightChange={setHighlightRing} />
        </div>

        {/* The wheels lead on a phone: they carry the idea, and the rows are
            the detail underneath it. On a wide screen both are in view. */}
        <section className="order-1 md:order-2 md:sticky md:top-24">
          {hydrated ? (
            <CycleWheels trace={trace} highlightRing={highlightRing} />
          ) : (
            <div className="aspect-square" />
          )}
          <p className="mt-4 max-w-measure text-sm leading-relaxed text-ink/65">
            {t.ubah.wheelsCaption}
          </p>
        </section>
      </div>

      <ReverseConversion t={t} reckoning={state.options.reckoning} onResult={setDate} />
    </div>
  )
}

function DateSweep({
  trace,
  t,
  onHighlightChange,
}: {
  trace: ReturnType<typeof traceFor>
  t: Dictionary
  onHighlightChange: (ring: HighlightRing | null) => void
}) {
  const handleRing = (key: string | null) => onHighlightChange(key as HighlightRing | null)

  return (
    <>
      <section>
        <h2 className="rule-label border-b hairline pb-2">{t.ubah.groupDay}</h2>
        <TraceValue
          label={t.labels.dina}
          value={trace.dina.name}
          derivation={trace.dina.derivation}
          t={t}
          ringKey="dina"
          onOpenChange={handleRing}
        />
        <TraceValue
          label={t.labels.pasaran}
          value={trace.pasaran.name}
          derivation={trace.pasaran.derivation}
          t={t}
          ringKey="pasaran"
          onOpenChange={handleRing}
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
          ringKey="wuku"
          onOpenChange={handleRing}
        />
      </section>

      {/* The lunar year is a separate subsystem with its own validity
          range, and grouping it separately is what makes a refusal here
          read as one subsystem declining rather than the page failing. */}
      <section>
        <h2 className="rule-label border-b hairline pb-2">{t.ubah.groupYear}</h2>
        {trace.lunar.type === 'ok' ? (
          <>
            <TraceValue
              label={t.labels.lunar}
              value={`${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`}
              derivation={trace.lunar.value.derivation}
              t={t}
              emphasis
              ringKey="lunar"
              onOpenChange={handleRing}
            />
            <TraceValue label={t.labels.windu} value={trace.lunar.value.windu} t={t} />
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
      </section>

      <section>
        <h2 className="rule-label border-b hairline pb-2">{t.ubah.groupReference}</h2>
        <TraceValue label={t.labels.gregorian} value={formatGregorian(trace.gregorian)} t={t} />
        <TraceValue label={t.labels.jdn} value={String(trace.jdn)} t={t} />
      </section>
    </>
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
    <section className="panel mt-14 p-6 sm:p-7">
      <h2 className="font-ui text-section font-semibold">{t.ubah.reverse}</h2>
      <p className="mt-2 max-w-measure text-ink/75">{t.ubah.reverseIntro}</p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="rule-label">{t.ubah.year}</span>
          <input
            type="number"
            min={ERA_YEAR_AJ}
            max={MAX_YEAR_AJ}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="field w-28"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="rule-label">{t.ubah.month}</span>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="field"
          >
            {SASI.map((name, i) => (
              <option key={name} value={i + 1}>
                {i + 1}. {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="rule-label">{t.ubah.day}</span>
          <input
            type="number"
            min={1}
            max={30}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="field w-24"
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
