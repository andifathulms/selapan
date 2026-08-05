import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { CalendarView } from './CalendarView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function KalenderPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <h1 className="font-prose text-3xl">{t.kalender.title}</h1>
      <p className="mt-3 max-w-prose text-ink/80">{t.kalender.intro}</p>
      <div className="mt-8">
        <CalendarView t={t} />
      </div>
    </article>
  )
}
