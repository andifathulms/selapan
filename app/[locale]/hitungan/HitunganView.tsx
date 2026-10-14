'use client'

import { traceFor } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { useDateState } from '@/components/controls/useDateState'
import { DateStepper } from '@/components/controls/DateStepper'
import { SelapananView } from './SelapananView'

/**
 * Counting from a date. The date here has a meaning of its own — a day of
 * birth for selapanan, a day of death for slametan — so it gets a labelled
 * field on the page rather than living only in the header. It is the same
 * shared date, so the header pill follows it.
 */
export function HitunganView({ t }: { t: Dictionary }) {
  const { state, jdn, setDate, stepDays, goToday } = useDateState()
  const trace = traceFor(jdn, state.options)

  return (
    <div>
      <DateStepper
        id="hitungan-date"
        label={t.selapanan.from}
        date={state.date}
        t={t}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
      />
      <div className="mt-8">
        <SelapananView t={t} jdn={jdn} reckoning={state.options.reckoning} trace={trace} />
      </div>
    </div>
  )
}
