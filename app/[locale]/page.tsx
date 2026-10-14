import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { navItems } from '@/lib/nav'
import { TodayCard } from '@/components/home/TodayCard'

/**
 * The front page has to do one job before it does anything else: tell a
 * reader who has heard of weton, but never counted one, what this is.
 *
 * So the order is answer, then explanation, then apparatus. Today's
 * reckoning is on screen before any prose asks to be read; the four cycles
 * are named in a table because they are four facts, not an argument; and the
 * engineering claims that make this different from every other weton site
 * come last, where the reader who cares about them will look.
 */
export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const t = getDictionary(locale)

  return (
    <div className="space-y-16 sm:space-y-20">
      {/*
        On a narrow screen the card comes second — straight after the lede
        that promised it — rather than after two more paragraphs of prose.
        On a wide one it sits alongside, where it is visible from the start.
      */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-start lg:gap-12">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 className="font-display text-display">{t.site.tagline}</h1>
          <p className="lede mt-5 max-w-measure">{t.home.lede}</p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <TodayCard t={t} locale={locale} />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <p className="max-w-measure text-ink/70">{t.site.description}</p>
          <p className="mt-6">
            <Link href={`/${locale}/weton/`} className="btn btn-solid px-6 text-base">
              {t.home.start} →
            </Link>
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-title">{t.home.browseTitle}</h2>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-panel border hairline bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {navItems(locale, t).map((item) => (
            <li key={item.href} className="bg-paper">
              <Link
                href={item.href}
                className="group flex h-full flex-col p-5 transition-colors hover:bg-paper-raised/70"
              >
                <span className="font-ui text-section font-semibold group-hover:underline group-hover:underline-offset-4">
                  {item.label}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink/65">
                  {t.navBlurb[item.key]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </div>
  )
}
