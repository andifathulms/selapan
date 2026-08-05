import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LOCALES, LOCALE_LABEL, getDictionary, isLocale, type Locale } from '@/lib/i18n'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const t = getDictionary(locale)
  const other = LOCALES.find((l) => l !== locale)!

  const nav = [
    { href: `/${locale}/ubah/`, label: t.nav.ubah },
    { href: `/${locale}/kalender/`, label: t.nav.kalender },
    { href: `/${locale}/kurup/`, label: t.nav.kurup },
    { href: `/${locale}/mangsa/`, label: t.nav.mangsa },
    { href: `/${locale}/selapanan/`, label: t.nav.selapanan },
    { href: `/${locale}/sumber/`, label: t.nav.sumber },
  ]

  return (
    <div className="min-h-screen">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-x-6 gap-y-2 px-6 py-5">
          <Link href={`/${locale}/`} className="font-prose text-xl font-semibold tracking-tight">
            Selapan
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 font-ui text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink/70 underline-offset-4 transition-colors hover:text-indigo hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href={`/${other}/`}
            className="ml-auto font-ui text-xs uppercase tracking-widest text-ink/50 hover:text-indigo"
          >
            {LOCALE_LABEL[other]}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

      <footer className="mt-16 border-t hairline">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-ink/60">
          <p className="max-w-2xl">{t.site.disclaimer}</p>
          <p className="mt-3">
            <Link href={`/${locale}/sumber/`} className="text-indigo underline underline-offset-4">
              {t.nav.sumber}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
