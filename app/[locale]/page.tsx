import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, isLocale, type Locale } from '@/lib/i18n'
import { navItems } from '@/lib/nav'
import { TodayHero } from '@/components/home/TodayHero'
import { BirthdayForm } from '@/components/home/BirthdayForm'
import { NavIcon } from '@/components/chrome/SiteNav'

/**
 * The front page has one job before any other: answer. Today's weton and
 * the instrument are on screen before any prose asks to be read, with the
 * question most visitors arrive with — what was the weton of this birth
 * date? — answered right beneath it. The explanation lives on Pelajari, for
 * the reader who came to understand; the other destinations are one row of
 * tiles at the foot.
 */
export default function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const t = getDictionary(locale)
  const others = navItems(locale, t).filter((item) => item.key !== 'weton')

  return (
    <div className="space-y-16 sm:space-y-20">
      <TodayHero
        t={t}
        intro={
          <div>
            <h1 className="font-display text-title">{t.site.tagline}</h1>
            <p className="lede mt-3 max-w-measure">{t.home.lede}</p>
          </div>
        }
        form={<BirthdayForm t={t} locale={locale} />}
      />

      <section aria-labelledby="home-more">
        <h2 id="home-more" className="rule-label">
          {t.home.moreTitle}
        </h2>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-panel border hairline bg-ink/15 md:grid-cols-3">
          {others.map((item) => (
            <li key={item.href} className="bg-paper-raised">
              <Link
                href={item.href}
                prefetch={false}
                className="group flex h-full gap-4 p-5 transition-colors hover:bg-paper sm:p-6"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper-deep text-ink">
                  <NavIcon name={item.key} />
                </span>
                <span className="min-w-0">
                  <span className="block font-ui text-section font-semibold">
                    {item.label}{' '}
                    <span aria-hidden="true" className="inline-block text-ink/45 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                  <span className="mt-1 block text-[0.95rem] leading-snug text-ink/70">
                    {t.navBlurb[item.key]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
