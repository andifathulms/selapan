import { z } from 'zod'

/**
 * Schemas for every piece of cited data in the repository.
 *
 * The build runs `scripts/validate-data.ts` against these before Next is
 * allowed to compile (CLAUDE.md: `pnpm data:validate` gates the build).
 * An uncited anchor or an uncited interpretation fails the build. That is
 * the whole point — it is what separates this from the weton sites the PRD
 * describes in §2.
 */

const ISO_DAY = /^-?\d{4}-\d{2}-\d{2}$/

/**
 * Where a claim comes from.
 *
 * `locator` names the place within the work — a chapter, a table, a dated
 * page of a printed calendar. It is deliberately free text: a printed
 * Javanese wall calendar has no page numbers, and inventing one would be
 * worse than describing where to look.
 */
export const sourceSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1).optional(),
  year: z.number().int().optional(),
  publisher: z.string().min(1).optional(),
  locator: z.string().min(1),
  url: z.string().url().optional(),
})

export type Source = z.infer<typeof sourceSchema>

/**
 * `verified` means an independent derivation reproduces the correspondence,
 * and `crossCheck` says which one. `unverified` means the value is taken on
 * the source's authority alone and has not been confirmed against a second,
 * independent source. Unverified values render in grey and say so.
 */
export const verificationStatus = z.enum(['verified', 'unverified'])

export const anchorSchema = z
  .object({
    id: z.string().regex(/^anchor\.[a-z]+\.[a-z0-9.]+$/),
    subsystem: z.enum(['pasaran', 'dina', 'wuku', 'lunar']),
    gregorian: z.string().regex(ISO_DAY),
    jdn: z.number().int(),
    correspondence: z.string().min(1),
    source: sourceSchema,
    status: verificationStatus,
    crossCheck: z.string().min(1).optional(),
    verifiedOn: z.string().regex(ISO_DAY),
    notes: z.string().min(1).optional(),
  })
  .strict()
  .refine((a) => a.status !== 'verified' || typeof a.crossCheck === 'string', {
    message: 'a verified anchor must name the independent check that verified it',
    path: ['crossCheck'],
  })

export type Anchor = z.infer<typeof anchorSchema>

/**
 * A kurup — the 120-year correction cycle. Named by the mnemonic fixing
 * which weton the year Alip begins on: Aboge is Alip-Rebo-Wage, Asapon is
 * Alip-Selasa-Pon (PRD §1).
 */
export const kurupSchema = z
  .object({
    id: z.string().regex(/^kurup\.[a-z]+\.\d+$/),
    name: z.string().min(1),
    mnemonic: z.string().min(1),
    /**
     * The mnemonic spelled out — "Alip Rebo Wage" for Aboge. Recorded rather
     * than derived: the syllable elision is irregular (Jemuwah contributes
     * "jum", Selasa only "sa"), so a rule that generated these names would be
     * a rule this project invented.
     */
    mnemonicGloss: z.string().min(1),
    startYearAj: z.number().int(),
    endYearAj: z.number().int(),
    startJdn: z.number().int(),
    startGregorian: z.string().regex(ISO_DAY),
    startDina: z.string().min(1),
    startPasaran: z.string().min(1),
    lengthYears: z.number().int().positive(),
    source: sourceSchema,
    status: verificationStatus,
    crossCheck: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  })
  .strict()
  .refine((k) => k.endYearAj === k.startYearAj + k.lengthYears - 1, {
    message: 'endYearAj must be startYearAj + lengthYears - 1',
    path: ['endYearAj'],
  })

export type KurupDefinition = z.infer<typeof kurupSchema>

/** A traditional neptu value for a dina or a pasaran. */
export const neptuTableSchema = z
  .object({
    id: z.literal('neptu.traditional'),
    dina: z.record(z.string(), z.number().int().positive()),
    pasaran: z.record(z.string(), z.number().int().positive()),
    source: sourceSchema,
    status: verificationStatus,
    crossCheck: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  })
  .strict()

export type NeptuTable = z.infer<typeof neptuTableSchema>

/** One of the twelve mangsa of the pranata mangsa solar calendar. */
export const mangsaSchema = z
  .object({
    index: z.number().int().min(1).max(12),
    name: z.string().min(1),
    numeral: z.string().min(1),
    startMonth: z.number().int().min(1).max(12),
    startDay: z.number().int().min(1).max(31),
    endMonth: z.number().int().min(1).max(12),
    endDay: z.number().int().min(1).max(31),
    lengthDays: z.number().int().positive(),
    marker: z.string().min(1),
  })
  .strict()

export const mangsaTableSchema = z
  .object({
    id: z.literal('mangsa.pranata'),
    entries: z.array(mangsaSchema).length(12),
    source: sourceSchema,
    status: verificationStatus,
    crossCheck: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  })
  .strict()

export type Mangsa = z.infer<typeof mangsaSchema>
export type MangsaTable = z.infer<typeof mangsaTableSchema>

/**
 * A primbon interpretation entry. M6 material, gated on a reviewer.
 *
 * `attribution` must begin "Menurut" — the copy rule from PRD §9 is enforced
 * in the schema, not left to review. Nothing in this repository may phrase an
 * interpretation as a statement about the reader.
 */
export const primbonEntrySchema = z
  .object({
    id: z.string().min(1),
    table: z.string().min(1),
    key: z.string().min(1),
    category: z.string().min(1),
    text: z.string().min(1),
    attribution: z.string().startsWith('Menurut'),
    source: sourceSchema,
    regionalVariant: z.string().min(1).optional(),
    status: verificationStatus,
  })
  .strict()

export type PrimbonEntry = z.infer<typeof primbonEntrySchema>
