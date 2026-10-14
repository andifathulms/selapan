import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, isLocale, LOCALES, type Dictionary, type Locale } from '@/lib/i18n'
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
import { PageHeader } from '@/components/chrome/PageHeader'
import { PaletteLegend } from '@/components/chrome/PaletteLegend'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * The material underneath: what a weton is, the four cycles, how this site
 * differs from the others, and what the two inks mean — then the kurup and
 * the sources, one level down. It used to fill the home page below the
 * answer; here it is the page, for the reader who came to understand.
 */
export default function PelajariPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale = params.locale as Locale
  const t = getDictionary(locale)

  const deeper = [
    { href: `/${locale}/pelajari/kurup/`, title: t.kurup.title, blurb: t.pelajari.kurupBlurb },
    { href: `/${locale}/pelajari/sumber/`, title: t.sumber.title, blurb: t.pelajari.sumberBlurb },
  ]

  return (
    <article className="space-y-16 sm:space-y-20">
      <PageHeader title={t.pelajari.title} intro={t.pelajari.intro} />

      <section>
        <h2 className="font-display text-title">{t.home.whatTitle}</h2>
        <div className="mt-4 max-w-measure space-y-4 text-ink/85">
          {t.home.whatBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <CyclesTable t={t} />

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-title">{t.home.whatItDoesTitle}</h2>
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
          <h2 className="font-ui text-section font-semibold">{t.home.separationTitle}</h2>
          <p className="mt-3 text-ink/80">{t.home.separation}</p>
          <PaletteLegend t={t} className="mt-6 border-t hairline pt-5 sm:grid-cols-1" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-title">{t.pelajari.deeper}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {deeper.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="panel group flex h-full flex-col p-6 transition-colors hover:border-ink/40"
              >
                <span className="font-ui text-section font-semibold">
                  {item.title} <span aria-hidden="true" className="text-ink/50 transition-transform group-hover:translate-x-0.5">→</span>
                </span>
                <span className="mt-2 text-ink/70">{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
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
      <h2 className="font-display text-title">{t.home.cyclesTitle}</h2>
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
