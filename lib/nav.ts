import type { Dictionary } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export type NavItem = {
  readonly key: keyof Dictionary['nav']
  readonly href: string
  readonly label: string
}

/**
 * One list of destinations, used by the header and by the home page cards,
 * so the two can never drift apart. Order is the order a reader meets them:
 * a single date first, then the month around it, then the harder material.
 */
export function navItems(locale: Locale, t: Dictionary): ReadonlyArray<NavItem> {
  return [
    { key: 'ubah', href: `/${locale}/ubah/`, label: t.nav.ubah },
    { key: 'kalender', href: `/${locale}/kalender/`, label: t.nav.kalender },
    { key: 'selapanan', href: `/${locale}/selapanan/`, label: t.nav.selapanan },
    { key: 'mangsa', href: `/${locale}/mangsa/`, label: t.nav.mangsa },
    { key: 'kurup', href: `/${locale}/kurup/`, label: t.nav.kurup },
    { key: 'sumber', href: `/${locale}/sumber/`, label: t.nav.sumber },
  ]
}
