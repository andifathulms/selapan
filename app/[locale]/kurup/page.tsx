import { notFound } from 'next/navigation'
import { isLocale, LOCALES } from '@/lib/i18n'
import { RetiredRoute, retiredMetadata } from '@/components/chrome/RetiredRoute'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export function generateMetadata({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return {}
  return retiredMetadata(`/${params.locale}/pelajari/kurup/`)
}

/** The kurup page, now under /pelajari/. Kept as a redirect so old links still land (RetiredRoute). */
export default function KurupRedirect({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  return <RetiredRoute target={`/${params.locale}/pelajari/kurup/`} />
}
