'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatGregorian, gregorianToJdn, type GregorianDate } from '@/lib/jdn'
import { traceFor, DEFAULT_OPTIONS } from '@/lib/trace'
import { mangsaFor } from '@/lib/mangsa'
import { todayLocal } from '@/components/today'
import type { Dictionary, Locale } from '@/lib/i18n'

/**
 * Today's reckoning, on the first screen.
 *
 * A reader arriving here mostly wants to know what this thing tells them,
 * and the fastest honest answer is to have already told them. Everything
 * shown is a lookup into a trace the engine produced (CLAUDE.md invariant
 * 16); nothing is computed here.
 *
 * The clock lives in the UI, never in the engine (invariant 1), so today
 * arrives after mount and the server renders the frame without it. The
 * frame keeps its height so the page does not jump when the date lands.
 */
export function TodayCard({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [date, setDate] = useState<GregorianDate | null>(null)

  useEffect(() => {
    setDate(todayLocal())
  }, [])

  const trace = date ? traceFor(gregorianToJdn(date), DEFAULT_OPTIONS) : null
  const mangsa = date ? mangsaFor(date) : null

  return (
    <section className="panel p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="rule-label">{t.home.todayLabel}</h2>
        <span className="font-mono text-sm text-ink/55">
          {trace ? formatGregorian(trace.gregorian) : ' '}
        </span>
      </div>

      <p className="mt-3 min-h-[1.1em] font-mono text-figure text-indigo">
        {trace ? trace.weton.name : ' '}
      </p>

      <dl className="mt-5 grid gap-x-8 gap-y-3 border-t hairline pt-4 sm:grid-cols-3">
        <Cell label={t.labels.lunar}>
          {trace?.lunar.type === 'ok'
            ? `${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`
            : ' '}
        </Cell>
        <Cell label={t.labels.neptu}>
          {trace ? String(trace.weton.neptu.total) : ' '}
        </Cell>
        <Cell label={t.labels.mangsa}>
          {mangsa?.type === 'ok' ? mangsa.value.entry.name : ' '}
        </Cell>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href={`/${locale}/ubah/`} className="btn btn-solid">
          {t.home.openTrace} →
        </Link>
        <p className="font-ui text-xs text-ink/50">{t.home.todayHint}</p>
      </div>
    </section>
  )
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="rule-label">{label}</dt>
      <dd className="computed mt-1 min-h-[1.4em] text-lg">{children}</dd>
    </div>
  )
}
