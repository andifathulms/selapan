'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavKey } from '@/lib/i18n'
import { isWithin, type NavItem } from '@/lib/nav'
import { useDateHash } from '@/components/controls/useDateHash'

/**
 * The four destinations. On a wide screen, a row of pills in the header; on
 * a phone, a tab bar along the bottom edge, within reach of a thumb — four
 * destinations is the whole site, and hiding them behind a hamburger would
 * hide the whole site.
 *
 * The current section is set in ink, not indigo: indigo says exactly one
 * thing on this site, "computed" (PRD §9).
 *
 * Links to pages that read the shared date carry it in the hash, so a date
 * set on Weton is still the date when the reader opens Kalender. Not
 * prefetched: the static host serves Next's route payloads as text/plain, so
 * a click falls back to a full load — and that fallback goes to the URL the
 * prefetch was made with, carrying the date the page was rendered with
 * rather than the one the reader has since stepped to.
 */
export function SiteNav({ items, label }: { items: ReadonlyArray<NavItem>; label: string }) {
  const pathname = usePathname()
  const hash = useDateHash()

  return (
    <nav aria-label={label} className="hidden md:block">
      <ul className="flex gap-1 font-ui text-[0.92rem] font-medium">
        {items.map((item) => {
          const active = isWithin(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={`${item.href}${item.carriesDate ? hash : ''}`}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={[
                  'block whitespace-nowrap rounded-full px-3.5 py-2 transition-colors',
                  active ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/[0.07] hover:text-ink',
                ].join(' ')}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function TabBar({ items, label }: { items: ReadonlyArray<NavItem>; label: string }) {
  const pathname = usePathname()
  const hash = useDateHash()

  return (
    <nav
      aria-label={label}
      className="fixed inset-x-0 bottom-0 z-30 border-t hairline bg-paper-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5 pb-1 font-ui text-[0.7rem]">
        {items.map((item) => {
          const active = isWithin(pathname, item.href)
          return (
            <li key={item.href}>
              <Link
                href={`${item.href}${item.carriesDate ? hash : ''}`}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex min-h-[3.25rem] flex-col items-center justify-center gap-1',
                  active ? 'font-semibold text-ink' : 'text-ink/60',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'grid h-7 w-12 place-items-center rounded-full transition-colors',
                    active ? 'bg-paper-deep' : '',
                  ].join(' ')}
                >
                  <NavIcon name={item.key} />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** One small line drawing per destination, in the same stroke as the
    wheels: a dial, a grid, points on a line, an open book. */
export function NavIcon({ name }: { name: NavKey }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <svg viewBox="0 0 22 20" className="h-5 w-5">
      {name === 'weton' ? (
        <g {...common}>
          <circle cx="11" cy="10.5" r="7.5" />
          <circle cx="11" cy="10.5" r="3.5" />
          <path d="M11 1.5v5" />
        </g>
      ) : name === 'kalender' ? (
        <g {...common}>
          <rect x="3" y="3" width="16" height="15" rx="3" />
          <path d="M3 8h16M8.3 3v15M13.7 3v15" />
        </g>
      ) : name === 'hitungan' ? (
        <g {...common}>
          <path d="M2 10h18" />
          <circle cx="4" cy="10" r="1.6" />
          <circle cx="8.5" cy="10" r="1.6" />
          <circle cx="18" cy="10" r="1.6" />
        </g>
      ) : (
        <g {...common}>
          <path d="M11 5c-3-2-6-2-9-1v12c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM11 5v12" />
        </g>
      )}
    </svg>
  )
}
