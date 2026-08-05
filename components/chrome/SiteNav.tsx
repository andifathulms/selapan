'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/lib/nav'

/**
 * The section rules across the top of an almanac's contents page.
 *
 * The current section is marked with a solid rule beneath it rather than a
 * fill, because a filled tab in indigo would read as a computed value, and
 * indigo says exactly one thing on this site (PRD §9).
 *
 * On a narrow screen the row scrolls sideways instead of wrapping to three
 * ragged lines — six destinations is the whole site, and hiding them behind
 * a hamburger would hide the whole site.
 */
export function SiteNav({ items }: { items: ReadonlyArray<NavItem> }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Utama"
      className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max gap-x-1 font-ui text-sm sm:w-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname === item.href.replace(/\/$/, '')
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'block whitespace-nowrap border-b-2 px-2 py-2.5 transition-colors',
                  active
                    ? 'border-indigo text-indigo'
                    : 'border-transparent text-ink/70 hover:border-ink/25 hover:text-ink',
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
