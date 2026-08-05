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

export function useDateState(initial?: GregorianDate) {
  // Server-rendered markup must not depend on the clock, so the first render
  // uses a fixed date and the reader's own "today" arrives after mount.
  const [state, setState] = useState<DateState>({
    date: initial ?? { year: 2026, month: 1, day: 1 },
    options: DEFAULT_OPTIONS,
  })
  const [hydrated, setHydrated] = useState(false)

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

  useEffect(() => {
    if (!hydrated) return
    const hash = toHash(state)
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
  }, [state, hydrated])

  const setDate = useCallback((date: GregorianDate) => {
    setState((s) => ({ ...s, date }))
  }, [])

  const stepDays = useCallback((delta: number) => {
    setState((s) => ({ ...s, date: jdnToGregorian(gregorianToJdn(s.date) + delta) }))
  }, [])

  const goToday = useCallback(() => {
    setState((s) => ({ ...s, date: todayLocal() }))
  }, [])

  const setReckoning = useCallback((reckoning: KurupReckoning) => {
    setState((s) => ({ ...s, options: { ...s.options, reckoning } }))
  }, [])

  const setDayBoundary = useCallback((dayBoundary: DayBoundary) => {
    setState((s) => ({ ...s, options: { ...s.options, dayBoundary } }))
  }, [])

  const setHour = useCallback((hour: number) => {
    setState((s) => ({ ...s, options: { ...s.options, hour } }))
  }, [])

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
