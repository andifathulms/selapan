'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n'
import { useDateState } from '@/components/controls/useDateState'
import { DateStepper } from '@/components/controls/DateStepper'
import { SelapananList, SlametanList } from './SelapananView'

type Count = 'slametan' | 'selapanan'

/**
 * Counting from a date. The date here has a meaning of its own — a day of
 * death for slametan, a day of birth for selapanan — so it gets a labelled
 * field on the page rather than living only in the header. It is the same
 * shared date, so the header pill follows it.
 *
 * One count at a time: someone looking up slametan dates should see those
 * and nothing else. No wheel on this page, deliberately.
 */
export function HitunganView({ t }: { t: Dictionary }) {
  const { state, jdn, setDate, stepDays, goToday } = useDateState()
  const [count, setCount] = useState<Count>('slametan')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <DateStepper
          id="hitungan-date"
          label={t.selapanan.from}
          date={state.date}
          t={t}
          onDate={setDate}
          onStep={stepDays}
          onToday={goToday}
        />
        {/* Javanese terms, the same in both locales (CLAUDE.md invariant 15). */}
        <div className="seg" role="group" aria-label={t.selapanan.title}>
          <button type="button" aria-pressed={count === 'slametan'} onClick={() => setCount('slametan')}>
            Slametan
          </button>
          <button type="button" aria-pressed={count === 'selapanan'} onClick={() => setCount('selapanan')}>
            Selapanan
          </button>
        </div>
      </div>

      {count === 'slametan' ? (
        <SlametanList t={t} jdn={jdn} reckoning={state.options.reckoning} />
      ) : (
        <SelapananList t={t} jdn={jdn} />
      )}
    </div>
  )
}
