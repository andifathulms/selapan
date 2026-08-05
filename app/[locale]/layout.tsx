import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LOCALES, LOCALE_LABEL, getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { navItems } from '@/lib/nav'
import { SiteNav } from '@/components/chrome/SiteNav'
import { PaletteLegend } from '@/components/chrome/PaletteLegend'

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

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-indigo focus:px-4 focus:py-2 focus:font-ui focus:text-sm focus:text-paper"
      >
        {t.common.skipToContent}
      </a>

      <header className="border-b hairline bg-paper/85 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-4 pt-5">
            <Link href={`/${locale}/`} className="group">
              <span className="block font-prose text-xl font-semibold leading-none tracking-tight group-hover:text-indigo">
                Selapan
              </span>
              <span className="mt-1 hidden font-ui text-[0.7rem] uppercase tracking-[0.16em] text-ink/45 sm:block">
                {t.site.wordmarkNote}
              </span>
            </Link>
            <Link
              href={`/${other}/`}
              className="ml-auto font-ui text-xs uppercase tracking-widest text-ink/50 hover:text-indigo"
              hrefLang={other}
            >
              {LOCALE_LABEL[other]}
            </Link>
          </div>

          <div className="mt-3">
            <SiteNav items={navItems(locale, t)} />
          </div>
        </div>
      </header>

      <main id="isi" className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:py-14">
        {children}
      </main>

      <footer className="mt-16 border-t hairline bg-paper-deep/25">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="rule-label">{t.site.legend}</h2>
          <PaletteLegend t={t} className="mt-3" />

          <p className="mt-8 max-w-measure border-t hairline pt-6 text-sm leading-relaxed text-ink/65">
            {t.site.disclaimer}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-ui text-sm">
            <Link href={`/${locale}/sumber/`} className="text-indigo underline underline-offset-4">
              {t.nav.sumber}
            </Link>
            <a
              href="https://github.com/andifathulms/selapan"
              className="text-ink/60 underline underline-offset-4 hover:text-indigo"
            >
              {t.site.sourceCode}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
