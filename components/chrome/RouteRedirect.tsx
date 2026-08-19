'use client'

import { useEffect } from 'react'

// Same source as app/layout.tsx and next.config.js (PRD §12).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

/**
 * The landing point of a retired route (DESIGN-REWORK §4: /mangsa/ and
 * /selapanan/ folded into /ubah/ as sweeps). It hands off immediately,
 * carrying the state that made the old link worth bookmarking: the date and
 * options in the hash, and a `sweep` query param naming which tab to land
 * on.
 *
 * A hard navigation (`window.location.replace`), not the Next router. The
 * page rendering this also carries a `<meta http-equiv="refresh">` for a
 * reader without JavaScript, and that tag's timer keeps running underneath a
 * client-side transition — it does not get cancelled just because the URL
 * bar changed — so it can still fire later and clobber a soft navigation's
 * hash. A hard navigation unloads the document outright, taking the pending
 * refresh with it.
 */
export function RouteRedirect({ to, sweep }: { to: string; sweep: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('sweep', sweep)
    window.location.replace(`${basePath}${to}?${params.toString()}${window.location.hash}`)
  }, [to, sweep])

  return (
    <p className="py-16 text-center text-ink/60">
      <a href={`${basePath}${to}`} className="underline">
        {basePath}
        {to}
      </a>
    </p>
  )
}
