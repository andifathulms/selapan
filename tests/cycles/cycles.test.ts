import { describe, expect, it } from 'vitest'
import { gregorianToJdn } from '@/lib/jdn'
import {
  DINA_LENGTH,
  PASARAN_LENGTH,
  PAWUKON_LENGTH,
  WETON_LENGTH,
  WUKU,
  dayInWukuOf,
  dinaOf,
  pasaranOf,
  selapanIndexOf,
  wetonOf,
  wukuOf,
} from '@/lib/cycles'
import { ANCHORS } from '@/lib/data'

/**
 * Cycle invariants over long ranges.
 *
 * These are the cheapest strong tests available (CLAUDE.md working style):
 * an off-by-one in an anchor shows up immediately as a broken period or a
 * repeated value, without needing an external oracle.
 */

const CENTURY_START = gregorianToJdn({ year: 1900, month: 1, day: 1 })
const CENTURY_END = gregorianToJdn({ year: 2000, month: 1, day: 1 })
const CENTURY = CENTURY_END - CENTURY_START // 36524 consecutive days

describe('period exactness across a century of consecutive days', () => {
  const cases = [
    { label: 'pasaran', period: PASARAN_LENGTH, of: (j: number) => pasaranOf(j).name },
    { label: 'dina', period: DINA_LENGTH, of: (j: number) => dinaOf(j).name },
    { label: 'weton', period: WETON_LENGTH, of: (j: number) => wetonOf(j).name },
    { label: 'wuku', period: PAWUKON_LENGTH, of: (j: number) => wukuOf(j).name },
  ] as const

  for (const { label, period, of } of cases) {
    it(`${label} repeats with period exactly ${period}`, () => {
      for (let jdn = CENTURY_START; jdn < CENTURY_END; jdn++) {
        expect(of(jdn + period)).toBe(of(jdn))
      }
    })

    it(`${label} does not repeat any sooner than ${period}`, () => {
      // A shorter period would mean the cycle names fewer distinct days than
      // it claims. Checked at every offset below the true period.
      for (let shorter = 1; shorter < period; shorter++) {
        let matchedEverywhere = true
        for (let jdn = CENTURY_START; jdn < CENTURY_START + period * 3; jdn++) {
          if (of(jdn + shorter) !== of(jdn)) {
            matchedEverywhere = false
            break
          }
        }
        expect(matchedEverywhere, `${label} also repeats every ${shorter} days`).toBe(false)
      }
    })
  }
})

describe('consecutive days advance every cycle by exactly one', () => {
  it('pasaran and dina step forward with no gaps and no repeats', () => {
    for (let jdn = CENTURY_START; jdn < CENTURY_END; jdn++) {
      expect(pasaranOf(jdn + 1).index).toBe((pasaranOf(jdn).index + 1) % PASARAN_LENGTH)
      expect(dinaOf(jdn + 1).index).toBe((dinaOf(jdn).index + 1) % DINA_LENGTH)
    }
  })

  it('every pasaran and dina name occurs in each full turn of its cycle', () => {
    const pasaran = new Set<string>()
    for (let jdn = CENTURY_START; jdn < CENTURY_START + PASARAN_LENGTH; jdn++) {
      pasaran.add(pasaranOf(jdn).name)
    }
    expect(pasaran.size).toBe(PASARAN_LENGTH)

    const dina = new Set<string>()
    for (let jdn = CENTURY_START; jdn < CENTURY_START + DINA_LENGTH; jdn++) {
      dina.add(dinaOf(jdn).name)
    }
    expect(dina.size).toBe(DINA_LENGTH)
  })

  it('all thirty wuku occur once per 210-day cycle, in order', () => {
    // Start on the first day of a wuku, otherwise the 210-day window clips a
    // wuku at each end and sees the same one thirty-one times.
    let start = CENTURY_START
    while (dayInWukuOf(start) !== 1) start++

    const seen: string[] = []
    for (let jdn = start; jdn < start + PAWUKON_LENGTH; jdn++) {
      const name = wukuOf(jdn).name
      if (seen[seen.length - 1] !== name) seen.push(name)
    }
    expect(seen).toHaveLength(WUKU.length)
    expect(new Set(seen).size).toBe(WUKU.length)
    // Same order as the canonical list, starting wherever the century did.
    const offset = WUKU.indexOf(seen[0] as (typeof WUKU)[number])
    for (const [i, name] of seen.entries()) {
      expect(name).toBe(WUKU[(offset + i) % WUKU.length])
    }
  })
})

describe('wuku structure', () => {
  it('changes only on Ahad, and every seventh day', () => {
    let changes = 0
    for (let jdn = CENTURY_START; jdn < CENTURY_END; jdn++) {
      if (wukuOf(jdn).name !== wukuOf(jdn + 1).name) {
        changes++
        // The day after a change is the first day of the new wuku.
        expect(dinaOf(jdn + 1).name).toBe('Ahad')
        expect(dayInWukuOf(jdn + 1)).toBe(1)
      }
    }
    expect(changes).toBe(Math.floor(CENTURY / DINA_LENGTH))
  })

  it('numbers the day within the wuku from 1 to 7', () => {
    for (let jdn = CENTURY_START; jdn < CENTURY_START + PAWUKON_LENGTH; jdn++) {
      const day = dayInWukuOf(jdn)
      expect(day).toBeGreaterThanOrEqual(1)
      expect(day).toBeLessThanOrEqual(DINA_LENGTH)
    }
  })
})

describe('selapan', () => {
  it('pairs each dina with each pasaran exactly once in 35 days', () => {
    const pairs = new Set<string>()
    for (let jdn = CENTURY_START; jdn < CENTURY_START + WETON_LENGTH; jdn++) {
      pairs.add(wetonOf(jdn).name)
    }
    expect(pairs.size).toBe(WETON_LENGTH)
  })

  it('indexes the selapan cycle consistently with the weton it names', () => {
    for (let jdn = CENTURY_START; jdn < CENTURY_END; jdn++) {
      expect(selapanIndexOf(jdn + WETON_LENGTH)).toBe(selapanIndexOf(jdn))
      expect(wetonOf(jdn + WETON_LENGTH).name).toBe(wetonOf(jdn).name)
    }
  })
})

describe('the continuous cycles are unbounded', () => {
  it('answers for dates centuries before the lunar era, without refusing', () => {
    // 1 January 1200 CE — the lunar system does not exist here, but these
    // three cycles do. PRD §3: different subsystems, different ranges.
    const jdn = gregorianToJdn({ year: 1200, month: 1, day: 1 })
    expect(wetonOf(jdn).name).toMatch(/^\w+ \w+$/)
    expect(WUKU).toContain(wukuOf(jdn).name)
  })

  it('answers for dates far in the future', () => {
    const jdn = gregorianToJdn({ year: 2400, month: 6, day: 15 })
    expect(pasaranOf(jdn).index).toBeGreaterThanOrEqual(0)
    expect(pasaranOf(jdn).index).toBeLessThan(PASARAN_LENGTH)
  })
})

describe('neptu', () => {
  it('sums the traditional dina and pasaran values', () => {
    // Setu 9 + Pahing 9 = 18, the largest neptu there is.
    const jdn = gregorianToJdn({ year: 1633, month: 7, day: 8 })
    const weton = wetonOf(jdn)
    expect(weton.name).toBe('Jemuwah Legi')
    expect(weton.neptu.dina).toBe(6)
    expect(weton.neptu.pasaran).toBe(5)
    expect(weton.neptu.total).toBe(11)
  })

  it('never produces a total outside the range the tables allow', () => {
    for (let jdn = CENTURY_START; jdn < CENTURY_START + WETON_LENGTH; jdn++) {
      const { total } = wetonOf(jdn).neptu
      expect(total).toBeGreaterThanOrEqual(7) // Selasa 3 + Wage 4
      expect(total).toBeLessThanOrEqual(18) // Setu 9 + Pahing 9
    }
  })

  it('carries its citation with it', () => {
    const { neptu } = wetonOf(CENTURY_START)
    expect(neptu.source.title).toBeTruthy()
    expect(neptu.source.locator).toBeTruthy()
  })
})

describe('derivations', () => {
  it('records arithmetic a reader can redo by hand', () => {
    const jdn = gregorianToJdn({ year: 1945, month: 8, day: 17 })
    const { derivation } = pasaranOf(jdn)
    expect(derivation.kind).toBe('modulo')
    if (derivation.kind !== 'modulo') throw new Error('expected a modulo derivation')
    expect(derivation.offset).toBe(jdn - derivation.anchorJdn)
    expect(((derivation.offset % derivation.modulus) + derivation.modulus) % derivation.modulus).toBe(
      derivation.index,
    )
    expect(derivation.source.locator).toBeTruthy()
  })

  it('propagates each anchor’s verification status into its derivation', () => {
    // The UI renders a value grey on the strength of this flag, so it must
    // survive from the anchor data into the derivation rather than being
    // decided in a component. Asserted against the anchors themselves: the
    // guarantee is that the two agree, not that any particular anchor holds a
    // particular status. `anchor.wuku.pawukon` was unverified until it was
    // cross-checked against Balinese pawukon data, and hardcoding that here
    // meant this test failed for the good reason rather than a real one.
    expect(wukuOf(CENTURY_START).derivation.status).toBe(ANCHORS.wuku.status)
    expect(pasaranOf(CENTURY_START).derivation.status).toBe(ANCHORS.pasaran.status)
    expect(dinaOf(CENTURY_START).derivation.status).toBe(ANCHORS.dina.status)
  })
})
