'use client'

import { useState } from 'react'
import { formatGregorian, jdnToGregorian } from '@/lib/jdn'
import { SASI } from '@/lib/cycles'
import { ERA_YEAR_AJ, MAX_YEAR_AJ, jdnFromLunar } from '@/lib/lunar'
import { traceFor, type CalendarTrace } from '@/lib/trace'
import { mangsaFor } from '@/lib/mangsa'
import type { Dictionary } from '@/lib/i18n'
import { CycleWheels, type HighlightRing } from '@/components/wheels/CycleWheels'
import { useDateState } from '@/components/controls/useDateState'
import { useArrowStepping } from '@/components/controls/useArrowStepping'
import { InstrumentStepper } from '@/components/wheels/InstrumentStepper'
import { ReckoningOptions } from '@/components/controls/ReckoningOptions'
import { ShareButton } from '@/components/controls/ShareButton'
import { RefusalNotice, TraceValue } from '@/components/trace/TraceValue'
import { NeptuPips } from '@/components/answer/NeptuPips'
import { longDate, positionOf } from '@/components/format'

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
  const { state, hydrated, jdn, setDate, stepDays, setReckoning, setDayBoundary, setHour } =
    useDateState()
  useArrowStepping(stepDays)
  const [highlightRing, setHighlightRing] = useState<HighlightRing | null>(null)

  const trace = traceFor(jdn, state.options)
  // The other reckoning, beside this one — both are first-class, and a
  // reader from an Aboge community sees their own date without switching
  // (CLAUDE.md invariant 6).
  const other = traceFor(jdn, {
    ...state.options,
    reckoning: state.options.reckoning === 'aboge' ? 'chronological' : 'aboge',
  })
  const mangsa = mangsaFor(state.date)

  return (
    <div>
      {/* Three blocks: the answer, the instrument, the working. On a phone
          they stack in that order — the answer first, as the home page
          promises. On a wide screen the instrument holds the right column
          beside both. */}
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-x-12">
        {/* The answer, before the apparatus that produced it. The weton is
            the pair, so it has no derivation of its own — the dina and
            pasaran rows below carry the two that make it. */}
        <section className="space-y-5 md:col-start-1 md:row-start-1">
          <p className="rule-label">
            {longDate(trace, t)} · JDN <span className="font-mono normal-case tracking-normal">{trace.jdn}</span>
          </p>
          <p key={trace.weton.name} className="computed answer-fade font-display text-figure">
            {trace.weton.name}
          </p>
          <NeptuPips trace={trace} />
          <Facts trace={trace} other={other} t={t} mangsa={mangsa} />
          <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
            <ReckoningOptions
              options={state.options}
              t={t}
              onReckoning={setReckoning}
              onDayBoundary={setDayBoundary}
              onHour={setHour}
            />
            <ShareButton t={t} title={`${trace.weton.name} · ${formatGregorian(trace.gregorian)}`} />
          </div>
        </section>

        <section className="md:sticky md:top-24 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start">
          {hydrated ? (
            <CycleWheels
              trace={trace}
              highlightRing={highlightRing}
              onStep={stepDays}
              footer={<InstrumentStepper trace={trace} t={t} onStep={stepDays} />}
            />
          ) : (
            <div className="instrument instrument-panel aspect-square" />
          )}
          <p className="mt-4 max-w-measure text-sm leading-relaxed text-ink/65">
            {t.ubah.wheelsCaption}
          </p>
        </section>

        <div className="space-y-8 md:col-start-1 md:row-start-2">
          <DateSweep trace={trace} t={t} onHighlightChange={setHighlightRing} />
        </div>
      </div>

      <ReverseConversion t={t} reckoning={state.options.reckoning} onResult={setDate} />
    </div>
  )
}

/** The facts a reader most often needs, each with its name attached. All
    computed, so all indigo — grey where a value rests on an unverified
    anchor or the subsystem declined to answer. */
function Facts({
  trace,
  other,
  mangsa,
  t,
}: {
  trace: CalendarTrace
  other: CalendarTrace
  mangsa: ReturnType<typeof mangsaFor>
  t: Dictionary
}) {
  const lunar = trace.lunar
  const otherLunar = other.lunar
  const otherName = other.options.reckoning === 'aboge' ? 'Aboge' : 'Asapon'

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border hairline bg-ink/10 sm:grid-cols-3">
      {lunar.type === 'ok' ? (
        <>
          <Fact
            label={t.labels.lunar}
            value={`${lunar.value.day} ${lunar.value.monthName}`}
            note={`${t.labels.tahun} ${lunar.value.yearAj}`}
            unverified={lunar.value.derivation.status === 'unverified'}
          />
          <Fact label={t.labels.windu} value={lunar.value.windu} note={`${t.labels.tahun} ${lunar.value.yearAj}`} />
          <Fact label={t.labels.kurup} value={lunar.value.kurupName} />
        </>
      ) : (
        <Fact label={t.labels.lunar} value={t.common.refused} note={lunar.refusal.validFrom} unverified wide />
      )}
      <Fact
        label={t.labels.wuku}
        value={trace.wuku.name}
        note={positionOf(t.common.dayOf, trace.dayInWuku, 7)}
        unverified={trace.wuku.derivation.status === 'unverified'}
      />
      {mangsa.type === 'ok' ? (
        <Fact
          label={t.labels.mangsa}
          value={mangsa.value.entry.name}
          note={positionOf(t.common.dayOf, mangsa.value.dayWithin, mangsa.value.entry.lengthDays)}
        />
      ) : (
        <Fact label={t.labels.mangsa} value={t.common.refused} unverified />
      )}
      {lunar.type === 'ok' && otherLunar.type === 'ok' ? (
        <Fact
          label={otherName}
          value={`${otherLunar.value.day} ${otherLunar.value.monthName}`}
          note={`${t.labels.tahun} ${otherLunar.value.yearAj}`}
          unverified={otherLunar.value.derivation.status === 'unverified'}
        />
      ) : null}
    </dl>
  )
}

function Fact({
  label,
  value,
  note,
  unverified = false,
  wide = false,
}: {
  label: string
  value: string
  note?: string
  unverified?: boolean
  wide?: boolean
}) {
  return (
    <div className={['bg-paper-raised px-4 py-3', wide ? 'col-span-2 sm:col-span-2' : ''].join(' ')}>
      <dt className="rule-label">{label}</dt>
      <dd className={['mt-0.5 font-mono text-[1.05rem]', unverified ? 'text-unverified' : 'text-indigo'].join(' ')}>
        {value}
      </dd>
      {note ? <dd className="font-ui text-xs text-ink/60">{note}</dd> : null}
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
