import Link from 'next/link'
import { LOCALES, LOCALE_LABEL, DEFAULT_LOCALE } from '@/lib/i18n'
import { SelapanMark } from '@/components/chrome/SelapanMark'

/**
 * The root path exists only to send a reader into a locale.
 *
 * A meta refresh rather than a redirect, because the site is a static export
 * with no server to issue one. The links below are what a reader sees if the
 * refresh is blocked, and what a crawler follows.
 */
export default function RootPage() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=./${DEFAULT_LOCALE}/`} />
      <main className="mx-auto max-w-lg px-6 py-24">
        <h1 className="flex items-center gap-3 font-prose text-title">
          <SelapanMark size={32} />
          Selapan
        </h1>
        <p className="mt-3 text-ink/70">Kalender Jawa, dengan hitungannya diperlihatkan.</p>
        <ul className="mt-8 space-y-2">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <Link href={`/${locale}/`} className="text-indigo underline underline-offset-4">
                {LOCALE_LABEL[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
