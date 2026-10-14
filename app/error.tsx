'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { DEFAULT_LOCALE } from '@/lib/i18n'
import { SelapanMark } from '@/components/chrome/SelapanMark'

/**
 * The client-side error boundary the app-wide layout was missing
 * (DESIGN-REWORK §7). A render throw in a client component — the wheel, a
 * date control, anything under `'use client'` — used to take the whole page
 * down with it; this catches that instead of leaving a blank screen.
 *
 * Written in Indonesian only, for the same reason as `not-found.tsx`: an
 * error can surface before a locale's dictionary has loaded.
 *
 * `error.message` is not shown. It is a build/runtime detail, not something
 * a reader needs, and this project does not put anything on screen it
 * cannot stand behind (CLAUDE.md invariant 4: never a plausible wrong
 * answer — the same discipline applies to never showing an answer at all
 * when what actually happened is unclear).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <Link href={`/${DEFAULT_LOCALE}/`} className="flex items-center gap-3 font-display text-title">
        <SelapanMark size={32} />
        Selapan
      </Link>

      <p className="mt-8 font-mono text-sm uppercase tracking-widest text-unverified">Galat</p>
      <h1 className="mt-1 font-display text-title">Terjadi kesalahan</h1>
      <p className="lede mt-3 max-w-measure">
        Halaman ini gagal ditampilkan. Bukan tafsir yang keliru dan dilewatkan diam-diam — sesuatu
        benar-benar patah, dan dicatat sebagai patah.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-solid">
          Coba lagi
        </button>
        <Link href={`/${DEFAULT_LOCALE}/`} className="btn">
          Kembali ke beranda
        </Link>
      </div>
    </main>
  )
}
