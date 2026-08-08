import { describe, expect, it } from 'vitest'
import { gregorianToJdn, parseGregorian } from '@/lib/jdn'
import { ANCHORS } from '@/lib/data'
import { WUKU, dayInWukuOf, wukuOf } from '@/lib/cycles'

/**
 * Independent cross-check of the wuku phase against published Balinese
 * pawukon data (PRD §8, CLAUDE.md testing rules).
 *
 * This is the check `anchor.wuku.pawukon` was waiting for. The 210-day period
 * is guaranteed by the modulo and is asserted in `cycles.test.ts`; what no
 * period invariant can catch is a phase error — the whole cycle rotated by
 * one wuku. Only a second, independent source catches that, because the
 * arithmetic stays perfectly self-consistent while it is wrong.
 *
 * The engine's anchor comes from Dershowitz & Reingold, who fix the pawukon
 * correspondence at JD 146. These fixtures come from Balinese sources that do
 * not derive from that book, so agreement is evidence rather than restatement.
 *
 * Source A — Babad Bali (Yayasan Bali Galang), pewarigaan calendar for
 * January 2010, https://www.babadbali.com/pewarigaan/kalebali.php. The grid
 * runs Sunday-first with a leading partial week, and prints its six wuku in a
 * column aligned row-for-row with those weeks. Every day of the month is
 * covered by the fixtures below.
 *
 * Source B — two Balinese calendars consulted for the same day,
 * https://kalenderbali.org/ and https://kalenderbali.info/, both giving
 * "Saniscara Paing Marakeh" for 8 August 2026.
 *
 * The sources are sixteen years apart, which is the point: a phase error of
 * one wuku would have to be shared by all three to survive both.
 *
 * **The names differ and the positions do not.** Balinese and Javanese
 * tradition give the same 30-week cycle different names — Balinese *Uye*
 * where Javanese has *Wuye*, *Menail* against *Manahil*, *Merakih* against
 * *Marakeh*. That is orthography and dialect, not disagreement about the
 * calendar, so each fixture records the name its source printed and asserts
 * the *index*. Asserting the Javanese spelling against a Balinese page would
 * be asserting a translation this project made up.
 */

const PAWUKON_FIXTURES: ReadonlyArray<{
  readonly iso: string
  /** The wuku name exactly as the cited source prints it. */
  readonly printed: string
  /** Position in the 30-wuku cycle, 0-based. This is the claim under test. */
  readonly index: number
  /** True where the source shows this date as the first day of its wuku. */
  readonly startsWuku: boolean
  readonly source: string
}> = [
  // Babad Bali, Januari 2010. Row 1 is the partial week Jum'at–Sabtu, 1–2.
  { iso: '2010-01-01', printed: 'Uye', index: 21, startsWuku: false, source: 'Babad Bali, Januari 2010, baris 1' },
  { iso: '2010-01-02', printed: 'Uye', index: 21, startsWuku: false, source: 'Babad Bali, Januari 2010, baris 1' },
  { iso: '2010-01-03', printed: 'Menail', index: 22, startsWuku: true, source: 'Babad Bali, Januari 2010, baris 2' },
  { iso: '2010-01-09', printed: 'Menail', index: 22, startsWuku: false, source: 'Babad Bali, Januari 2010, baris 2' },
  { iso: '2010-01-10', printed: 'Prangbakat', index: 23, startsWuku: true, source: 'Babad Bali, Januari 2010, baris 3' },
  { iso: '2010-01-17', printed: 'Bala', index: 24, startsWuku: true, source: 'Babad Bali, Januari 2010, baris 4' },
  { iso: '2010-01-24', printed: 'Ugu', index: 25, startsWuku: true, source: 'Babad Bali, Januari 2010, baris 5' },
  { iso: '2010-01-31', printed: 'Wayang', index: 26, startsWuku: true, source: 'Babad Bali, Januari 2010, baris 6' },
  // kalenderbali.org dan kalenderbali.info, dikutip 8 Agustus 2026.
  { iso: '2026-08-08', printed: 'Merakih', index: 17, startsWuku: false, source: 'kalenderbali.org / kalenderbali.info' },
]

const jdnOf = (iso: string) => gregorianToJdn(parseGregorian(iso)!)

describe('wuku cross-checked against published Balinese pawukon data', () => {
  for (const { iso, printed, index, source } of PAWUKON_FIXTURES) {
    it(`${iso} falls in wuku ${index + 1} of 30, printed "${printed}" (${source})`, () => {
      expect(wukuOf(jdnOf(iso)).index).toBe(index)
      // The engine keeps Javanese names (CLAUDE.md: terminology is preserved).
      expect(wukuOf(jdnOf(iso)).name).toBe(WUKU[index])
    })
  }

  for (const { iso, printed } of PAWUKON_FIXTURES.filter((f) => f.startsWuku)) {
    it(`${iso} is the first day of the wuku the source prints as "${printed}"`, () => {
      expect(dayInWukuOf(jdnOf(iso))).toBe(1)
    })
  }

  it('covers every day of the cross-checked month, not only its boundaries', () => {
    // Babad Bali assigns a wuku to all 31 days of January 2010. The fixtures
    // above pin the boundaries; this walks the whole month so the published
    // page is asserted entire rather than sampled.
    const expected = [
      ...Array<number>(2).fill(21), // 1–2    Uye / Wuye
      ...Array<number>(7).fill(22), // 3–9    Menail / Manahil
      ...Array<number>(7).fill(23), // 10–16  Prangbakat
      ...Array<number>(7).fill(24), // 17–23  Bala
      ...Array<number>(7).fill(25), // 24–30  Ugu / Wugu
      26, // 31     Wayang
    ]
    expect(expected).toHaveLength(31)

    const start = jdnOf('2010-01-01')
    for (const [offset, index] of expected.entries()) {
      expect(wukuOf(start + offset).index).toBe(index)
    }
  })

  it('a one-wuku phase error would have been caught by these fixtures', () => {
    // The guard on the guard. If the anchor were rotated by a single wuku the
    // period invariants would still pass, so this asserts that the fixtures
    // above are actually sensitive to the thing they exist to detect.
    const start = jdnOf('2010-01-01')
    for (const shift of [-7, 7]) {
      const shifted = PAWUKON_FIXTURES.map((f) => wukuOf(jdnOf(f.iso) + shift).index)
      const actual = PAWUKON_FIXTURES.map((f) => f.index)
      expect(shifted).not.toStrictEqual(actual)
    }
    expect(wukuOf(start).index).not.toBe(wukuOf(start + 7).index)
  })

  it('the anchor records the cross-check that verified it', () => {
    // Guards against the status being flipped back without evidence, and
    // against the evidence being dropped while the status stays. `verified`
    // without a named independent check is meaningless.
    expect(ANCHORS.wuku.status).toBe('verified')
    expect(ANCHORS.wuku.crossCheck).toMatch(/Babad Bali/)
  })
})
