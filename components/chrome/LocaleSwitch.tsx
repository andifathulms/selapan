'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALE_LABEL, type Locale } from '@/lib/i18n'
import { useDateHash } from '@/components/controls/useDateHash'

/** Switch language without losing your place: the same page, the same date. */
export function LocaleSwitch({ current, other }: { current: Locale; other: Locale }) {
  const pathname = usePathname()
  const hash = useDateHash()
  const target = pathname.replace(new RegExp(`^/${current}(?=/|$)`), `/${other}`)

  return (
    <Link
      href={`${target.endsWith('/') ? target : `${target}/`}${hash}`}
      hrefLang={other}
      prefetch={false}
      title={LOCALE_LABEL[other]}
      className="grid min-h-[2.75rem] min-w-[2.75rem] place-items-center rounded-full font-ui text-xs font-semibold uppercase tracking-widest text-ink/60 transition-colors hover:bg-ink/[0.07] hover:text-ink"
    >
      {other}
    </Link>
  )
}
