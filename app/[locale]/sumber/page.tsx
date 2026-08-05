import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale, type Dictionary } from '@/lib/i18n'
import { PageHeader } from '@/components/chrome/PageHeader'
import { ANCHORS, KURUPS, MANGSA, NEPTU, type Source } from '@/lib/data'
import { DAL_IRREGULARITY_NOTE } from '@/lib/lunar'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * Every source, and every gap.
 *
 * Publishing the unfinished list is part of the point (CLAUDE.md working
 * style: when sources disagree, publish the disagreement; when a rule is
 * unknown, say so). A site that shows only what it is confident about is
 * indistinguishable from one that has never checked.
 */
export default function SumberPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  const anchors = Object.values(ANCHORS)
  const gaps = [
    ...anchors
      .filter((a) => a.status === 'unverified')
      .map((a) => ({ id: a.id, note: a.notes ?? '' })),
    ...KURUPS.filter((k) => k.status === 'unverified').map((k) => ({
      id: k.id,
      note: k.notes ?? '',
    })),
    { id: 'lunar.dal.panjang-bulan', note: DAL_IRREGULARITY_NOTE },
    {
      id: 'primbon.lapisan-tafsir',
      note:
        'Lapisan tafsir primbon belum dirilis. Ia menunggu peninjau yang paham praktik pananggalan Jawa, dan mesin kalender ini adalah produk yang utuh tanpanya. Skema data dan pemeriksa build untuk lapisan itu sudah ada dan sudah berlaku: setiap entri wajib bersumber, wajib beratribusi "Menurut …", dan ditolak jika memakai sapaan orang kedua atau mengandung peringkat.',
    },
  ]

  return (
    <article>
      <PageHeader title={t.sumber.title} intro={t.sumber.intro} />

      <section className="mt-10">
        <h2 className="font-prose text-section">{t.sumber.anchors}</h2>
        <div className="mt-4 space-y-6">
          {anchors.map((anchor) => (
            <Entry
              key={anchor.id}
              id={anchor.id}
              title={anchor.correspondence}
              source={anchor.source}
              status={anchor.status}
              crossCheck={anchor.crossCheck}
              notes={anchor.notes}
              t={t}
            />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t hairline pt-8">
        <h2 className="font-prose text-section">{t.sumber.kurups}</h2>
        <div className="mt-4 space-y-6">
          {KURUPS.map((kurup) => (
            <Entry
              key={kurup.id}
              id={kurup.id}
              title={`${kurup.name} — ${kurup.mnemonicGloss}, ${kurup.startYearAj}–${kurup.endYearAj} AJ, mulai ${kurup.startGregorian}`}
              source={kurup.source}
              status={kurup.status}
              crossCheck={kurup.crossCheck}
              notes={kurup.notes}
              t={t}
            />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t hairline pt-8">
        <h2 className="font-prose text-section">{t.sumber.tables}</h2>
        <div className="mt-4 space-y-6">
          <Entry
            id={NEPTU.id}
            title="Nilai neptu dina dan pasaran"
            source={NEPTU.source}
            status={NEPTU.status}
            crossCheck={NEPTU.crossCheck}
            notes={NEPTU.notes}
            t={t}
          />
          <Entry
            id={MANGSA.id}
            title="Tanggal dan pertanda dua belas mangsa"
            source={MANGSA.source}
            status={MANGSA.status}
            crossCheck={MANGSA.crossCheck}
            notes={MANGSA.notes}
            t={t}
          />
        </div>
      </section>

      <section className="mt-12 border-t hairline pt-8">
        <h2 className="font-prose text-section">{t.sumber.gaps}</h2>
        <p className="mt-2 max-w-prose text-ink/80">{t.sumber.gapsIntro}</p>
        <div className="mt-5 space-y-5">
          {gaps.map((gap) => (
            <div key={gap.id} className="max-w-prose border-l-2 border-unverified/50 pl-4">
              <p className="font-mono text-sm text-unverified">{gap.id}</p>
              <p className="mt-1 text-sm text-ink/70">{gap.note}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}

function Entry({
  id,
  title,
  source,
  status,
  crossCheck,
  notes,
  t,
}: {
  id: string
  title: string
  source: Source
  status: 'verified' | 'unverified'
  crossCheck?: string
  notes?: string
  t: Dictionary
}) {
  return (
    <div className="max-w-prose border-l-2 border-ochre/40 pl-4">
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-sm text-indigo">{id}</span>
        {status === 'unverified' ? (
          <span className="rule-label text-unverified">{t.site.unverified}</span>
        ) : null}
      </p>
      <p className="mt-1 text-ink/85">{title}</p>
      <p className="mt-2 text-sm text-ink/70">
        <span className="rule-label">{t.common.source}</span>{' '}
        <cite className="not-italic">{source.title}</cite>
        {source.author ? ` — ${source.author}` : ''}
        {source.year ? ` (${source.year})` : ''}
        {source.publisher ? `, ${source.publisher}` : ''}. {source.locator}.
      </p>
      {crossCheck ? (
        <p className="mt-2 text-sm text-ink/65">
          <span className="rule-label">{t.common.crossCheck}</span> {crossCheck}
        </p>
      ) : null}
      {notes ? (
        <p className={['mt-2 text-sm', status === 'unverified' ? 'text-unverified' : 'text-ink/60'].join(' ')}>
          {notes}
        </p>
      ) : null}
    </div>
  )
}
