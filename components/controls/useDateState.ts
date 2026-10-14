'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  formatGregorian,
  gregorianToJdn,
  jdnToGregorian,
  parseGregorian,
  type GregorianDate,
} from '@/lib/jdn'
import type { DayBoundary, KurupReckoning, TraceOptions } from '@/lib/trace'
import { DEFAULT_OPTIONS } from '@/lib/trace'
import { todayLocal } from '@/components/today'

/**
 * Shared page state, carried in the URL hash.
 *
 * There are no accounts and no server, so the hash is how a reckoning is
 * shared (PRD §5). It is also why the hash is written rather than the query
 * string: a static host never sees it, and a shared link reproduces exactly
 * what the sender saw, options included.
 */
export type DateState = {
  readonly date: GregorianDate
  readonly options: TraceOptions
}

const KEYS = { date: 't', reckoning: 'r', boundary: 'b', hour: 'h' } as const

/**
 * More than one component reads the hash at once — the date pill in the
 * header and the page beneath it. `history.replaceState` fires no
 * `hashchange`, so every write is announced with this event and every
 * instance listens for it, which keeps them on one date without a context
 * provider reaching across the server-rendered layout.
 */
export const DATE_HASH_EVENT = 'selapan:date-hash'

/** The current hash, if it carries a date — for links that should take the
    reader's date with them. Empty otherwise. */
export function dateHashFrom(hash: string): string {
  return new URLSearchParams(hash.replace(/^#/, '')).has(KEYS.date) ? hash : ''
}

function parseHash(hash: string): Partial<DateState> {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const date = params.get(KEYS.date)
  const reckoning = params.get(KEYS.reckoning)
  const boundary = params.get(KEYS.boundary)
  const hour = params.get(KEYS.hour)

  const parsedDate = date ? parseGregorian(date) : null
  const options: TraceOptions = {
    reckoning: reckoning === 'aboge' ? 'aboge' : DEFAULT_OPTIONS.reckoning,
    dayBoundary: boundary === 'sunset' ? 'sunset' : DEFAULT_OPTIONS.dayBoundary,
    ...(hour !== null && Number.isInteger(Number(hour))
      ? { hour: Math.min(23, Math.max(0, Number(hour))) }
      : {}),
  }
  return { ...(parsedDate ? { date: parsedDate } : {}), options }
}

function toHash(state: DateState): string {
  const params = new URLSearchParams()
  params.set(KEYS.date, formatGregorian(state.date))
  if (state.options.reckoning !== DEFAULT_OPTIONS.reckoning) {
    params.set(KEYS.reckoning, state.options.reckoning)
  }
  if (state.options.dayBoundary !== DEFAULT_OPTIONS.dayBoundary) {
    params.set(KEYS.boundary, state.options.dayBoundary)
    if (state.options.hour !== undefined) params.set(KEYS.hour, String(state.options.hour))
  }
  return `#${params.toString()}`
}

export function useDateState(
  initial?: GregorianDate,
  {
    passive = false,
  }: {
    /** Read the hash and follow it, but do not write one until the reader
        changes something. The header pill is passive, so a page with no
        date of its own (home, Pelajari) keeps a clean URL. */
    passive?: boolean
  } = {},
) {
  // Server-rendered markup must not depend on the clock, so the first render
  // uses a fixed date and the reader's own "today" arrives after mount.
  const [state, setState] = useState<DateState>({
    date: initial ?? { year: 2026, month: 1, day: 1 },
    options: DEFAULT_OPTIONS,
  })
  const [hydrated, setHydrated] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const fromHash = parseHash(window.location.hash)
    setState({
      date: fromHash.date ?? initial ?? todayLocal(),
      options: fromHash.options ?? DEFAULT_OPTIONS,
    })
    setHydrated(true)
    // `initial` is a literal from the caller and never changes identity in a
    // way that should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow writes from any other instance on the page, and the reader's own
  // back/forward through hashes.
  useEffect(() => {
    const follow = () => {
      const fromHash = parseHash(window.location.hash)
      if (!fromHash.date) return
      const next: DateState = { date: fromHash.date, options: fromHash.options ?? DEFAULT_OPTIONS }
      setState((current) => (toHash(current) === toHash(next) ? current : next))
    }
    window.addEventListener(DATE_HASH_EVENT, follow)
    window.addEventListener('hashchange', follow)
    return () => {
      window.removeEventListener(DATE_HASH_EVENT, follow)
      window.removeEventListener('hashchange', follow)
    }
  }, [])

  useEffect(() => {
    if (!hydrated || (passive && !touched)) return
    const hash = toHash(state)
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
      window.dispatchEvent(new Event(DATE_HASH_EVENT))
    }
  }, [state, hydrated, passive, touched])

  const update = useCallback((change: (s: DateState) => DateState) => {
    setTouched(true)
    setState(change)
  }, [])

  const setDate = useCallback((date: GregorianDate) => update((s) => ({ ...s, date })), [update])

  const stepDays = useCallback(
    (delta: number) =>
      update((s) => ({ ...s, date: jdnToGregorian(gregorianToJdn(s.date) + delta) })),
    [update],
  )

  const goToday = useCallback(() => update((s) => ({ ...s, date: todayLocal() })), [update])

  const setReckoning = useCallback(
    (reckoning: KurupReckoning) => update((s) => ({ ...s, options: { ...s.options, reckoning } })),
    [update],
  )

  const setDayBoundary = useCallback(
    (dayBoundary: DayBoundary) =>
      update((s) => ({ ...s, options: { ...s.options, dayBoundary } })),
    [update],
  )

  const setHour = useCallback(
    (hour: number) => update((s) => ({ ...s, options: { ...s.options, hour } })),
    [update],
  )

  return {
    state,
    hydrated,
    jdn: gregorianToJdn(state.date),
    setDate,
    stepDays,
    goToday,
    setReckoning,
    setDayBoundary,
    setHour,
  }
}
