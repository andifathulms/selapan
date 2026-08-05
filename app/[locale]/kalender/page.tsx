import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { PageHeader } from '@/components/chrome/PageHeader'
import { CalendarView } from './CalendarView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function KalenderPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <PageHeader title={t.kalender.title} intro={t.kalender.intro} />
      <div className="mt-8">
        <CalendarView t={t} />
      </div>
    </article>
  )
}
