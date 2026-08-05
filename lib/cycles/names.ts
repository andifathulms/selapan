/**
 * The cycle vocabularies.
 *
 * Javanese terminology is preserved everywhere (CLAUDE.md invariant 15).
 * These are names, not translations; there is no English list.
 */

/** The five-day market week. Order fixed by anchor.pasaran.1633. */
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'] as const

/** The seven-day week. Order fixed by anchor.dina.1633, starting at JDN mod 7 = 0. */
export const DINA = [
  'Senen',
  'Selasa',
  'Rebo',
  'Kemis',
  'Jemuwah',
  'Setu',
  'Ahad',
] as const

/** The thirty wuku of the 210-day pawukon cycle, in order from Sinta. */
export const WUKU = [
  'Sinta',
  'Landep',
  'Wukir',
  'Kurantil',
  'Tolu',
  'Gumbreg',
  'Warigalit',
  'Warigagung',
  'Julungwangi',
  'Sungsang',
  'Galungan',
  'Kuningan',
  'Langkir',
  'Mandasiya',
  'Julungpujut',
  'Pahang',
  'Kuruwelut',
  'Marakeh',
  'Tambir',
  'Medangkungan',
  'Maktal',
  'Wuye',
  'Manahil',
  'Prangbakat',
  'Bala',
  'Wugu',
  'Wayang',
  'Kulawu',
  'Dukut',
  'Watugunung',
] as const

/** The eight years of a windu, from Alip. */
export const WINDU = [
  'Alip',
  'Ehe',
  'Jimawal',
  'Je',
  'Dal',
  'Be',
  'Wawu',
  'Jimakir',
] as const

/** The twelve lunar months, from Sura. */
export const SASI = [
  'Sura',
  'Sapar',
  'Mulud',
  'Bakda Mulud',
  'Jumadilawal',
  'Jumadilakir',
  'Rejeb',
  'Ruwah',
  'Pasa',
  'Sawal',
  'Sela',
  'Besar',
] as const

export type Pasaran = (typeof PASARAN)[number]
export type Dina = (typeof DINA)[number]
export type Wuku = (typeof WUKU)[number]
export type Windu = (typeof WINDU)[number]
export type Sasi = (typeof SASI)[number]

export const PASARAN_LENGTH = PASARAN.length // 5
export const DINA_LENGTH = DINA.length // 7
export const WETON_LENGTH = PASARAN_LENGTH * DINA_LENGTH // 35 — one selapan
export const WUKU_COUNT = WUKU.length // 30
export const PAWUKON_LENGTH = WUKU_COUNT * DINA_LENGTH // 210
export const WINDU_LENGTH = WINDU.length // 8
