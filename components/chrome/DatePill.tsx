'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { formatGregorian } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import type { Dictionary, Locale } from '@/lib/i18n'
import { isWithin } from '@/lib/nav'
import { useDateState } from '@/components/controls/useDateState'
import { DateStepper } from '@/components/controls/DateStepper'

/**
 * The date every page is reckoning, in the header, on every page.
 *
 * Weton, Kalender, Hitungan and the kurup page all read the same date from
 * the URL hash. Before, each carried its own date toolbar; now the date is
 * set once, here, and follows the reader from page to page. Tapping it opens
 * the stepper.
 *
 * Passive: it follows the hash but writes none until the reader changes the
 * date, so the home page and Pelajari keep clean URLs.
 *
 * It is also the one live region for the date: stepping a day replaces the
 * whole reckoning below, and a screen-reader user hears the resulting weton
 * rather than nothing.
 */
export function DatePill({ t, locale }: { t: Dictionary; locale: Locale }) {
  const { state, hydrated, jdn, setDate, stepDays, goToday } = useDateState(undefined, {
    passive: true,
  })
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const sheetId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const trace = traceFor(jdn, state.options)
  const onWeton = isWithin(pathname, `/${locale}/weton/`)

  return (
    <div ref={rootRef} className="relative">
      <div role="status" aria-live="polite" className="sr-only">
        {hydrated ? `${trace.weton.name} · ${formatGregorian(trace.gregorian)}` : ''}
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={`${t.chrome.changeDate}: ${hydrated ? `${trace.weton.name}, ${formatGregorian(trace.gregorian)}` : ''}`}
        className="flex min-h-[2.75rem] items-center gap-2.5 rounded-full border border-ink/25 bg-paper-raised py-1.5 pl-4 pr-1.5 font-ui text-sm transition-colors hover:border-ink/50"
      >
        <span className="min-w-[5.5rem] font-semibold text-indigo">
          {hydrated ? trace.weton.name : ' '}
        </span>
        <span className="hidden font-mono text-xs text-ink/60 sm:inline">
          {hydrated ? formatGregorian(trace.gregorian) : ' '}
        </span>
        <span
          aria-hidden="true"
          className={[
            'grid h-8 w-8 place-items-center rounded-full bg-paper-deep text-ink/70 transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M2.5 4.5L6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={sheetId}
          className="panel absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(22rem,calc(100vw-2rem))] p-4 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.45)]"
        >
          <DateStepper
            id="date-pill-input"
            label={t.chrome.datePill}
            date={state.date}
            t={t}
            onDate={setDate}
            onStep={stepDays}
            onToday={goToday}
          />
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t hairline pt-3">
            <span className="font-display text-2xl text-indigo">{trace.weton.name}</span>
            <span className="font-mono text-xs text-ink/60">neptu {trace.weton.neptu.total}</span>
          </div>
          {!onWeton ? (
            <Link
              href={`/${locale}/weton/#t=${formatGregorian(state.date)}`}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="btn btn-solid mt-3 w-full"
            >
              {t.chrome.openWeton} →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
