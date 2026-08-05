import { todayLocal } from '@/components/today'

/**
 * A maker's mark: who built this, set quietly at the foot of the page.
 *
 * It is personal credit and not a legal notice, so it sits opposite the
 * project's attribution rather than merged into it, and adds no rule of its
 * own — the footer already has its one seam.
 *
 * Everything identifying lives in the two constants below, so updating a
 * handle or adding a platform is a one-line change.
 */
const MAKER = {
  name: 'Andi Fathul Mukminin',
  portfolio: 'https://andifathulms.github.io/en/',
} as const

const PROFILES = [
  { label: 'Portfolio', href: MAKER.portfolio, icon: GlobeIcon },
  { label: 'GitHub', href: 'https://github.com/andifathulms', icon: GitHubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andifathulmukminin/', icon: LinkedInIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/andifathulms/', icon: InstagramIcon },
] as const

export function MakerSignature() {
  // The site is a static export with no clock in the engine, so the year is
  // resolved here at build time — the same boundary every other date crosses
  // (CLAUDE.md invariant 1). It advances on the next deploy.
  const year = todayLocal().year

  return (
    <div className="flex flex-col gap-2 font-ui text-sm text-ink/55 sm:items-end">
      <p>
        Designed &amp; built by{' '}
        <a
          href={MAKER.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink/75 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-indigo hover:decoration-indigo"
        >
          {MAKER.name}
        </a>{' '}
        · <span className="font-mono tabular-nums">© {year}</span>
      </p>

      <ul className="-mx-1.5 flex sm:-mr-1.5">
        {PROFILES.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="flex p-1.5 text-ink/45 transition-colors hover:bg-paper-raised/70 hover:text-indigo"
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Drawn at 18px on a 24px grid, stroked for the globe and filled for the
 * three wordmarks, which is how each is supplied. `currentColor` throughout,
 * so the links carry their own hover.
 */
function iconProps(fill: 'none' | 'currentColor') {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill,
    'aria-hidden': true,
    focusable: false,
  } as const
}

function GlobeIcon() {
  return (
    <svg {...iconProps('none')} stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M2.75 12h18.5" />
      <path d="M12 2.75c2.4 2.5 3.6 5.6 3.6 9.25S14.4 18.75 12 21.25c-2.4-2.5-3.6-5.6-3.6-9.25S9.6 5.25 12 2.75Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg {...iconProps('currentColor')}>
      <path d="M12 1.75a10.25 10.25 0 0 0-3.24 19.98c.51.09.7-.22.7-.49v-1.9c-2.86.62-3.46-1.22-3.46-1.22-.47-1.19-1.14-1.5-1.14-1.5-.93-.64.07-.62.07-.62 1.03.07 1.57 1.06 1.57 1.06.92 1.57 2.41 1.12 3 .86.09-.67.36-1.12.65-1.38-2.28-.26-4.68-1.14-4.68-5.08 0-1.12.4-2.04 1.06-2.76-.11-.26-.46-1.31.1-2.72 0 0 .86-.28 2.82 1.05a9.76 9.76 0 0 1 5.14 0c1.96-1.33 2.82-1.05 2.82-1.05.56 1.41.21 2.46.1 2.72.66.72 1.06 1.64 1.06 2.76 0 3.95-2.4 4.82-4.69 5.07.37.32.7.94.7 1.9v2.82c0 .27.19.59.71.49A10.25 10.25 0 0 0 12 1.75Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg {...iconProps('currentColor')}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76v5.69h-4V15.6c0-1.37-.03-3.14-1.99-3.14-1.99 0-2.3 1.5-2.3 3.04v5h-4v-11Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg {...iconProps('none')} stroke="currentColor" strokeWidth={1.7}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
