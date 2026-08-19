'use client'

import { useEffect, useState } from 'react'
import { formatGregorian, jdnToGregorian } from '@/lib/jdn'
import { SASI } from '@/lib/cycles'
import { ERA_YEAR_AJ, MAX_YEAR_AJ, jdnFromLunar } from '@/lib/lunar'
import { mangsaSource, mangsaTable, windowLabel } from '@/lib/mangsa'
import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { CycleWheels, type HighlightRing } from '@/components/wheels/CycleWheels'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'
import { RefusalNotice, TraceValue } from '@/components/trace/TraceValue'
import { MangsaView } from '@/app/[locale]/mangsa/MangsaView'
import { SelapananView } from '@/app/[locale]/selapanan/SelapananView'

type Sweep = 'date' | 'selapanan' | 'mangsa'

function isSweep(value: string | null): value is Sweep {
  return value === 'date' || value === 'selapanan' || value === 'mangsa'
}

/**
 * Gregorian in, the full Javanese reckoning out, every value expandable
 * (PRD §6.2). Nothing is computed in this component — it renders a trace the
 * engine produced (CLAUDE.md invariant 16).
 *
 * One instrument, swept along three axes (DESIGN-REWORK §4): fix the date
 * (every cycle now), sweep the 35-day cycle forward (selapanan), sweep the
 * solar year (mangsa). The wheel stays in view throughout — only the detail
 * beside it changes — because it is the one thing all three sweeps share.
 */
export function ConversionView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate, stepDays, goToday, setReckoning, setDayBoundary, setHour } =
    useDateState()
  const [sweep, setSweep] = useState<Sweep>('date')
  const [highlightRing, setHighlightRing] = useState<HighlightRing | null>(null)

  // /mangsa/ and /selapanan/ retired into sweeps of this page; their redirect
  // stubs land here with ?sweep= so a bookmarked or shared link still opens
  // on the right one.
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('sweep')
    if (isSweep(fromQuery)) setSweep(fromQuery)
  }, [])

  const trace = traceFor(jdn, state.options)

  return (
    <div>
      <DateControls
        date={state.date}
        options={state.options}
        t={t}
        announce={`${trace.weton.name} · ${formatGregorian(trace.gregorian)}`}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        onReckoning={setReckoning}
        onDayBoundary={setDayBoundary}
        onHour={setHour}
      />

      {/* The answer, before the apparatus that produced it. The weton is the
          pair, so it has no derivation of its own — the dina and pasaran rows
          below carry the two that make it. */}
      <section className="mt-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b hairline pb-6">
        <div>
          <span className="rule-label">{t.labels.weton}</span>
          <p className="computed mt-1 text-figure">{trace.weton.name}</p>
        </div>
        <p className="font-mono text-sm text-ink/55">
          {formatGregorian(trace.gregorian)} · {t.labels.neptu} {trace.weton.neptu.total}
        </p>
      </section>

      <SweepTabs
        sweep={sweep}
        onChange={(next) => {
          setSweep(next)
          if (next !== 'date') setHighlightRing(null)
        }}
        t={t}
      />

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-12">
        <div className="order-2 space-y-8 md:order-1">
          {sweep === 'date' ? (
            <DateSweep trace={trace} t={t} onHighlightChange={setHighlightRing} />
          ) : sweep === 'selapanan' ? (
            <SelapananView t={t} jdn={jdn} reckoning={state.options.reckoning} trace={trace} />
          ) : (
            <MangsaSweep date={state.date} trace={trace} t={t} />
          )}
        </div>

        {/* The wheels lead on a phone: they carry the idea, and the rows are
            the detail underneath it. On a wide screen both are in view. They
            stay put across every sweep — it is the one instrument, read
            three ways, not three instruments. */}
        <section className="order-1 md:order-2 md:sticky md:top-6">
          {hydrated ? (
            <CycleWheels trace={trace} highlightRing={highlightRing} />
          ) : (
            <div className="aspect-square" />
          )}
          <p className="mt-4 max-w-measure text-sm leading-relaxed text-ink/60">
            {t.ubah.wheelsCaption}
          </p>
        </section>
      </div>

      {sweep === 'date' ? (
        <ReverseConversion t={t} reckoning={state.options.reckoning} onResult={setDate} />
      ) : null}
    </div>
  )
}

function SweepTabs({
  sweep,
  onChange,
  t,
}: {
  sweep: Sweep
  onChange: (sweep: Sweep) => void
  t: Dictionary
}) {
  const options: ReadonlyArray<{ value: Sweep; label: string }> = [
    { value: 'date', label: t.ubah.sweepDate },
    { value: 'selapanan', label: t.ubah.sweepSelapanan },
    { value: 'mangsa', label: t.ubah.sweepMangsa },
  ]

  return (
    <div className="mt-8 flex">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={sweep === option.value}
          className={['btn -ml-px first:ml-0', sweep === option.value ? 'btn-solid' : ''].join(' ')}
        >
          {option.label}
        </button>
      ))}
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

/** The mangsa panel, plus the full year table that /mangsa/ carried on its
    own page — folded in here rather than dropped, since a sweep through the
    solar year is exactly where "the twelve mangsa around this one" belongs. */
function MangsaSweep({
  date,
  trace,
  t,
}: {
  date: ReturnType<typeof traceFor>['gregorian']
  trace: ReturnType<typeof traceFor>
  t: Dictionary
}) {
  const source = mangsaSource()

  return (
    <div>
      <MangsaView t={t} date={date} trace={trace} />

      <div className="mt-8 overflow-x-auto">
        <table className="almanac-table min-w-[34rem]">
          <thead>
            <tr>
              <th>Mangsa</th>
              <th>№</th>
              <th>Tanggal</th>
              <th>Lama</th>
              <th>Pertanda</th>
            </tr>
          </thead>
          <tbody>
            {mangsaTable().map((entry) => (
              <tr key={entry.name}>
                <td className="font-prose">{entry.name}</td>
                <td className="font-mono text-ink/50">{entry.numeral}</td>
                <td className="font-mono text-indigo">{windowLabel(entry)}</td>
                <td className="font-mono">{entry.lengthDays}</td>
                <td className="text-ink/75">{entry.marker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-prose text-sm text-ink/60">
        <span className="rule-label">{t.common.source}</span> <cite className="not-italic">{source.title}</cite>
        {source.author ? ` — ${source.author}` : ''}
        {source.year ? ` (${source.year})` : ''}. {source.locator}.
      </p>
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
    <section className="panel mt-14 p-6 sm:p-7">
      <h2 className="font-prose text-section">{t.ubah.reverse}</h2>
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
