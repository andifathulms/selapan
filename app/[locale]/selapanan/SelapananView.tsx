'use client'

import { formatGregorian, jdnToGregorian } from '@/lib/jdn'
import { traceFor } from '@/lib/trace'
import { selapananDates, slametanDates } from '@/lib/selapanan'
import type { Dictionary } from '@/lib/i18n'
import { DateControls } from '@/components/controls/DateControls'
import { useDateState } from '@/components/controls/useDateState'

/**
 * Selapanan from a weton, and slametan reckoning from a day of death.
 *
 * Presented plainly. The slametan table serves people during bereavement, so
 * it shows the date, the rule that produced it, and nothing else — no
 * category, no quality, no advice (CLAUDE.md invariant 13).
 */
export function SelapananView({ t }: { t: Dictionary }) {
  const { state, jdn, setDate, stepDays, goToday } = useDateState()
  const trace = traceFor(jdn, state.options)
  const upcoming = selapananDates(jdn, 12)
  const slametan = slametanDates(jdn, state.options.reckoning)

  return (
    <div>
      <DateControls
        date={state.date}
        options={state.options}
        t={t}
        onDate={setDate}
        onStep={stepDays}
        onToday={goToday}
        showOptions={false}
      />

      <p className="mt-6 flex flex-wrap items-baseline gap-3">
        <span className="rule-label">{t.selapanan.from}</span>
        <span className="computed text-2xl">{trace.weton.name}</span>
        <span className="font-mono text-sm text-ink/55">{formatGregorian(trace.gregorian)}</span>
      </p>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="font-prose text-xl">{t.selapanan.upcoming}</h2>
          <table className="almanac-table mt-3">
            <thead>
              <tr>
                <th>№</th>
                <th>{t.labels.gregorian}</th>
                <th>{t.labels.weton}</th>
                <th>{t.common.days}</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((date) => (
                <tr key={date.ordinal}>
                  <td className="font-mono text-ink/50">{date.ordinal}</td>
                  <td className="font-mono text-indigo">
                    {formatGregorian(jdnToGregorian(date.jdn))}
                  </td>
                  <td className="font-ui">{traceFor(date.jdn).weton.name}</td>
                  <td className="font-mono text-ink/55">{date.daysSince}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-prose text-xl">{t.selapanan.slametan}</h2>
          <p className="mt-1 text-sm text-ink/70">{t.selapanan.slametanIntro}</p>
          <table className="almanac-table mt-3">
            <thead>
              <tr>
                <th>Slametan</th>
                <th>{t.labels.gregorian}</th>
                <th>{t.labels.weton}</th>
              </tr>
            </thead>
            <tbody>
              {slametan.map((entry) => (
                <tr key={entry.kind}>
                  <td>
                    <span className="font-prose">{entry.name}</span>
                    <span className="mt-0.5 block font-ui text-[0.68rem] leading-tight text-ink/50">
                      {entry.rule}
                    </span>
                  </td>
                  <td className={entry.result.type === 'ok' ? 'font-mono text-indigo' : 'font-mono text-unverified'}>
                    {entry.result.type === 'ok'
                      ? formatGregorian(jdnToGregorian(entry.result.value))
                      : t.common.refused}
                  </td>
                  <td className="font-ui text-ink/70">
                    {entry.result.type === 'ok' ? traceFor(entry.result.value).weton.name : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 max-w-prose text-sm text-ink/70">{t.selapanan.countingRule}</p>
          <p className="mt-2 max-w-prose text-sm text-ink/55">{t.selapanan.plainly}</p>
        </section>
      </div>
    </div>
  )
}
