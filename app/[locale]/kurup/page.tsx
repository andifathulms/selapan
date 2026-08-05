import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { KURUPS } from '@/lib/data'
import { DivergenceView } from './DivergenceView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function KurupPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <h1 className="font-prose text-3xl">{t.kurup.title}</h1>
      <p className="mt-3 max-w-prose text-ink/80">{t.kurup.intro}</p>

      <div className="mt-8">
        <DivergenceView t={t} />
      </div>

      <section className="mt-14 border-t hairline pt-8">
        <h2 className="font-prose text-2xl">{t.kurup.table}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="almanac-table min-w-[42rem]">
            <thead>
              <tr>
                <th>Kurup</th>
                <th>Alip</th>
                <th>Tahun Jawa</th>
                <th>Mulai</th>
                <th>Lama</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {KURUPS.map((kurup) => (
                <tr key={kurup.id}>
                  <td className="font-prose">{kurup.name}</td>
                  <td className="font-ui text-ink/70">{kurup.mnemonicGloss}</td>
                  <td className="font-mono">
                    {kurup.startYearAj}–{kurup.endYearAj}
                  </td>
                  <td className="font-mono text-indigo">{kurup.startGregorian}</td>
                  <td className="font-mono">{kurup.lengthYears} th</td>
                  <td
                    className={
                      kurup.status === 'unverified'
                        ? 'font-ui text-xs text-unverified'
                        : 'font-ui text-xs text-ink/60'
                    }
                  >
                    {kurup.status === 'unverified' ? t.site.unverified : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-6">
          {KURUPS.map((kurup) => (
            <div key={kurup.id} className="max-w-prose border-l-2 border-ochre/40 pl-4">
              <h3 className="font-prose text-lg">
                {kurup.name}{' '}
                <span className="font-mono text-sm text-ink/50">{kurup.id}</span>
              </h3>
              {kurup.crossCheck ? (
                <p className="mt-1 text-sm text-ink/75">
                  <span className="rule-label">{t.common.crossCheck}</span> {kurup.crossCheck}
                </p>
              ) : null}
              {kurup.notes ? (
                <p
                  className={[
                    'mt-2 text-sm',
                    kurup.status === 'unverified' ? 'text-unverified' : 'text-ink/65',
                  ].join(' ')}
                >
                  {kurup.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
