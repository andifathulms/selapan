'use client'

import { formatGregorian } from '@/lib/jdn'
import { traceFor, type CalendarTrace, type TraceOptions } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'
import { DerivationDetail } from '@/components/trace/Derivation'

/**
 * Aboge and Asapon side by side (PRD §6.3).
 *
 * The point is not to pick one. Where the two diverge the page says so
 * prominently and explains the mechanism, so that a reader in an Aboge
 * community sees their own reckoning represented rather than contradicted
 * (CLAUDE.md invariant 6).
 */
export function DivergenceView({ t }: { t: Dictionary }) {
  const { state, jdn, setDate, stepDays, goToday } = useDateState()

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
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        showOptions={false}
      />

      <p
        className={[
          'mt-6 border-l-2 pl-4 font-ui text-sm',
          diverges ? 'border-ochre text-ink' : 'hairline border-l text-ink/60',
        ].join(' ')}
      >
        {diverges ? t.kurup.divergenceHere : t.kurup.agreeHere}
        <span className="ml-2 font-mono text-ink/60">
          {formatGregorian(asapon.gregorian)} · {asapon.weton.name}
        </span>
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <ReckoningPanel title="Asapon" subtitle="Alip Selasa Pon" trace={asapon} t={t} />
        <ReckoningPanel title="Aboge" subtitle="Alip Rebo Wage" trace={aboge} t={t} />
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
}: {
  title: string
  subtitle: string
  trace: CalendarTrace
  t: Dictionary
}) {
  return (
    <section className="border hairline p-5">
      <header className="flex items-baseline justify-between gap-3 border-b hairline pb-3">
        <h2 className="font-prose text-section">{title}</h2>
        <span className="font-ui text-xs uppercase tracking-widest text-ink/50">{subtitle}</span>
      </header>

      {trace.lunar.type === 'ok' ? (
        <>
          <p
            className={[
              'mt-4 text-2xl',
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
