import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { PageHeader } from '@/components/chrome/PageHeader'
import { ConversionView } from './ConversionView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function UbahPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <PageHeader title={t.ubah.title} intro={t.ubah.intro} />
      <div className="mt-8">
        <ConversionView t={t} />
      </div>
    </article>
  )
}
