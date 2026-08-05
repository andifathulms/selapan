'use client'

import { useState } from 'react'
import type { AnyDerivation } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { DerivationDetail } from './Derivation'

/**
 * A computed value, with its working one tap away (PRD §11).
 *
 * The value renders indigo when it rests on a verified anchor and grey when
 * it does not. That is not styling — it is the reader's only signal that a
 * figure is taken on one source's authority, and it comes straight from the
 * anchor's recorded status.
 */
export function TraceValue({
  label,
  value,
  derivation,
  t,
  emphasis = false,
}: {
  label: string
  value: string
  derivation?: AnyDerivation
  t: Dictionary
  emphasis?: boolean
}) {
  const [open, setOpen] = useState(false)
  const unverified = derivation?.status === 'unverified'

  const body = (
    <>
      <span className="rule-label">{label}</span>
      <span
        className={[
          unverified ? 'unverified-value' : 'computed',
          emphasis ? 'text-2xl' : 'text-lg',
        ].join(' ')}
      >
        {value}
      </span>
    </>
  )

  if (!derivation) {
    return (
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b hairline py-3.5">
        {body}
      </div>
    )
  }

  // The whole row opens the working, not a small link beneath it. Every row
  // that has a derivation should be worth pressing, and on a phone a 12px
  // underlined phrase is not a target.
  return (
    <div className="border-b hairline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5 text-left"
      >
        {body}
        <span className="flex w-full items-center gap-1.5 font-ui text-xs text-ink/45 transition-colors group-hover:text-indigo">
          <span
            aria-hidden
            className={[
              'inline-block transition-transform',
              open ? 'rotate-90' : '',
            ].join(' ')}
          >
            ›
          </span>
          {open ? t.common.hideWorking : t.common.showWorking}
        </span>
      </button>
      {open ? <div className="pb-4">{<DerivationDetail derivation={derivation} t={t} />}</div> : null}
    </div>
  )
}

/** A subsystem that declined to answer, and the range that does apply. */
export function RefusalNotice({
  reason,
  validFrom,
  validTo,
  label,
  t,
}: {
  reason: string
  validFrom: string
  validTo: string | null
  label: string
  t: Dictionary
}) {
  return (
    <div className="border-b hairline py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6">
        <span className="rule-label">{label}</span>
        <span className="unverified-value text-lg">{t.common.refused}</span>
      </div>
      <p className="mt-2 max-w-prose text-sm text-ink/70">{reason}</p>
      <p className="mt-1 font-mono text-xs text-unverified">
        {validFrom} … {validTo ?? '—'}
      </p>
    </div>
  )
}
