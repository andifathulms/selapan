'use client'

import { useState } from 'react'
import type { Dictionary } from '@/lib/i18n'

/**
 * There are no accounts and no server, so the URL hash is how a reckoning
 * travels between people (PRD §5). On a phone that means the share sheet —
 * the way a link actually gets into a family chat — and elsewhere, a copy.
 */
export function ShareButton({ t, title }: { t: Dictionary; title: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // A dismissed sheet is not a failure; anything else falls through to
        // copying, so the button never does nothing.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={() => void share()} className="btn" aria-live="polite">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
        <path
          d="M8 10V2.5M5 5l3-3 3 3M3.5 8.5v4.5h9V8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {copied ? t.common.copied : t.chrome.share}
    </button>
  )
}
