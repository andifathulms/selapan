import { formatGregorian, jdnToGregorian, type Jdn } from '@/lib/jdn'
import { ANCHORS } from '@/lib/data'
import type { KurupReckoning, Refusal } from '@/lib/trace/types'
import { MAX_YEAR_AJ, ERA_YEAR_AJ, yearLength, yearStartJdn } from '@/lib/lunar/years'

/**
 * Per-subsystem validity (CLAUDE.md invariant 3).
 *
 * The continuous cycles have no validity range at all and therefore appear
 * nowhere in this file. Only the lunar system is bounded: it begins with
 * Sultan Agung's reform and has no meaning before it. Outside the range the
 * engine refuses — it does not clamp, does not return a nearest match, and
 * does not extrapolate.
 */

/** 1 Sura Alip 1555 AJ = 8 July 1633 CE. */
export const LUNAR_VALID_FROM: Jdn = ANCHORS.lunar.jdn

/** The last day the engine will name a lunar date for, in a given reckoning. */
export function lunarValidTo(reckoning: KurupReckoning): Jdn {
  return yearStartJdn(MAX_YEAR_AJ, reckoning) + yearLength(MAX_YEAR_AJ, reckoning) - 1
}

export function lunarRefusalFor(jdn: Jdn, reckoning: KurupReckoning): Refusal | null {
  const validTo = lunarValidTo(reckoning)
  if (jdn >= LUNAR_VALID_FROM && jdn <= validTo) return null

  const from = formatGregorian(jdnToGregorian(LUNAR_VALID_FROM))
  const to = formatGregorian(jdnToGregorian(validTo))

  if (jdn < LUNAR_VALID_FROM) {
    return {
      subsystem: 'lunar',
      reason:
        `Sistem tahun Jawa baru dimulai pada ${from}, ketika Sultan Agung mengganti ` +
        `kalender Saka surya dengan sistem lunar dan meneruskan hitungan tahunnya sebagai ` +
        `${ERA_YEAR_AJ} AJ. Sebelum tanggal itu tidak ada tanggal Jawa untuk dihitung — ` +
        `yang ada hanya tanggal yang dikarang. Pasaran, dina, dan wuku untuk hari ini tetap ` +
        `dihitung, sebab ketiganya siklus kontinu yang tidak bermula di situ.`,
      validFrom: from,
      validTo: to,
    }
  }

  return {
    subsystem: 'lunar',
    reason:
      `Melewati ${to} tidak ada lagi kurup yang terdokumentasi maupun terproyeksikan, ` +
      `sehingga panjang tahunnya tidak diketahui. Meneruskan hitungan ke sana berarti ` +
      `menebak, dan tebakan itu akan terlihat persis seperti tanggal yang benar.`,
    validFrom: from,
    validTo: to,
  }
}

/** Whether a lunar year can be spoken about at all. */
export function isYearInRange(yearAj: number): boolean {
  return yearAj >= ERA_YEAR_AJ && yearAj <= MAX_YEAR_AJ
}

export function yearRefusal(yearAj: number): Refusal | null {
  if (isYearInRange(yearAj)) return null
  return {
    subsystem: 'lunar',
    reason:
      yearAj < ERA_YEAR_AJ
        ? `Tahun Jawa dimulai dari ${ERA_YEAR_AJ} AJ. Tahun ${yearAj} AJ tidak pernah ada dalam sistem ini.`
        : `Tahun ${yearAj} AJ melewati kurup terakhir yang tercatat, ${MAX_YEAR_AJ} AJ.`,
    validFrom: String(ERA_YEAR_AJ),
    validTo: String(MAX_YEAR_AJ),
  }
}
