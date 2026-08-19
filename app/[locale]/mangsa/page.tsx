import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, LOCALES, type Locale } from '@/lib/i18n'
import { RouteRedirect } from '@/components/chrome/RouteRedirect'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

// Same source as app/layout.tsx and next.config.js (PRD §12).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {}
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `${basePath}/${params.locale}/ubah/` },
  }
}

/**
 * Mangsa is a sweep of /ubah/, not a page of its own (DESIGN-REWORK §4).
 * This route stays only to carry anyone who bookmarked or linked it to the
 * new location, on the mangsa sweep, with the date they had preserved.
 */
export default function MangsaPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const target = `/${locale}/ubah/`

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${basePath}${target}?sweep=mangsa`} />
      <RouteRedirect to={target} sweep="mangsa" />
    </>
  )
}
