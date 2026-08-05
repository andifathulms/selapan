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

  return (
    <div className="border-b hairline py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="rule-label">{label}</span>
        <span
          className={[
            unverified ? 'unverified-value' : 'computed',
            emphasis ? 'text-2xl' : 'text-lg',
          ].join(' ')}
        >
          {value}
        </span>
      </div>

      {derivation ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-1 font-ui text-xs text-ink/50 underline underline-offset-4 hover:text-indigo"
          >
            {open ? t.common.hideWorking : t.common.showWorking}
          </button>
          {open ? <DerivationDetail derivation={derivation} t={t} /> : null}
        </>
      ) : null}
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
