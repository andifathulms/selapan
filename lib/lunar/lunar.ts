import type { Jdn } from '@/lib/jdn'
import type {
  CountDerivation,
  KurupReckoning,
  LunarDate,
  Resolved,
} from '@/lib/trace/types'
import { ok, refused } from '@/lib/trace/types'
import { lunarRefusalFor, yearRefusal } from '@/lib/range/validity'
import {
  DAL_IRREGULARITY_NOTE,
  ERA_YEAR_AJ,
  MAX_YEAR_AJ,
  isDalYear,
  kurupForYear,
  monthLengths,
  monthNameOf,
  winduIndexOf,
  winduNameOf,
  yearLength,
  yearStartJdn,
} from './years'

/**
 * JDN ↔ Javanese lunar date.
 *
 * A running count from the era rather than a modulo: year lengths vary with
 * the windu and the kurup, so there is nothing to take a remainder against.
 * The walk is recorded step by step in the derivation so the reader can
 * follow it (CLAUDE.md invariant 8).
 */

/** JDN → lunar date, or a structured refusal if outside the range. */
export function lunarFromJdn(
  jdn: Jdn,
  reckoning: KurupReckoning,
): Resolved<LunarDate> {
  const refusal = lunarRefusalFor(jdn, reckoning)
  if (refusal) return refused(refusal)

  const steps: Array<{ label: string; days: number }> = []

  // Walk forward year by year from the era. Roughly 500 iterations at the far
  // end of the supported range — cheap, and far clearer than a closed form
  // that would have to special-case every kurup boundary anyway.
  let yearAj = ERA_YEAR_AJ
  let cursor = yearStartJdn(ERA_YEAR_AJ, reckoning)
  for (;;) {
    const length = yearLength(yearAj, reckoning)
    if (cursor + length > jdn) break
    cursor += length
    yearAj++
  }

  const kurup = kurupForYear(yearAj, reckoning)
  if (!kurup) {
    // Unreachable: the range check above already established that a kurup
    // covers this day.
    return refused({
      subsystem: 'kurup',
      reason: `tidak ada kurup yang mencakup tahun ${yearAj} AJ`,
      validFrom: String(ERA_YEAR_AJ),
      validTo: String(MAX_YEAR_AJ),
    })
  }

  steps.push({
    label: `Dari awal kurup ${kurup.definition.name} (1 Sura ${kurup.startYearAj} AJ)`,
    days: cursor - kurup.startJdn,
  })

  const lengths = monthLengths(yearAj, reckoning)
  let monthIndex = 0
  for (; monthIndex < lengths.length; monthIndex++) {
    const length = lengths[monthIndex]!
    if (cursor + length > jdn) break
    cursor += length
    steps.push({ label: `Melewati ${monthNameOf(monthIndex)}`, days: length })
  }

  const day = jdn - cursor + 1
  steps.push({ label: `Hari ke-${day} dalam ${monthNameOf(monthIndex)}`, days: day })

  const notes: string[] = []
  if (kurup.definition.status === 'unverified') {
    notes.push(
      `Kurup ${kurup.definition.name} berstatus belum terverifikasi: ${kurup.definition.notes ?? ''}`.trim(),
    )
  }
  if (isDalYear(yearAj)) notes.push(DAL_IRREGULARITY_NOTE)

  const derivation: CountDerivation = {
    kind: 'count',
    anchorId: kurup.definition.id,
    anchorJdn: kurup.startJdn,
    anchorGregorian: kurup.definition.startGregorian,
    jdn,
    elapsedDays: jdn - kurup.startJdn,
    steps,
    source: kurup.definition.source,
    status: kurup.definition.status === 'verified' && !isDalYear(yearAj)
      ? 'verified'
      : 'unverified',
    ...(notes.length > 0 ? { note: notes.join(' ') } : {}),
  }

  return ok({
    yearAj,
    windu: winduNameOf(yearAj),
    winduIndex: winduIndexOf(yearAj),
    monthIndex,
    monthName: monthNameOf(monthIndex),
    day,
    yearLength: yearLength(yearAj, reckoning),
    monthLength: lengths[monthIndex]!,
    kurupId: kurup.definition.id,
    kurupName: kurup.definition.name,
    kurupMnemonic: kurup.definition.mnemonic,
    derivation,
  })
}

/**
 * Lunar date → JDN. The inverse of the walk above.
 *
 * `month` is 1-based (1 = Sura), matching how a date is written rather than
 * how it is indexed.
 */
export function jdnFromLunar(
  yearAj: number,
  month: number,
  day: number,
  reckoning: KurupReckoning,
): Resolved<Jdn> {
  const outOfRange = yearRefusal(yearAj)
  if (outOfRange) return refused(outOfRange)

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return refused({
      subsystem: 'lunar',
      reason: `Bulan ${month} tidak ada; tahun Jawa berisi dua belas bulan, Sura sampai Besar.`,
      validFrom: '1',
      validTo: '12',
    })
  }

  const lengths = monthLengths(yearAj, reckoning)
  const monthLength = lengths[month - 1]!
  if (!Number.isInteger(day) || day < 1 || day > monthLength) {
    return refused({
      subsystem: 'lunar',
      reason:
        `${monthNameOf(month - 1)} ${yearAj} AJ berumur ${monthLength} hari, ` +
        `sehingga tanggal ${day} tidak ada di dalamnya.`,
      validFrom: '1',
      validTo: String(monthLength),
    })
  }

  let jdn = yearStartJdn(yearAj, reckoning)
  for (let m = 0; m < month - 1; m++) jdn += lengths[m]!
  return ok(jdn + day - 1)
}
