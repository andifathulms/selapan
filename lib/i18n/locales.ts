/**
 * Indonesian first, English secondary (PRD, header table).
 *
 * Javanese terminology is never translated in either locale — weton stays
 * weton, pasaran stays pasaran (CLAUDE.md invariant 15). The English locale
 * translates the surrounding prose, not the vocabulary.
 */
export const LOCALES = ['id', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'id'

export function isLocale(value: string): value is Locale {
  return (LOCALES as ReadonlyArray<string>).includes(value)
}

export const LOCALE_LABEL: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
}
