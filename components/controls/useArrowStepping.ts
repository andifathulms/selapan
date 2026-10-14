'use client'

import { useEffect } from 'react'

/**
 * ← and → step the date a day, on the pages whose subject is one date. The
 * rings turning under the reader's own keystrokes is the point of the
 * wheel (PRD §9), so it should not need a mouse.
 *
 * Keys typed into a field, or used to move inside a select or a segmented
 * control, are left alone.
 */
export function useArrowStepping(onStep: (delta: number) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName))) return
      if (e.key === 'ArrowLeft') onStep(-1)
      else if (e.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStep])
}
