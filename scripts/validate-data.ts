/**
 * Build-time validation of every cited datum in the repository.
 *
 * Runs before `next build` and in CI. It fails the build on:
 *   - an anchor, kurup, or interpretation that does not match its schema
 *   - an anchor whose recorded JDN disagrees with its recorded Gregorian date
 *   - a duplicate id
 *   - a claim of `verified` with no independent check named
 *   - a primbon entry without a citation, or phrased in the second person
 *
 * CLAUDE.md: do not weaken this. It is the difference between a cited
 * calendar and the uncited weton sites in PRD §2.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import {
  anchorSchema,
  kurupSchema,
  mangsaTableSchema,
  neptuTableSchema,
  primbonEntrySchema,
} from '../lib/data/schema'
import { gregorianToJdn, parseGregorian } from '../lib/jdn'

const DATA = join(process.cwd(), 'data')

const failures: string[] = []
const notes: string[] = []

function fail(where: string, message: string): void {
  failures.push(`${where}: ${message}`)
}

function readJsonDir(dir: string): ReadonlyArray<{ file: string; value: unknown }> {
  const path = join(DATA, dir)
  if (!existsSync(path)) return []
  return readdirSync(path)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((file) => ({
      file: `data/${dir}/${file}`,
      value: JSON.parse(readFileSync(join(path, file), 'utf8')) as unknown,
    }))
}

function checkSchema<T>(
  schema: z.ZodType<T>,
  file: string,
  value: unknown,
): T | undefined {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  for (const issue of result.error.issues) {
    fail(file, `${issue.path.join('.') || '(root)'} — ${issue.message}`)
  }
  return undefined
}

const seenIds = new Set<string>()
function checkUniqueId(file: string, id: string): void {
  if (seenIds.has(id)) fail(file, `id sudah dipakai di berkas lain: ${id}`)
  seenIds.add(id)
}

// ── Anchors ────────────────────────────────────────────────────────────────
// Every anchor states both a Gregorian date and a JDN. They must agree, and
// the check is independent: it recomputes the JDN rather than trusting it.
const anchors = readJsonDir('anchors')
if (anchors.length === 0) fail('data/anchors', 'tidak ada anchor sama sekali')

for (const { file, value } of anchors) {
  const anchor = checkSchema(anchorSchema, file, value)
  if (!anchor) continue
  checkUniqueId(file, anchor.id)

  const parsed = parseGregorian(anchor.gregorian)
  if (!parsed) {
    fail(file, `gregorian bukan tanggal yang ada: ${anchor.gregorian}`)
    continue
  }
  const computed = gregorianToJdn(parsed)
  if (computed !== anchor.jdn) {
    fail(
      file,
      `jdn tidak cocok dengan gregorian: tercatat ${anchor.jdn}, seharusnya ${computed}`,
    )
  }
  if (anchor.status === 'unverified') {
    notes.push(`${anchor.id} — belum terverifikasi silang: ${anchor.notes ?? 'tanpa keterangan'}`)
  }
}

// ── Kurup ──────────────────────────────────────────────────────────────────
// Kurup periods must tile the timeline without gap or overlap, and each start
// JDN must equal the previous start plus the previous period's length. The
// arithmetic is checked here so that no wrong kurup can reach the engine.
const kurups = readJsonDir('kurup')
  .map(({ file, value }) => ({ file, kurup: checkSchema(kurupSchema, file, value) }))
  .filter((k): k is { file: string; kurup: NonNullable<typeof k.kurup> } => Boolean(k.kurup))
  .sort((a, b) => a.kurup.startYearAj - b.kurup.startYearAj)

if (kurups.length === 0) fail('data/kurup', 'tidak ada definisi kurup')

for (const [i, { file, kurup }] of kurups.entries()) {
  checkUniqueId(file, kurup.id)

  const parsed = parseGregorian(kurup.startGregorian)
  if (!parsed) {
    fail(file, `startGregorian bukan tanggal yang ada: ${kurup.startGregorian}`)
  } else if (gregorianToJdn(parsed) !== kurup.startJdn) {
    fail(
      file,
      `startJdn tidak cocok dengan startGregorian: tercatat ${kurup.startJdn}, seharusnya ${gregorianToJdn(parsed)}`,
    )
  }

  const previous = kurups[i - 1]
  if (previous) {
    if (previous.kurup.endYearAj + 1 !== kurup.startYearAj) {
      fail(
        file,
        `ada celah atau tumpang tindih tahun: ${previous.kurup.id} berakhir ${previous.kurup.endYearAj}, ${kurup.id} mulai ${kurup.startYearAj}`,
      )
    }
    if (previous.kurup.startJdn >= kurup.startJdn) {
      fail(file, `startJdn tidak menaik terhadap ${previous.kurup.id}`)
    }
  }

  // The mnemonic is the kurup's whole identity — Aboge is Alip-Rebo-Wage.
  // The syllable elision is irregular, so the gloss is recorded rather than
  // derived; what is checked is that the gloss agrees with the weton beside it.
  const gloss = kurup.mnemonicGloss.toLowerCase()
  for (const part of ['alip', kurup.startDina.toLowerCase(), kurup.startPasaran.toLowerCase()]) {
    if (!gloss.includes(part)) {
      fail(
        file,
        `mnemonicGloss "${kurup.mnemonicGloss}" tidak menyebut "${part}", padahal kurup ini tercatat mulai Alip ${kurup.startDina} ${kurup.startPasaran}`,
      )
    }
  }
  if (kurup.status === 'unverified') {
    notes.push(`${kurup.id} — belum terverifikasi silang: ${kurup.notes ?? 'tanpa keterangan'}`)
  }
}

// ── Neptu and mangsa ───────────────────────────────────────────────────────
for (const { file, value } of readJsonDir('neptu')) {
  const table = checkSchema(neptuTableSchema, file, value)
  if (!table) continue
  checkUniqueId(file, table.id)
  if (Object.keys(table.dina).length !== 7) fail(file, 'tabel dina harus berisi tujuh hari')
  if (Object.keys(table.pasaran).length !== 5) fail(file, 'tabel pasaran harus berisi lima pasaran')
}

for (const { file, value } of readJsonDir('mangsa')) {
  const table = checkSchema(mangsaTableSchema, file, value)
  if (!table) continue
  checkUniqueId(file, table.id)
  const total = table.entries.reduce((sum, e) => sum + e.lengthDays, 0)
  if (total !== 365) {
    fail(file, `panjang seluruh mangsa berjumlah ${total} hari, seharusnya 365`)
  }
  for (const [i, entry] of table.entries.entries()) {
    if (entry.index !== i + 1) fail(file, `mangsa ke-${i + 1} bernomor ${entry.index}`)
  }
}

// ── Primbon ────────────────────────────────────────────────────────────────
// M6 material. The directory is expected to be empty until a reviewer signs
// off (PRD §10), but the checks exist now so that nothing can be added later
// without a citation and without the second-person prohibition applying.
const SECOND_PERSON =
  /\b(anda|kamu|kowe|panjenengan|sampeyan|you|your)\b/i

for (const { file, value } of readJsonDir('primbon')) {
  const entry = checkSchema(primbonEntrySchema, file, value)
  if (!entry) continue
  checkUniqueId(file, entry.id)
  for (const field of ['text', 'category', 'attribution'] as const) {
    if (SECOND_PERSON.test(entry[field])) {
      fail(
        file,
        `${field} memakai sapaan orang kedua — tafsir tidak boleh dirumuskan sebagai pernyataan tentang pembaca (PRD §4)`,
      )
    }
  }
  if (/\b\d+\s*%|\bpaling baik\b|\bterbaik\b|\bskor\b/i.test(entry.text)) {
    fail(file, 'text mengandung peringkat, skor, atau rekomendasi (PRD §5)')
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
for (const note of notes) console.log(`  catatan  ${note}`)

if (failures.length > 0) {
  console.error(`\ndata:validate GAGAL — ${failures.length} masalah\n`)
  for (const f of failures) console.error(`  ✗ ${f}`)
  console.error('')
  process.exit(1)
}

const counts = [
  `${anchors.length} anchor`,
  `${kurups.length} kurup`,
  `${notes.length} bertanda belum terverifikasi`,
]
console.log(`data:validate lolos — ${counts.join(', ')}`)
