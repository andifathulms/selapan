'use client'

import { formatGregorian } from '@/lib/jdn'
import { traceFor, type CalendarTrace, type TraceOptions } from '@/lib/trace'
import { KURUPS } from '@/lib/data'
import type { Dictionary } from '@/lib/i18n'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'
import { DerivationDetail } from '@/components/trace/Derivation'
import { CycleWheels } from '@/components/wheels/CycleWheels'

/**
 * Aboge and Asapon side by side (PRD §6.3).
 *
 * The point is not to pick one. Where the two diverge the page says so
 * prominently and explains the mechanism, so that a reader in an Aboge
 * community sees their own reckoning represented rather than contradicted
 * (CLAUDE.md invariant 6).
 */
export function DivergenceView({ t }: { t: Dictionary }) {
  const { state, hydrated, jdn, setDate, stepDays, goToday } = useDateState()

  const asapon = traceFor(jdn, { ...state.options, reckoning: 'chronological' })
  const aboge = traceFor(jdn, { ...state.options, reckoning: 'aboge' })

  const label = (trace: CalendarTrace) =>
    trace.lunar.type === 'ok'
      ? `${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`
      : null

  const asaponLabel = label(asapon)
  const abogeLabel = label(aboge)
  const diverges = asaponLabel !== null && abogeLabel !== null && asaponLabel !== abogeLabel

  return (
    <div>
      <DateControls
        date={state.date}
        options={state.options}
        t={t}
        announce={`${asapon.weton.name} · ${formatGregorian(asapon.gregorian)}`}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        showOptions={false}
      />

      {/* Whether the two reckonings part on this date is the one thing this
          page exists to say — but it is shown, not coloured: the two wheels
          below share every ring except the lunar one, and where the two
          diverge that ring's month-start mark visibly parts between them
          (DESIGN-REWORK §3.3). This line states it in words for a reader
          using a screen reader, or skimming past the wheels. */}
      <p className="mt-6 text-ink/70">
        {diverges ? t.kurup.divergenceHere : t.kurup.agreeHere}
        <span className="ml-3 font-mono text-sm text-ink/55">
          {formatGregorian(asapon.gregorian)} · {asapon.weton.name}
        </span>
      </p>

      <KurupTimeline currentYearAj={asapon.lunar.type === 'ok' ? asapon.lunar.value.yearAj : null} t={t} />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ReckoningPanel title="Asapon" subtitle="Alip Selasa Pon" trace={asapon} t={t} hydrated={hydrated} />
        <ReckoningPanel title="Aboge" subtitle="Alip Rebo Wage" trace={aboge} t={t} hydrated={hydrated} />
      </div>

      <section className="mt-10 border-t hairline pt-6">
        <p className="max-w-prose text-ink/80">{t.kurup.mechanism}</p>
        <p className="mt-4 max-w-prose text-ink/80">{t.kurup.bothValid}</p>
      </section>
    </div>
  )
}

function ReckoningPanel({
  title,
  subtitle,
  trace,
  t,
  hydrated,
}: {
  title: string
  subtitle: string
  trace: CalendarTrace
  t: Dictionary
  hydrated: boolean
}) {
  return (
    <section className="panel p-5">
      <header className="flex items-baseline justify-between gap-3 border-b hairline pb-3">
        <h2 className="font-prose text-section">{title}</h2>
        <span className="font-ui text-xs uppercase tracking-widest text-ink/50">{subtitle}</span>
      </header>

      {/* Pasaran, dina, wuku and mangsa are identical between the two
          panels — reckoning only changes the lunar ring. The dot just
          outside that ring marks where its month starts; comparing the
          two wheels' dots against the same fixed ray is the divergence,
          not a caption about it. */}
      <div className="mt-4">
        {hydrated ? <CycleWheels trace={trace} /> : <div className="mx-auto aspect-square w-full max-w-[420px]" />}
      </div>

      {trace.lunar.type === 'ok' ? (
        <>
          <p
            className={[
              'mt-4 text-figure',
              trace.lunar.value.derivation.status === 'unverified'
                ? 'unverified-value'
                : 'computed',
            ].join(' ')}
          >
            {trace.lunar.value.day} {trace.lunar.value.monthName} {trace.lunar.value.yearAj}
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="rule-label pt-[0.2em]">{t.labels.windu}</dt>
            <dd className="font-mono">{trace.lunar.value.windu}</dd>
            <dt className="rule-label pt-[0.2em]">{t.labels.kurup}</dt>
            <dd className="font-mono">{trace.lunar.value.kurupName}</dd>
          </dl>
          <DerivationDetail derivation={trace.lunar.value.derivation} t={t} />
        </>
      ) : (
        <>
          <p className="mt-4 text-2xl unverified-value">{t.common.refused}</p>
          <p className="mt-2 text-sm text-ink/70">{trace.lunar.refusal.reason}</p>
        </>
      )}
    </section>
  )
}

/**
 * Every kurup, in proportion, across four centuries — /sumber/ already lists
 * them as a table; this is the same data read as a span of time instead
 * (DESIGN-REWORK §5). The split mark sits at Asapon's start because that is
 * the mechanism, transcribed rather than summarised: Asapon applied the
 * 1867 AJ correction there, Aboge never did, so every date on or after it is
 * where the two structurally part (CLAUDE.md invariant 5 — never hardcode
 * the current kurup — so the split is found in KURUPS by name, not assumed).
 */
function KurupTimeline({ currentYearAj, t }: { currentYearAj: number | null; t: Dictionary }) {
  const spanStart = KURUPS[0]!.startYearAj
  const spanEnd = KURUPS[KURUPS.length - 1]!.endYearAj
  const span = spanEnd - spanStart + 1
  const splitYearAj = KURUPS.find((k) => k.name === 'Asapon')?.startYearAj

  const pct = (year: number) => ((year - spanStart) / span) * 100

  return (
    <div className="mt-8">
      <div className="relative h-14 w-full">
        {KURUPS.map((kurup) => (
          <div
            key={kurup.id}
            className="absolute top-0 h-9 overflow-hidden border-l hairline pl-1.5 pt-1"
            style={{ left: `${pct(kurup.startYearAj)}%`, width: `${(kurup.lengthYears / span) * 100}%` }}
          >
            <span className="block truncate font-ui text-[0.62rem] uppercase tracking-wide text-ink/55">
              {kurup.name}
            </span>
          </div>
        ))}
        <div className="absolute inset-x-0 top-9 h-px bg-ink/25" />

        {splitYearAj !== undefined ? (
          <div
            className="absolute top-0 h-9 w-px bg-indigo/50"
            style={{ left: `${pct(splitYearAj)}%` }}
          />
        ) : null}

        {currentYearAj !== null ? (
          <div
            className="absolute top-9 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${pct(currentYearAj)}%` }}
          >
            <span className="h-2 w-2 -translate-y-1/2 rounded-full bg-indigo ring-2 ring-paper" />
          </div>
        ) : null}
      </div>

      <dl className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[0.68rem] text-ink/55">
        {currentYearAj !== null ? (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo" aria-hidden="true" />
            <dt className="sr-only">{t.kurup.timelineToday}</dt>
            <dd>{t.kurup.timelineToday}</dd>
          </div>
        ) : null}
        {splitYearAj !== undefined ? (
          <div className="flex max-w-prose items-center gap-1.5">
            <span className="h-2 w-px shrink-0 bg-indigo/50" aria-hidden="true" />
            <dt className="sr-only">{t.kurup.timelineSplit}</dt>
            <dd>{t.kurup.timelineSplit}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
