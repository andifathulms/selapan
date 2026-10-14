'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { Dictionary, GlossTerm } from '@/lib/i18n'

/**
 * A Javanese term with its explanation one tap away. The term stays exactly
 * as it is — weton, wuku, kurup — and the note explains it rather than
 * replacing it (CLAUDE.md invariant 15). A disclosure, not a hover tooltip,
 * so it works the same under a thumb, a mouse, and a keyboard.
 */
export function Term({ term, label, t }: { term: GlossTerm; label: string; t: Dictionary }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <span ref={root} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="rule-label cursor-help border-b border-dotted border-ink/40 hover:border-ink"
      >
        {label}
      </button>
      {open ? (
        <span
          id={id}
          role="note"
          className="absolute left-0 top-[calc(100%+0.4rem)] z-20 block w-64 rounded-control bg-ink px-3.5 py-3 font-ui text-[0.82rem] normal-case leading-snug tracking-normal text-paper shadow-[0_18px_36px_-18px_rgb(0_0_0/0.5)]"
        >
          <span className="mb-0.5 block font-display text-base">{label}</span>
          {t.gloss[term]}
        </span>
      ) : null}
    </span>
  )
}
