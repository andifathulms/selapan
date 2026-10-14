import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { PageHeader } from '@/components/chrome/PageHeader'
import { HitunganView } from './HitunganView'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * Selapanan and slametan, on a page of their own. Slametan dates are looked
 * up at a hard time, so this page is plain: dates and the rule that counted
 * them, nothing else (CLAUDE.md invariant 13).
 */
export default function HitunganPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const t = getDictionary(params.locale as Locale)

  return (
    <article>
      <PageHeader title={t.selapanan.title} intro={t.selapanan.intro} />
      <div className="mt-8">
        <HitunganView t={t} />
      </div>
    </article>
  )
}
