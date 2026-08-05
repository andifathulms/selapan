import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { PageHeader } from '@/components/chrome/PageHeader'
import { SelapananView } from './SelapananView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function SelapananPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <PageHeader title={t.selapanan.title} intro={t.selapanan.intro} />
      <div className="mt-8">
        <SelapananView t={t} />
      </div>
    </article>
  )
}
