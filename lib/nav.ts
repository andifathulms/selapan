import type { Dictionary, NavKey } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export type NavItem = {
  readonly key: NavKey
  readonly href: string
  readonly label: string
  /** Whether the page reads the shared date from the URL hash. Links to
      these carry the hash, so the date a reader set follows them from page
      to page; links to the others do not need it. */
  readonly carriesDate: boolean
}

/**
 * One list of destinations, used by the header, the phone tab bar and the
 * home tiles, so none of them can drift. Grouped by what a reader came to
 * do, in the order they usually need it: a weton first, then the month
 * around it, then a count from a date, then the material underneath.
 *
 * The old paths — /ubah/, /mangsa/, /selapanan/, /kurup/, /sumber/ — still
 * exist as redirect stubs (components/chrome/RetiredRoute).
 */
export function navItems(locale: Locale, t: Dictionary): ReadonlyArray<NavItem> {
  return [
    { key: 'weton', href: `/${locale}/weton/`, label: t.nav.weton, carriesDate: true },
    { key: 'kalender', href: `/${locale}/kalender/`, label: t.nav.kalender, carriesDate: true },
    { key: 'hitungan', href: `/${locale}/hitungan/`, label: t.nav.hitungan, carriesDate: true },
    { key: 'pelajari', href: `/${locale}/pelajari/`, label: t.nav.pelajari, carriesDate: false },
  ]
}

/** Whether `pathname` is inside `href` — /pelajari/kurup/ is in Pelajari. */
export function isWithin(pathname: string, href: string): boolean {
  const base = href.replace(/\/$/, '')
  return pathname === base || pathname.startsWith(`${base}/`)
}
