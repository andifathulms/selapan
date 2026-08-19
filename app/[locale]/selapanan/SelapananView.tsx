import { formatGregorian, jdnToGregorian, type Jdn } from '@/lib/jdn'
import { traceFor, type CalendarTrace, type KurupReckoning } from '@/lib/trace'
import { selapananDates, slametanDates } from '@/lib/selapanan'
import type { Dictionary } from '@/lib/i18n'
import { DateAxis } from '@/components/trace/DateAxis'

/**
 * Selapanan from a weton, and slametan reckoning from a day of death — a
 * sweep of /ubah/'s instrument along the 35-day cycle, not a page of its own
 * (DESIGN-REWORK §4). The date and its trace come from the caller.
 *
 * Presented plainly. The slametan table serves people during bereavement, so
 * it shows the date, the rule that produced it, and nothing else — no
 * category, no quality, no advice (CLAUDE.md invariant 13).
 */
export function SelapananView({
  t,
  jdn,
  reckoning,
  trace,
}: {
  t: Dictionary
  jdn: Jdn
  reckoning: KurupReckoning
  trace: CalendarTrace
}) {
  const upcoming = selapananDates(jdn, 12)
  const slametan = slametanDates(jdn, reckoning)

  const upcomingMax = upcoming[upcoming.length - 1]?.daysSince ?? 0
  const upcomingPoints = upcoming.map((date) => ({
    key: String(date.ordinal),
    days: date.daysSince,
    label: String(date.daysSince),
    ok: true,
  }))

  // A refused mendhak (pre-1633) has no jdn to place, so it is left off the
  // axis entirely rather than guessed at a position — the table beneath
  // still says it was refused, and why (CLAUDE.md invariant 4).
  const slametanPoints = slametan
    .filter((entry) => entry.result.type === 'ok')
    .map((entry) => {
      const days = entry.result.type === 'ok' ? entry.result.value - jdn : 0
      return { key: entry.kind, days, label: String(days), ok: true }
    })
  const slametanMax = Math.max(1, ...slametanPoints.map((p) => p.days))

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-3">
        <span className="rule-label">{t.selapanan.from}</span>
        <span className="computed text-2xl">{trace.weton.name}</span>
        <span className="font-mono text-sm text-ink/55">{formatGregorian(trace.gregorian)}</span>
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-prose text-section">{t.selapanan.upcoming}</h2>
          <DateAxis points={upcomingPoints} max={upcomingMax} />
          <table className="almanac-table mt-5">
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
                  <td className="whitespace-nowrap font-mono text-indigo">
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
          <h2 className="font-prose text-section">{t.selapanan.slametan}</h2>
          <p className="mt-1 text-sm text-ink/70">{t.selapanan.slametanIntro}</p>
          <DateAxis points={slametanPoints} max={slametanMax} />
          <table className="almanac-table mt-5">
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
