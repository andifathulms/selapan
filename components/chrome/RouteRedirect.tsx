'use client'

import { useEffect } from 'react'

// Same source as app/layout.tsx and next.config.js (PRD §12).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

/**
 * The landing point of a retired route. It hands off immediately, carrying
 * the state that made the old link worth bookmarking: the date and options
 * in the hash, plus any query the new page needs to open on the right view
 * (`view=mangsa` on /kalender/, for one).
 *
 * A hard navigation (`window.location.replace`), not the Next router. The
 * page rendering this also carries a `<meta http-equiv="refresh">` for a
 * reader without JavaScript, and that tag's timer keeps running underneath a
 * client-side transition — it does not get cancelled just because the URL
 * bar changed — so it can still fire later and clobber a soft navigation's
 * hash. A hard navigation unloads the document outright, taking the pending
 * refresh with it.
 */
export function RouteRedirect({
  to,
  query = {},
}: {
  to: string
  query?: Readonly<Record<string, string>>
}) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(query)) params.set(key, value)
    const search = params.toString()
    window.location.replace(`${basePath}${to}${search ? `?${search}` : ''}${window.location.hash}`)
  }, [to, query])

  return (
    <p className="py-16 text-center text-ink/60">
      <a href={`${basePath}${to}`} className="underline">
        {basePath}
        {to}
      </a>
    </p>
  )
}
