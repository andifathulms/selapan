'use client'

import type { AnyDerivation } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The derivation, written out.
 *
 * Every expandable value in the app renders through here. The point is that
 * a reader can redo the arithmetic by hand from what is on the screen and
 * check it against the cited source — which is the whole difference between
 * this and an uncited weton site (PRD §3).
 */
export function DerivationDetail({
  derivation,
  t,
}: {
  derivation: AnyDerivation
  t: Dictionary
}) {
  const unverified = derivation.status === 'unverified'

  return (
    <div className="mt-3 border-l-2 border-ochre/50 pl-4 text-sm">
      {derivation.kind === 'modulo' ? (
        <>
          <p className="font-mono text-[0.95em] text-indigo">
            ({derivation.jdn.toLocaleString('en-US').replace(/,/g, ' ')} −{' '}
            {derivation.anchorJdn.toLocaleString('en-US').replace(/,/g, ' ')}) mod{' '}
            {derivation.modulus} = {derivation.index}
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <Row label={t.common.anchor}>
              <span className="font-mono">{derivation.anchorId}</span>
              <span className="text-ink/60"> · {derivation.anchorGregorian}</span>
            </Row>
            <Row label={t.common.offset}>
              <span className="font-mono">{derivation.offset.toLocaleString('en-US')}</span>{' '}
              <span className="text-ink/60">{t.common.days}</span>
            </Row>
            <Row label={t.common.modulus}>
              <span className="font-mono">{derivation.modulus}</span>
            </Row>
            <Row label={t.common.result}>
              <span className="font-mono">{derivation.index}</span>
            </Row>
          </dl>
        </>
      ) : (
        <>
          <p className="font-mono text-[0.95em] text-indigo">
            {derivation.anchorGregorian} + {derivation.elapsedDays.toLocaleString('en-US')}{' '}
            {t.common.days}
          </p>
          <ol className="mt-3 space-y-1">
            {derivation.steps.map((step, i) => (
              <li key={`${step.label}-${i}`} className="flex justify-between gap-4">
                <span className="text-ink/75">{step.label}</span>
                <span className="font-mono text-indigo">
                  {step.days.toLocaleString('en-US')}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="mt-3 border-t hairline pt-2 text-ink/65">
        <p>
          <span className="rule-label">{t.common.source}</span>{' '}
          <cite className="not-italic">{derivation.source.title}</cite>
          {derivation.source.author ? <span> — {derivation.source.author}</span> : null}
          {derivation.source.year ? <span> ({derivation.source.year})</span> : null}
        </p>
        <p className="mt-1 text-ink/55">{derivation.source.locator}</p>
        {unverified && derivation.note ? (
          <p className="mt-2 text-unverified">
            <span className="rule-label text-unverified">{t.site.unverified}</span>{' '}
            {derivation.note}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="rule-label pt-[0.2em]">{label}</dt>
      <dd>{children}</dd>
    </>
  )
}
