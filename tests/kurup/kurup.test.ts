import { describe, expect, it } from 'vitest'
import { formatGregorian, gregorianToJdn, jdnToGregorian, parseGregorian } from '@/lib/jdn'
import { KURUPS } from '@/lib/data'
import { dinaOf, pasaranOf, wetonOf } from '@/lib/cycles'
import {
  ERA_YEAR_AJ,
  MAX_YEAR_AJ,
  WINDU_YEAR_LENGTHS,
  jdnFromLunar,
  kurupForYear,
  lunarFromJdn,
  monthLengths,
  winduNameOf,
  yearLength,
  yearStartJdn,
} from '@/lib/lunar'
import { lunarValidTo } from '@/lib/range'

const jdnOf = (iso: string) => gregorianToJdn(parseGregorian(iso)!)

/** Unwrap a resolved value, failing loudly on a refusal. */
function expectOk<T>(resolved: { type: 'ok'; value: T } | { type: 'refused'; refusal: unknown }): T {
  if (resolved.type !== 'ok') {
    throw new Error(`expected a value, got a refusal: ${JSON.stringify(resolved.refusal)}`)
  }
  return resolved.value
}

describe('the windu', () => {
  it('runs eight years totalling 2835 days', () => {
    expect(WINDU_YEAR_LENGTHS).toHaveLength(8)
    expect(WINDU_YEAR_LENGTHS.reduce((a, b) => a + b, 0)).toBe(2835)
  })

  it('names 1555 AJ Alip and repeats every eight years', () => {
    expect(winduNameOf(ERA_YEAR_AJ)).toBe('Alip')
    for (let y = ERA_YEAR_AJ; y < ERA_YEAR_AJ + 200; y++) {
      expect(winduNameOf(y + 8)).toBe(winduNameOf(y))
    }
  })

  it('starts every documented kurup on a year Alip', () => {
    for (const kurup of KURUPS) {
      expect(winduNameOf(kurup.startYearAj)).toBe('Alip')
    }
  })
})

describe('kurup boundaries', () => {
  for (const kurup of KURUPS) {
    it(`${kurup.name} begins on ${kurup.startGregorian}, a ${kurup.startDina} ${kurup.startPasaran}`, () => {
      const jdn = jdnOf(kurup.startGregorian)
      expect(jdn).toBe(kurup.startJdn)
      expect(wetonOf(jdn).name).toBe(`${kurup.startDina} ${kurup.startPasaran}`)

      // The day it begins is 1 Sura of its first year.
      const lunar = expectOk(lunarFromJdn(jdn, 'chronological'))
      expect(lunar.yearAj).toBe(kurup.startYearAj)
      expect(lunar.monthName).toBe('Sura')
      expect(lunar.day).toBe(1)
      expect(lunar.windu).toBe('Alip')
    })
  }

  it('applies the one-day correction in the final year of each kurup', () => {
    for (const [i, kurup] of KURUPS.entries()) {
      if (i === KURUPS.length - 1) continue // no documented successor
      const finalYear = kurup.endYearAj
      // Jimakir is normally 355 days; the last one of a kurup loses a day
      // from Besar, which is what makes a 120-year kurup 42,524 days.
      expect(winduNameOf(finalYear)).toBe('Jimakir')
      expect(yearLength(finalYear, 'chronological')).toBe(354)
      expect(monthLengths(finalYear, 'chronological')[11]).toBe(29)
    }
  })

  it('spans 42,524 days for each 120-year kurup', () => {
    for (const [i, kurup] of KURUPS.entries()) {
      const next = KURUPS[i + 1]
      if (!next || kurup.lengthYears !== 120) continue
      expect(next.startJdn - kurup.startJdn).toBe(42524)
      expect(42524).toBe(15 * 2835 - 1) // fifteen windu, less the correction
    }
  })

  it('runs the first kurup 72 years, which is what lands all the later ones', () => {
    const ajumgi = KURUPS[0]!
    const amiswon = KURUPS[1]!
    expect(ajumgi.lengthYears).toBe(72)
    expect(amiswon.startJdn - ajumgi.startJdn).toBe(9 * 2835 - 1)
  })

  it('lands each successive kurup on the weton its name encodes', () => {
    // The whole chain, rebuilt from the era anchor alone. This is the
    // cross-check recorded in anchor.lunar.1555.
    let jdn = KURUPS[0]!.startJdn
    for (const [i, kurup] of KURUPS.entries()) {
      expect(dinaOf(jdn).name).toBe(kurup.startDina)
      expect(pasaranOf(jdn).name).toBe(kurup.startPasaran)
      const next = KURUPS[i + 1]
      if (!next) break
      let days = 0
      for (let y = kurup.startYearAj; y <= kurup.endYearAj; y++) {
        days += yearLength(y, 'chronological')
      }
      jdn += days
    }
  })
})

describe('Aboge and Asapon', () => {
  const ASAPON_START = jdnOf('1936-03-24')

  it('agree on every day before the Asapon correction', () => {
    // 1747 AJ through the end of 1866 AJ: both reckonings are in kurup Aboge
    // and must produce identical dates.
    const from = jdnOf('1819-10-20')
    for (let jdn = from; jdn < ASAPON_START; jdn += 37) {
      const a = expectOk(lunarFromJdn(jdn, 'chronological'))
      const b = expectOk(lunarFromJdn(jdn, 'aboge'))
      expect(`${a.day} ${a.monthName} ${a.yearAj}`).toBe(`${b.day} ${b.monthName} ${b.yearAj}`)
    }
  })

  it('diverge by exactly one day from the Asapon correction onward', () => {
    // Asapon dropped a day that Aboge did not, so the Aboge year begins one
    // day later and the same Gregorian day sits one day earlier in the Aboge
    // lunar month. This is why Aboge villages sometimes observe Idul Fitri a
    // day after the national determination (PRD §1).
    for (let y = 1867; y <= 1986; y++) {
      expect(yearStartJdn(y, 'aboge') - yearStartJdn(y, 'chronological')).toBe(1)
    }
  })

  it('accumulates a second day of divergence at the next correction', () => {
    // Chronologically, Asapon gives way to Anenhing with another dropped day;
    // an Aboge reckoning applies neither. The gap is cumulative, not fixed.
    for (let y = 1987; y <= MAX_YEAR_AJ; y++) {
      expect(yearStartJdn(y, 'aboge') - yearStartJdn(y, 'chronological')).toBe(2)
    }
  })

  it('reads an Aboge date as the previous day under the other reckoning', () => {
    // The one-day offset, stated as it is actually experienced: what Asapon
    // calls today, Aboge calls yesterday. True from the day after the
    // correction — on the correction day itself there is no "yesterday" to
    // point at, which the next test covers.
    for (let jdn = ASAPON_START + 1; jdn < jdnOf('2052-01-01'); jdn += 53) {
      const aboge = expectOk(lunarFromJdn(jdn, 'aboge'))
      const yesterday = expectOk(lunarFromJdn(jdn - 1, 'chronological'))
      expect(`${aboge.day} ${aboge.monthName} ${aboge.yearAj}`).toBe(
        `${yesterday.day} ${yesterday.monthName} ${yesterday.yearAj}`,
      )
      expect(aboge.kurupName).toBe('Aboge')
    }
  })

  it('refuses a date the other reckoning does not have, rather than nudging it', () => {
    // 30 Besar 1866 exists under Aboge and does not exist under Asapon,
    // because that is the very day Asapon dropped. Asked for it in the wrong
    // reckoning, the engine refuses instead of returning 1 Sura 1867.
    expect(jdnFromLunar(1866, 12, 30, 'aboge').type).toBe('ok')
    // That day is 24 March 1936 — the same day Asapon calls 1 Sura 1867.
    expect(expectOk(jdnFromLunar(1866, 12, 30, 'aboge'))).toBe(ASAPON_START)
    const abogeThatDay = expectOk(lunarFromJdn(ASAPON_START, 'aboge'))
    expect(`${abogeThatDay.day} ${abogeThatDay.monthName} ${abogeThatDay.yearAj}`).toBe(
      '30 Besar 1866',
    )

    const refusal = jdnFromLunar(1866, 12, 30, 'chronological')
    expect(refusal.type).toBe('refused')
    if (refusal.type !== 'refused') return
    expect(refusal.refusal.reason).toContain('29 hari')
  })

  it('diverges nowhere else', () => {
    // Before 1747 AJ the two reckonings are the same object, so any
    // difference at all would be a bug in how the Aboge list is built.
    const from = jdnOf('1633-07-08')
    for (let jdn = from; jdn < jdnOf('1819-10-20'); jdn += 41) {
      const a = expectOk(lunarFromJdn(jdn, 'chronological'))
      const b = expectOk(lunarFromJdn(jdn, 'aboge'))
      expect(a.yearAj).toBe(b.yearAj)
      expect(a.day).toBe(b.day)
      expect(a.kurupId).toBe(b.kurupId)
    }
  })

  it('keeps the Aboge new year on Rebo Wage in every year Alip', () => {
    // The mnemonic is a standing claim about the reckoning, not just about
    // 1747: under Aboge, every Alip begins Rebo Wage. That is precisely what
    // the Asapon correction broke, and why both must be offered.
    for (let y = 1747; y <= MAX_YEAR_AJ; y += 8) {
      expect(winduNameOf(y)).toBe('Alip')
      expect(wetonOf(yearStartJdn(y, 'aboge')).name).toBe('Rebo Wage')
    }
  })

  it('keeps the Asapon new year on Selasa Pon through its own kurup', () => {
    for (let y = 1867; y <= 1986; y += 8) {
      expect(wetonOf(yearStartJdn(y, 'chronological')).name).toBe('Selasa Pon')
    }
  })
})

describe('round trip through the lunar calendar', () => {
  for (const reckoning of ['chronological', 'aboge'] as const) {
    it(`holds for every day of the supported range (${reckoning})`, () => {
      const from = jdnOf('1633-07-08')
      const to = lunarValidTo(reckoning)
      for (let jdn = from; jdn <= to; jdn += 7) {
        const lunar = expectOk(lunarFromJdn(jdn, reckoning))
        const back = expectOk(
          jdnFromLunar(lunar.yearAj, lunar.monthIndex + 1, lunar.day, reckoning),
        )
        expect(back, `${formatGregorian(jdnToGregorian(jdn))} (${reckoning})`).toBe(jdn)
      }
    })
  }

  it('numbers days consecutively with no gaps and no repeats', () => {
    const from = jdnOf('1866-01-01')
    let previous = expectOk(lunarFromJdn(from, 'chronological'))
    for (let jdn = from + 1; jdn < from + 30000; jdn++) {
      const current = expectOk(lunarFromJdn(jdn, 'chronological'))
      const advancedWithinMonth =
        current.yearAj === previous.yearAj &&
        current.monthIndex === previous.monthIndex &&
        current.day === previous.day + 1
      const startedNewMonth = current.day === 1 && previous.day === previous.monthLength
      expect(advancedWithinMonth || startedNewMonth).toBe(true)
      previous = current
    }
  })

  it('gives every year twelve months and its stated length', () => {
    for (let y = ERA_YEAR_AJ; y <= MAX_YEAR_AJ; y++) {
      const lengths = monthLengths(y, 'chronological')
      expect(lengths).toHaveLength(12)
      expect(lengths.reduce((a, b) => a + b, 0)).toBe(yearLength(y, 'chronological'))
      expect(yearStartJdn(y + 1 > MAX_YEAR_AJ ? y : y + 1, 'chronological')).toBeGreaterThan(0)
    }
  })

  it('starts each year exactly one year length after the previous one', () => {
    for (let y = ERA_YEAR_AJ; y < MAX_YEAR_AJ; y++) {
      expect(yearStartJdn(y + 1, 'chronological') - yearStartJdn(y, 'chronological')).toBe(
        yearLength(y, 'chronological'),
      )
    }
  })
})

describe('the kurup is never assumed', () => {
  it('looks up the applicable kurup by date, historical dates included', () => {
    const cases = [
      { iso: '1650-01-01', name: 'Ajumgi' },
      { iso: '1700-01-01', name: 'Ajumgi' },
      { iso: '1750-01-01', name: 'Amiswon' },
      { iso: '1900-01-01', name: 'Aboge' },
      { iso: '1936-03-24', name: 'Asapon' },
      { iso: '2026-08-06', name: 'Asapon' },
    ]
    for (const { iso, name } of cases) {
      expect(expectOk(lunarFromJdn(jdnOf(iso), 'chronological')).kurupName).toBe(name)
    }
  })

  it('marks a date under the projected future kurup as unverified', () => {
    // Anenhing has not begun. It is computed, but never silently.
    const inAnenhing = jdnOf('2060-01-01')
    const lunar = expectOk(lunarFromJdn(inAnenhing, 'chronological'))
    expect(lunar.kurupName).toBe('Anenhing')
    expect(lunar.derivation.status).toBe('unverified')
    expect(lunar.derivation.note).toBeTruthy()
  })

  it('marks Dal years unverified over the unimplemented month-length rule', () => {
    const dalYear = 1559 // 1555 + 4
    expect(winduNameOf(dalYear)).toBe('Dal')
    const lunar = expectOk(lunarFromJdn(yearStartJdn(dalYear, 'chronological'), 'chronological'))
    expect(lunar.derivation.status).toBe('unverified')
    expect(lunar.derivation.note).toContain('Dal')
  })
})

describe('derivations record the walk', () => {
  it('accounts for every day from the kurup start to the date', () => {
    const lunar = expectOk(lunarFromJdn(jdnOf('1945-08-17'), 'chronological'))
    const derivation = lunar.derivation
    expect(derivation.kind).toBe('count')
    expect(derivation.elapsedDays).toBe(jdnOf('1945-08-17') - derivation.anchorJdn)
    const accounted = derivation.steps.reduce((sum, step) => sum + step.days, 0)
    // Steps: days to the year, each completed month, then the day itself.
    expect(accounted).toBe(derivation.elapsedDays + 1)
    expect(kurupForYear(lunar.yearAj, 'chronological')?.definition.id).toBe(lunar.kurupId)
  })
})
