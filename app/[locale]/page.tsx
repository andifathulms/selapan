import Link from 'next/link'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const t = getDictionary(locale)

  return (
    <article className="max-w-2xl">
      <h1 className="font-prose text-4xl leading-tight">{t.site.tagline}</h1>
      <p className="mt-5 text-lg text-ink/80">{t.home.lede}</p>
      <p className="mt-4 text-ink/80">{t.site.description}</p>

      <ul className="mt-8 space-y-3 border-t hairline pt-6">
        {t.home.whatItDoes.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="mt-[0.55em] h-px w-4 shrink-0 bg-ochre" />
            <span className="text-ink/85">{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-8 border-t hairline pt-6 text-ink/80">{t.home.separation}</p>

      <p className="mt-8">
        <Link
          href={`/${locale}/ubah/`}
          className="inline-block border border-indigo px-5 py-2 font-ui text-sm text-indigo transition-colors hover:bg-indigo hover:text-paper"
        >
          {t.home.start} →
        </Link>
      </p>
    </article>
  )
}
