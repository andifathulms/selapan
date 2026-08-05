import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, isLocale, type Dictionary, type Locale } from '@/lib/i18n'
import {
  DINA,
  PASARAN,
  PASARAN_LENGTH,
  DINA_LENGTH,
  PAWUKON_LENGTH,
  SASI,
  WUKU,
  WUKU_COUNT,
} from '@/lib/cycles'
import { navItems } from '@/lib/nav'
import { TodayCard } from '@/components/home/TodayCard'
import { PaletteLegend } from '@/components/chrome/PaletteLegend'

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
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12">
        <div>
          <h1 className="font-prose text-display">{t.site.tagline}</h1>
          <p className="lede mt-5 max-w-measure">{t.home.lede}</p>
          <p className="mt-4 max-w-measure text-ink/70">{t.site.description}</p>
          <p className="mt-7">
            <Link href={`/${locale}/ubah/`} className="btn btn-solid px-6 text-base">
              {t.home.start} →
            </Link>
          </p>
        </div>

        <TodayCard t={t} locale={locale} />
      </section>

      <section>
        <h2 className="font-prose text-title">{t.home.whatTitle}</h2>
        <div className="mt-4 max-w-measure space-y-4 text-ink/85">
          {t.home.whatBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <CyclesTable t={t} />

      <section>
        <h2 className="font-prose text-title">{t.home.browseTitle}</h2>
        <ul className="mt-6 grid gap-px border hairline bg-[color-mix(in_srgb,theme(colors.ink)_18%,transparent)] sm:grid-cols-2 lg:grid-cols-3">
          {navItems(locale, t).map((item) => (
            <li key={item.href} className="bg-paper">
              <Link
                href={item.href}
                className="group flex h-full flex-col p-5 transition-colors hover:bg-paper-raised/70"
              >
                <span className="font-prose text-section group-hover:text-indigo">
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

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-prose text-title">{t.home.whatItDoesTitle}</h2>
          <ul className="mt-5 space-y-3.5">
            {t.home.whatItDoes.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-ochre" />
                <span className="text-ink/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-inset p-6">
          <h2 className="font-prose text-section">{t.home.separationTitle}</h2>
          <p className="mt-3 text-ink/80">{t.home.separation}</p>
          <PaletteLegend t={t} className="mt-6 border-t hairline pt-5 sm:grid-cols-1" />
        </div>
      </section>
    </div>
  )
}

/**
 * The four cycles as four rows. Lengths and element lists are read from the
 * engine's own constants rather than retyped here, so the page cannot come
 * to disagree with the arithmetic it is describing.
 */
function CyclesTable({ t }: { t: Dictionary }) {
  const rows = [
    {
      name: t.labels.pasaran,
      length: String(PASARAN_LENGTH),
      elements: PASARAN.join(', '),
    },
    {
      name: t.labels.dina,
      length: String(DINA_LENGTH),
      elements: DINA.join(', '),
    },
    {
      name: t.labels.wuku,
      length: String(PAWUKON_LENGTH),
      elements: `${WUKU_COUNT} wuku — ${WUKU[0]}, ${WUKU[1]}, ${WUKU[2]} … ${WUKU[WUKU_COUNT - 1]}`,
    },
    {
      // 354 or 355 days by the windu pattern, which is exactly why the kurup
      // correction exists (PRD §1).
      name: t.labels.lunar,
      length: '354 / 355',
      elements: `${SASI.length} — ${SASI[0]}, ${SASI[1]} … ${SASI[SASI.length - 1]}`,
    },
  ]

  return (
    <section>
      <h2 className="font-prose text-title">{t.home.cyclesTitle}</h2>
      <p className="mt-3 max-w-measure text-ink/75">{t.home.cyclesIntro}</p>
      <div className="mt-5 overflow-x-auto">
        <table className="almanac-table min-w-[34rem]">
          <thead>
            <tr>
              <th scope="col">{t.home.cycleHead.cycle}</th>
              <th scope="col">{t.home.cycleHead.length}</th>
              <th scope="col">{t.home.cycleHead.elements}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="whitespace-nowrap pr-6 font-prose">{row.name}</td>
                <td className="whitespace-nowrap pr-6 font-mono tabular-nums text-indigo">
                  {row.length}
                </td>
                <td className="font-ui text-ink/70">{row.elements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
