import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { SelapananView } from './SelapananView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function SelapananPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <h1 className="font-prose text-3xl">{t.selapanan.title}</h1>
      <p className="mt-3 max-w-prose text-ink/80">{t.selapanan.intro}</p>
      <div className="mt-8">
        <SelapananView t={t} />
      </div>
    </article>
  )
}
