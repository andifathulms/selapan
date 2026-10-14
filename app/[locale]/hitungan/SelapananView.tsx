import { formatGregorian, jdnToGregorian, type Jdn } from '@/lib/jdn'
import { traceFor, type KurupReckoning } from '@/lib/trace'
import { selapananDates, slametanDates } from '@/lib/selapanan'
import type { Dictionary } from '@/lib/i18n'
import { DateAxis } from '@/components/trace/DateAxis'
import { LogAxis } from '@/components/trace/LogAxis'

/*
 * Selapanan from a weton, and slametan reckoning from a day of death. The
 * date comes from the caller.
 *
 * Presented plainly. The slametan table serves people during bereavement, so
 * it shows the date, the rule that produced it, and nothing else — no
 * category, no quality, no advice (CLAUDE.md invariant 13).
 */

/** The next twelve selapanan from a date: points 35 days apart, evenly
    spaced because they are — the table beneath gives each date. */
export function SelapananList({ t, jdn }: { t: Dictionary; jdn: Jdn }) {
  const upcoming = selapananDates(jdn, 12)
  const upcomingMax = upcoming[upcoming.length - 1]?.daysSince ?? 0
  const upcomingPoints = upcoming.map((date) => ({
    key: String(date.ordinal),
    days: date.daysSince,
    label: String(date.daysSince),
    ok: true,
  }))

  return (
    <section>
      <h2 className="font-ui text-section font-semibold">{t.selapanan.upcoming}</h2>
      <DateAxis points={upcomingPoints} max={upcomingMax} />
      <div className="mt-5 overflow-x-auto">
        <table className="almanac-table min-w-[22rem]">
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
                <td className="font-mono text-ink/60">{date.ordinal}</td>
                <td className="whitespace-nowrap font-mono text-indigo">
                  {formatGregorian(jdnToGregorian(date.jdn))}
                </td>
                <td className="font-ui">{traceFor(date.jdn).weton.name}</td>
                <td className="font-mono text-ink/60">{date.daysSince}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Slametan from a day of death. Plain: the date, the rule that produced
    it, and nothing else (CLAUDE.md invariant 13). */
export function SlametanList({
  t,
  jdn,
  reckoning,
}: {
  t: Dictionary
  jdn: Jdn
  reckoning: KurupReckoning
}) {
  const slametan = slametanDates(jdn, reckoning)

  // A refused mendhak (pre-1633) has no jdn to place, so it is left off the
  // axis entirely rather than guessed at a position — the table beneath
  // still says it was refused, and why (CLAUDE.md invariant 4). Day numbers
  // are inclusive, as the counting rule states: the day of death is day 1.
  const points = slametan.flatMap((entry) =>
    entry.result.type === 'ok'
      ? [{ key: entry.kind, day: entry.result.value - jdn + 1, label: entry.name }]
      : [],
  )

  return (
    <section>
      <h2 className="font-ui text-section font-semibold">{t.selapanan.slametan}</h2>
      <p className="mt-1 max-w-prose text-[0.95rem] text-ink/75">{t.selapanan.countingRule}</p>
      <div className="mt-4">
        <LogAxis points={points} caption={t.selapanan.axisLog} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="almanac-table min-w-[22rem]">
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
                  <span className="mt-0.5 block font-ui text-[0.7rem] leading-tight text-ink/60">
                    {entry.rule}
                  </span>
                </td>
                <td
                  className={[
                    'whitespace-nowrap font-mono',
                    entry.result.type === 'ok' ? 'text-indigo' : 'text-unverified',
                  ].join(' ')}
                >
                  {entry.result.type === 'ok'
                    ? formatGregorian(jdnToGregorian(entry.result.value))
                    : t.common.refused}
                </td>
                <td className="font-ui text-ink/75">
                  {entry.result.type === 'ok' ? traceFor(entry.result.value).weton.name : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-prose text-sm text-ink/65">{t.selapanan.plainly}</p>
    </section>
  )
}
