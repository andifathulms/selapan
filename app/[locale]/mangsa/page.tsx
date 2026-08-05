import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { mangsaSource, mangsaTable, windowLabel } from '@/lib/mangsa'
import { MangsaView } from './MangsaView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function MangsaPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)
  const source = mangsaSource()

  return (
    <article>
      <h1 className="font-prose text-3xl">{t.mangsa.title}</h1>
      <p className="mt-3 max-w-prose text-ink/80">{t.mangsa.intro}</p>

      <div className="mt-8">
        <MangsaView t={t} />
      </div>

      <section className="mt-12 border-t hairline pt-8">
        <div className="overflow-x-auto">
          <table className="almanac-table min-w-[40rem]">
            <thead>
              <tr>
                <th>Mangsa</th>
                <th>№</th>
                <th>Tanggal</th>
                <th>Lama</th>
                <th>Pertanda</th>
              </tr>
            </thead>
            <tbody>
              {mangsaTable().map((entry) => (
                <tr key={entry.name}>
                  <td className="font-prose">{entry.name}</td>
                  <td className="font-mono text-ink/50">{entry.numeral}</td>
                  <td className="font-mono text-indigo">{windowLabel(entry)}</td>
                  <td className="font-mono">{entry.lengthDays}</td>
                  <td className="text-ink/75">{entry.marker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-prose text-sm text-ink/60">
          <span className="rule-label">{t.common.source}</span>{' '}
          <cite className="not-italic">{source.title}</cite>
          {source.author ? ` — ${source.author}` : ''}
          {source.year ? ` (${source.year})` : ''}. {source.locator}.
        </p>
      </section>
    </article>
  )
}
