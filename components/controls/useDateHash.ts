'use client'

import { useEffect, useState } from 'react'
import { DATE_HASH_EVENT, dateHashFrom } from './useDateState'

/** The current URL hash when it carries a date, kept live — for links that
    should take the reader's date with them to the next page. */
export function useDateHash(): string {
  const [hash, setHash] = useState('')

  useEffect(() => {
    const read = () => setHash(dateHashFrom(window.location.hash))
    read()
    window.addEventListener(DATE_HASH_EVENT, read)
    window.addEventListener('hashchange', read)
    return () => {
      window.removeEventListener(DATE_HASH_EVENT, read)
      window.removeEventListener('hashchange', read)
    }
  }, [])

  return hash
}
