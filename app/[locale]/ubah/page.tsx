import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { ConversionView } from './ConversionView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function UbahPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <h1 className="font-prose text-3xl">{t.ubah.title}</h1>
      <p className="mt-3 max-w-prose text-ink/80">{t.ubah.intro}</p>
      <div className="mt-8">
        <ConversionView t={t} />
      </div>
    </article>
  )
}
