import { describe, expect, it } from 'vitest'
import { gregorianToJdn, parseGregorian } from '@/lib/jdn'
import { ANCHORS, KURUPS, NEPTU, MANGSA } from '@/lib/data'
import { dinaOf, pasaranOf, wetonOf } from '@/lib/cycles'

/**
 * Cited anchor fixtures.
 *
 * Each case is a correspondence recorded in `data/`, asserted against the
 * engine. These are the closest thing to an oracle this project has (PRD §8).
 */

const FIXTURES: ReadonlyArray<{
  readonly iso: string
  readonly weton: string
  readonly source: string
}> = [
  {
    iso: '1633-07-08',
    weton: 'Jemuwah Legi',
    source: 'anchor.lunar.1555 — 1 Sura Alip 1555 AJ, awal era Sultan Agungan',
  },
  {
    iso: '1936-03-24',
    weton: 'Selasa Pon',
    source: 'kurup.asapon.1867 — awal tahun Alip yang menamai kurup Asapon',
  },
  {
    iso: '1819-10-20',
    weton: 'Rebo Wage',
    source: 'kurup.aboge.1747 — awal tahun Alip yang menamai kurup Aboge',
  },
  {
    iso: '1703-05-17',
    weton: 'Kemis Kliwon',
    source: 'kurup.amiswon.1627 — awal tahun Alip yang menamai kurup Amiswon',
  },
  {
    iso: '1945-08-17',
    weton: 'Jemuwah Legi',
    source: 'Proklamasi Kemerdekaan Indonesia, tercatat luas sebagai Jumat Legi',
  },
]

describe('anchor fixtures reproduce exactly', () => {
  for (const { iso, weton, source } of FIXTURES) {
    it(`${iso} is ${weton} (${source})`, () => {
      expect(wetonOf(gregorianToJdn(parseGregorian(iso)!)).name).toBe(weton)
    })
  }
})

describe('anchors are self-consistent', () => {
  it('every anchor JDN matches its recorded Gregorian date', () => {
    for (const anchor of Object.values(ANCHORS)) {
      expect(gregorianToJdn(parseGregorian(anchor.gregorian)!)).toBe(anchor.jdn)
    }
  })

  it('every anchor names its own value correctly', () => {
    expect(pasaranOf(ANCHORS.pasaran.jdn).name).toBe('Legi')
    expect(dinaOf(ANCHORS.dina.jdn).name).toBe('Jemuwah')
  })

  it('every anchor carries a source with a locator', () => {
    for (const anchor of Object.values(ANCHORS)) {
      expect(anchor.source.title.length).toBeGreaterThan(0)
      expect(anchor.source.locator.length).toBeGreaterThan(0)
    }
  })

  it('nothing claims to be verified without naming its cross-check', () => {
    const claims = [...Object.values(ANCHORS), ...KURUPS, NEPTU, MANGSA]
    for (const claim of claims) {
      if (claim.status === 'verified') {
        expect(claim.crossCheck, `${'id' in claim ? claim.id : '?'}`).toBeTruthy()
      }
    }
  })
})

describe('kurup definitions', () => {
  it('each kurup starts on the weton its name encodes', () => {
    for (const kurup of KURUPS) {
      expect(dinaOf(kurup.startJdn).name).toBe(kurup.startDina)
      expect(pasaranOf(kurup.startJdn).name).toBe(kurup.startPasaran)
      expect(kurup.mnemonicGloss).toContain(kurup.startDina)
      expect(kurup.mnemonicGloss).toContain(kurup.startPasaran)
    }
  })

  it('tiles the timeline with no gaps and no overlaps', () => {
    for (const [i, kurup] of KURUPS.entries()) {
      if (i === 0) continue
      const previous = KURUPS[i - 1]!
      expect(kurup.startYearAj).toBe(previous.endYearAj + 1)
      expect(kurup.startJdn).toBeGreaterThan(previous.startJdn)
    }
  })

  it('begins at the lunar era anchor', () => {
    expect(KURUPS[0]!.startJdn).toBe(ANCHORS.lunar.jdn)
    expect(KURUPS[0]!.startYearAj).toBe(1555)
  })

  it('marks the projected future kurup as unverified', () => {
    // Anenhing has not begun. Extrapolating past the last documented
    // transition is exactly what this project refuses to do quietly.
    const anenhing = KURUPS[KURUPS.length - 1]!
    expect(anenhing.id).toBe('kurup.anenhing.1987')
    expect(anenhing.status).toBe('unverified')
  })
})
