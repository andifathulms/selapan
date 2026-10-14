import type { Metadata } from 'next'
import { RouteRedirect } from './RouteRedirect'

// Same source as app/layout.tsx and next.config.js (PRD §12).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

/**
 * A route that used to exist and now lives elsewhere. The menu was regrouped
 * by what a reader came to do — Weton, Kalender, Hitungan, Pelajari — and
 * every old path keeps working rather than breaking a bookmark or a link
 * someone shared: /ubah/ → /weton/, /mangsa/ → /kalender/ on its year view,
 * /selapanan/ → /hitungan/, /kurup/ and /sumber/ → under /pelajari/.
 *
 * Not indexed, with the canonical pointing at the new location, so search
 * results move over too.
 */
export function retiredMetadata(target: string): Metadata {
  return {
    robots: { index: false, follow: true },
    alternates: { canonical: `${basePath}${target}` },
  }
}

export function RetiredRoute({
  target,
  query,
}: {
  target: string
  query?: Readonly<Record<string, string>>
}) {
  const search = query ? `?${new URLSearchParams(query).toString()}` : ''
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${basePath}${target}${search}`} />
      <RouteRedirect to={target} query={query} />
    </>
  )
}
