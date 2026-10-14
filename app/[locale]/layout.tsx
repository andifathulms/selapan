import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LOCALES, getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { navItems } from '@/lib/nav'
import { SiteNav, TabBar } from '@/components/chrome/SiteNav'
import { DatePill } from '@/components/chrome/DatePill'
import { LocaleSwitch } from '@/components/chrome/LocaleSwitch'
import { PaletteLegend } from '@/components/chrome/PaletteLegend'
import { MakerSignature } from '@/components/chrome/MakerSignature'
import { SelapanMark } from '@/components/chrome/SelapanMark'

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
  const other = LOCALES.find((l) => l !== locale) ?? locale
  const items = navItems(locale, t)

  return (
    // The phone tab bar is fixed to the bottom edge; the page reserves its
    // height so the footer is never hidden underneath it.
    <div className="flex min-h-screen flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:font-ui focus:text-sm focus:text-paper"
      >
        {t.common.skipToContent}
      </a>

      <header className="sticky top-0 z-30 border-b hairline bg-paper/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-6">
          <Link href={`/${locale}/`} className="group flex shrink-0 items-center gap-2.5">
            <SelapanMark size={34} />
            <span>
              <span className="block font-display text-xl leading-none">Selapan</span>
              <span className="mt-1 hidden font-ui text-[0.68rem] uppercase tracking-[0.14em] text-ink/55 lg:block">
                {t.site.wordmarkNote}
              </span>
            </span>
          </Link>

          <SiteNav items={items} label={t.chrome.menu} />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <DatePill t={t} locale={locale} />
            <LocaleSwitch current={locale} other={other} />
          </div>
        </div>
      </header>

      <main id="isi" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="mt-16 border-t hairline bg-paper-deep/25">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="rule-label">{t.site.legend}</h2>
          <PaletteLegend t={t} className="mt-3" />

          <p className="mt-8 max-w-measure border-t hairline pt-6 text-sm leading-relaxed text-ink/65">
            {t.site.disclaimer}
          </p>

          {/* The project's own attribution and the maker's mark share this
              bar but stay apart: the first is what the site owes its sources,
              the second is a personal credit, and merging them would read as
              one claim. No rule between them — the footer has its one seam
              above the disclaimer. */}
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-ui text-sm">
              <Link href={`/${locale}/pelajari/sumber/`} className="underline underline-offset-4 hover:text-ink">
                {t.sumber.title}
              </Link>
              <a
                href="https://github.com/andifathulms/selapan"
                className="text-ink/70 underline underline-offset-4 hover:text-ink"
              >
                {t.site.sourceCode}
              </a>
            </div>

            <MakerSignature />
          </div>
        </div>
      </footer>

      <TabBar items={items} label={t.chrome.menu} />
    </div>
  )
}
