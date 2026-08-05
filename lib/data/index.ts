import type { Anchor, KurupDefinition, MangsaTable, NeptuTable } from './schema'

import lunar1555 from '@/data/anchors/lunar-1555.json'
import pasaran1633 from '@/data/anchors/pasaran-1633.json'
import dina1633 from '@/data/anchors/dina-1633.json'
import wukuPawukon from '@/data/anchors/wuku-pawukon.json'

import ajumgi from '@/data/kurup/ajumgi-1555.json'
import amiswon from '@/data/kurup/amiswon-1627.json'
import aboge from '@/data/kurup/aboge-1747.json'
import asapon from '@/data/kurup/asapon-1867.json'
import anenhing from '@/data/kurup/anenhing-1987.json'

import neptu from '@/data/neptu/neptu.json'
import mangsa from '@/data/mangsa/pranata-mangsa.json'

/**
 * Typed access to the cited data.
 *
 * The Zod schemas are not re-run here. Validation happens once, at build
 * time, in `scripts/validate-data.ts`, which gates `next build` and CI —
 * running it again in the browser would ship the schemas to every visitor
 * to re-prove something the build already proved. The assertions below are
 * therefore load-bearing only insofar as the build gate stays in place.
 * CLAUDE.md: do not weaken that gate.
 */

export const ANCHORS = {
  lunar: lunar1555 as Anchor,
  pasaran: pasaran1633 as Anchor,
  dina: dina1633 as Anchor,
  wuku: wukuPawukon as Anchor,
} as const

/** Ordered by start year. The engine relies on this ordering. */
export const KURUPS: ReadonlyArray<KurupDefinition> = [
  ajumgi,
  amiswon,
  aboge,
  asapon,
  anenhing,
] as KurupDefinition[]

export const NEPTU = neptu as NeptuTable
export const MANGSA = mangsa as MangsaTable

export function anchorById(id: string): Anchor | undefined {
  return Object.values(ANCHORS).find((a) => a.id === id)
}

export function kurupById(id: string): KurupDefinition | undefined {
  return KURUPS.find((k) => k.id === id)
}

export type {
  Anchor,
  KurupDefinition,
  Mangsa,
  MangsaTable,
  NeptuTable,
  PrimbonEntry,
  Source,
} from './schema'
