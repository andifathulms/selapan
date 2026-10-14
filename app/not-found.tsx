'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { gregorianToJdn, type GregorianDate } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import { LOCALES, LOCALE_LABEL, DEFAULT_LOCALE } from '@/lib/i18n'
import { todayLocal } from '@/components/today'
import { SelapanMark } from '@/components/chrome/SelapanMark'

/**
 * The static host's 404 for the whole site (DESIGN-REWORK §7) — a locale
 * has not necessarily been reached yet, so this is written in Indonesian
 * only, the same choice the root page (`app/page.tsx`) already makes for
 * the same reason.
 *
 * A lost visitor did not come here for an apology; they came from a broken
 * or outdated link and the thing most likely still useful to them is the
 * one thing every page here can answer regardless of what they were
 * looking for: today's weton. "Today" is resolved after mount, never on the
 * server (CLAUDE.md invariant 1) — the figure is blank until then rather
 * than guessed.
 */
export default function NotFound() {
  const [today, setToday] = useState<GregorianDate | null>(null)

  useEffect(() => {
    setToday(todayLocal())
  }, [])

  const trace = today ? traceFor(gregorianToJdn(today)) : null

  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <Link href={`/${DEFAULT_LOCALE}/`} className="flex items-center gap-3 font-display text-title">
        <SelapanMark size={32} />
        Selapan
      </Link>

      <p className="mt-8 font-mono text-sm uppercase tracking-widest text-ink/50">404</p>
      <h1 className="mt-1 font-display text-title">Halaman tidak ditemukan</h1>
      <p className="lede mt-3 max-w-measure">
        Alamat ini tidak ada di Selapan. Tautannya mungkin sudah berubah, atau salah ketik.
      </p>

      <div className="panel mt-8 p-5">
        <span className="rule-label">Weton hari ini</span>
        <p className="computed mt-1 min-h-[1.75rem] font-display text-figure">{trace ? trace.weton.name : ' '}</p>
      </div>

      <ul className="mt-8 space-y-2">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link href={`/${locale}/ubah/`} className="text-indigo underline underline-offset-4">
              {LOCALE_LABEL[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
