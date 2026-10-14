import type { GregorianDate } from '@/lib/jdn'
import { mangsaSource, mangsaTable, windowLabel } from '@/lib/mangsa'
import type { CalendarTrace } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'
import { MangsaView } from './MangsaView'

/** The solar year read as twelve unequal mangsa: the one this date falls in,
    then the whole year around it, with the source it is transcribed from. */
export function MangsaYear({
  t,
  date,
  trace,
}: {
  t: Dictionary
  date: GregorianDate
  trace: CalendarTrace
}) {
  const source = mangsaSource()

  return (
    <div className="mt-6">
      <p className="max-w-measure text-ink/75">{t.kalender.yearIntro}</p>

      <div className="mt-6">
        <MangsaView t={t} date={date} trace={trace} />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="almanac-table min-w-[34rem]">
          <thead>
            <tr>
              <th>Mangsa</th>
              <th>№</th>
              <th>{t.common.date}</th>
              <th>{t.common.days}</th>
              <th>{t.mangsa.marker}</th>
            </tr>
          </thead>
          <tbody>
            {mangsaTable().map((entry) => (
              <tr key={entry.name}>
                <td className="font-prose">{entry.name}</td>
                <td className="font-mono text-ink/55">{entry.numeral}</td>
                <td className="whitespace-nowrap font-mono text-indigo">{windowLabel(entry)}</td>
                <td className="font-mono">{entry.lengthDays}</td>
                <td className="text-ink/75">{entry.marker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-prose text-sm text-ink/65">
        <span className="rule-label">{t.common.source}</span>{' '}
        <cite className="not-italic">{source.title}</cite>
        {source.author ? ` — ${source.author}` : ''}
        {source.year ? ` (${source.year})` : ''}. {source.locator}.
      </p>
    </div>
  )
}
