import { mod, type Jdn } from '@/lib/jdn'
import { ANCHORS, NEPTU, type Anchor } from '@/lib/data'
import type { CycleValue, Derivation, NeptuSum, Weton } from '@/lib/trace/types'
import {
  DINA,
  DINA_LENGTH,
  PASARAN,
  PASARAN_LENGTH,
  PAWUKON_LENGTH,
  WUKU,
} from './names'

/**
 * The continuous cycles: pasaran, dina, wuku, and the weton and neptu built
 * from them.
 *
 * All three are unbounded in both directions (PRD §3). They have no start
 * date and no end date — an anchor fixes the phase, not the validity. A
 * request for the pasaran of a date in 1200 CE is answered, not refused,
 * even though a request for the lunar date of the same day is refused.
 */

/**
 * Where in a cycle's name list the anchor day sits.
 *
 * The anchor records which position falls on it — the dina anchor is a
 * Jemuwah, not a Senen — so the phase comes from the cited data rather than
 * from the incidental order of an array in this file.
 */
function anchorIndexIn(names: ReadonlyArray<string>, anchor: Anchor): number {
  const index = anchor.anchorValue ? names.indexOf(anchor.anchorValue) : -1
  if (index < 0) {
    throw new Error(
      `${anchor.id} menyebut posisi "${anchor.anchorValue}" yang tidak ada dalam siklusnya`,
    )
  }
  return index
}

/** Build the derivation record shared by every modulo cycle. */
function moduloDerivation(
  anchor: Anchor,
  jdn: Jdn,
  modulus: number,
  index: number,
): Derivation {
  return {
    kind: 'modulo',
    anchorId: anchor.id,
    anchorJdn: anchor.jdn,
    anchorGregorian: anchor.gregorian,
    jdn,
    offset: jdn - anchor.jdn,
    modulus,
    index,
    source: anchor.source,
    status: anchor.status,
    note: anchor.notes,
  }
}

/** The pasaran — Legi, Pahing, Pon, Wage, Kliwon. Period exactly 5. */
export function pasaranOf(jdn: Jdn): CycleValue {
  const anchor = ANCHORS.pasaran
  const index = mod(jdn - anchor.jdn + anchorIndexIn(PASARAN, anchor), PASARAN_LENGTH)
  return {
    name: PASARAN[index]!,
    index,
    derivation: moduloDerivation(anchor, jdn, PASARAN_LENGTH, index),
  }
}

/** The dina — the seven-day week. Period exactly 7. */
export function dinaOf(jdn: Jdn): CycleValue {
  const anchor = ANCHORS.dina
  const index = mod(jdn - anchor.jdn + anchorIndexIn(DINA, anchor), DINA_LENGTH)
  return {
    name: DINA[index]!,
    index,
    derivation: moduloDerivation(anchor, jdn, DINA_LENGTH, index),
  }
}

/**
 * The wuku — one of thirty named weeks in the 210-day pawukon cycle.
 *
 * The wuku changes only on Ahad, which follows from the epoch rather than
 * being imposed on it: JDN 146 is itself an Ahad. See the anchor's notes on
 * why this value is marked unverified.
 */
export function wukuOf(jdn: Jdn): CycleValue {
  const anchor = ANCHORS.wuku
  const dayInCycle = mod(
    jdn - anchor.jdn + anchorIndexIn(WUKU, anchor) * DINA_LENGTH,
    PAWUKON_LENGTH,
  )
  const index = Math.floor(dayInCycle / DINA_LENGTH)
  return {
    name: WUKU[index]!,
    index,
    derivation: moduloDerivation(anchor, jdn, PAWUKON_LENGTH, dayInCycle),
  }
}

/** Position within the current wuku, 1–7. */
export function dayInWukuOf(jdn: Jdn): number {
  return mod(jdn - ANCHORS.wuku.jdn, DINA_LENGTH) + 1
}

/**
 * Neptu — the traditional values of the dina and the pasaran, summed.
 *
 * The values are tradition and cited; the sum is arithmetic. Nothing is
 * derived from the total here. Anything that would be — character, a
 * compatibility category, a good or bad day — is interpretation and belongs
 * to the primbon layer, which does not ship in this release (PRD §4, §10).
 */
export function neptuOf(dina: CycleValue, pasaran: CycleValue): NeptuSum {
  const dinaValue = NEPTU.dina[dina.name]
  const pasaranValue = NEPTU.pasaran[pasaran.name]
  if (dinaValue === undefined || pasaranValue === undefined) {
    // Unreachable while the neptu table covers all seven dina and five
    // pasaran, which the build validator asserts.
    throw new Error(`neptu tidak tercatat untuk ${dina.name} ${pasaran.name}`)
  }
  return {
    dina: dinaValue,
    pasaran: pasaranValue,
    total: dinaValue + pasaranValue,
    source: NEPTU.source,
  }
}

/**
 * The weton — the pairing of dina and pasaran, repeating every 35 days.
 *
 * That 35-day period is the selapan the project is named for.
 */
export function wetonOf(jdn: Jdn): Weton {
  const dina = dinaOf(jdn)
  const pasaran = pasaranOf(jdn)
  return {
    dina,
    pasaran,
    name: `${dina.name} ${pasaran.name}`,
    neptu: neptuOf(dina, pasaran),
  }
}

/** The 0-based position in the 35-day selapan cycle. */
export function selapanIndexOf(jdn: Jdn): number {
  // The pair (dina, pasaran) is uniquely determined by jdn mod 35 because 5
  // and 7 are coprime — the Chinese remainder theorem, and the reason the
  // wheels realign every 35 days rather than sooner.
  return mod(jdn - ANCHORS.pasaran.jdn, 35)
}
