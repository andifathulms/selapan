'use client'

import { useRef, type ReactNode } from 'react'
import { DINA, PASARAN, WUKU } from '@/lib/cycles'
import type { CalendarTrace } from '@/lib/trace'
import { mangsaOfJdn, mangsaTable, type MangsaResult } from '@/lib/mangsa'
import type { Mangsa } from '@/lib/data'

/**
 * Five concentric rings, one per cycle, turning together (DESIGN-REWORK §3).
 *
 * Weton is the coincidence of the 5-cycle and the 7-cycle; wuku is 210 days
 * because it is 5×6×7; mangsa is a solar year running underneath, tied to
 * none of it; the lunar year drifts against all of it, which is why kurup
 * corrections exist. The wheel draws that relationship rather than saying it.
 *
 * A single ray is fixed at twelve o'clock — that is today — and every ring
 * rotates beneath it. When two cycles' boundaries land on the ray at once,
 * that is a coincidence (a selapanan, a wuku start, a new lunar month), and
 * it is visible without any extra marking: the boundary ticks simply meet
 * the ray at the same instant.
 *
 * Rotation for the three unbounded cycles (pasaran, dina, wuku) is driven by
 * elapsed days from a mounted origin rather than the index alone, and never
 * wrapped to [0, 360). Driving it from the index alone would make the ring
 * spin backwards through a whole turn every time the cycle wrapped, which
 * would say something false about how the cycle moves. The mangsa ring gets
 * the same treatment, because its 365-day cycle is exact even across a leap
 * year (29 February is absorbed into Kawolu — see lib/mangsa). The lunar
 * month ring cannot be: its segment count itself changes at every month
 * boundary (29 or 30 days), so there is no stable step to accumulate against
 * and it is recomputed directly each render.
 */
export type HighlightRing = 'pasaran' | 'dina' | 'wuku' | 'lunar'

export function CycleWheels({
  trace,
  highlightRing = null,
  surface = true,
  compact = false,
  onStep,
  footer,
}: {
  trace: CalendarTrace
  /** Draw on the ink-dark instrument surface (default). Every wheel on the
      site sits on it; the class re-scopes the palette so the same token
      classes read correctly there (theme/palette.ts). */
  surface?: boolean
  /** A small wheel: the mangsa names are left off, since at 220px they
      would be illegible. The ring itself stays. */
  compact?: boolean
  /** Swipe the wheel to step a day. Omitted where the wheel is read-only. */
  onStep?: (delta: number) => void
  /** Shown on the instrument surface beneath the rings — a stepper, a
      readout. */
  footer?: ReactNode
  /** Which ring a currently-open derivation drawer belongs to, if any — a
      modulo is a wheel, so the drawer should be able to point at its own
      ring rather than leaving the reader to find it among five
      (DESIGN-REWORK §5). */
  highlightRing?: HighlightRing | null
}) {
  const mangsa = mangsaOfJdn(trace.jdn)
  const table = [...mangsaTable()].sort((a, b) => a.index - b.index)
  const mangsaCumulative = cumulativeBefore(table)
  const totalMangsaDays = table.reduce((sum, e) => sum + e.lengthDays, 0)

  const origin = useRef<{
    jdn: number
    pasaran: number
    dina: number
    wukuWeeks: number
    mangsaDay: number | null
  }>({
    jdn: trace.jdn,
    pasaran: trace.pasaran.index,
    dina: trace.dina.index,
    wukuWeeks: trace.wuku.index + (trace.dayInWuku - 1) / 7,
    mangsaDay: mangsa.type === 'ok' ? mangsaDayOffset(mangsa.value, mangsaCumulative) : null,
  })

  const elapsed = trace.jdn - origin.current.jdn

  const pasaranStep = 360 / PASARAN.length
  const dinaStep = 360 / DINA.length
  const wukuStep = 360 / WUKU.length

  const pasaranRotation = -(origin.current.pasaran + elapsed) * pasaranStep
  const dinaRotation = -(origin.current.dina + elapsed) * dinaStep
  const wukuRotation = -(origin.current.wukuWeeks + elapsed / 7) * wukuStep

  // The mangsa ring only has a stable origin to accumulate from if today was
  // ok when the wheel mounted. If it was refused (pre-1855) and the reader
  // has since stepped into range, there is no continuous history to carry —
  // the ring is drawn from today's position directly instead, same as the
  // lunar month ring.
  const mangsaRotation =
    mangsa.type === 'ok'
      ? origin.current.mangsaDay !== null
        ? -((origin.current.mangsaDay + elapsed) / totalMangsaDays) * 360
        : -(mangsaDayOffset(mangsa.value, mangsaCumulative) / totalMangsaDays) * 360
      : 0

  const lunar = trace.lunar
  const lunarRotation =
    lunar.type === 'ok' ? -((lunar.value.day - 1) / lunar.value.monthLength) * 360 : 0
  const lunarUnverified = lunar.type === 'ok' && lunar.value.derivation.status === 'unverified'

  const titleParts = [
    `pasaran ${trace.pasaran.name}`,
    `dina ${trace.dina.name}`,
    `wuku ${trace.wuku.name}`,
    mangsa.type === 'ok' ? `mangsa ${mangsa.value.entry.name}` : null,
    lunar.type === 'ok' ? `bulan ${lunar.value.monthName}` : null,
  ].filter((p): p is string => p !== null)

  // Where the ray crosses each ring drawn. For the labelled rings the mark
  // sits just outside the label band, so it never lands on the name.
  const crossings = [
    PASARAN_R + BAND,
    DINA_R + BAND,
    WUKU_R,
    mangsa.type === 'ok' ? MANGSA_R : null,
    lunar.type === 'ok' ? LUNAR_R : null,
  ].filter((r): r is number => r !== null)

  const swipeFrom = useRef<number | null>(null)

  return (
    <figure
      className={[
        'mx-auto w-full',
        surface ? 'instrument instrument-panel p-3 sm:p-5' : '',
        onStep ? 'touch-pan-y select-none' : '',
      ].join(' ')}
      onPointerDown={onStep ? (e) => (swipeFrom.current = e.clientX) : undefined}
      onPointerUp={
        onStep
          ? (e) => {
              const from = swipeFrom.current
              swipeFrom.current = null
              if (from === null) return
              const dx = e.clientX - from
              // A swipe left reads as "next", the way a page turns.
              if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1)
            }
          : undefined
      }
    >
      <svg viewBox="-250 -250 500 500" role="img" className="mx-auto block w-full max-w-[460px]">
        <title>{`${titleParts.join(', ')} — ${trace.weton.name}, neptu ${trace.weton.neptu.total}`}</title>

        {/* The marker is fixed; the rings move beneath it (PRD §9). One ray,
            crossing every ring drawn — that is today, one position in every
            cycle at once (DESIGN-REWORK §3.2). Computed, so indigo — never
            rubric (CLAUDE.md invariant 12). Drawn first, so the names it
            passes through sit above it. */}
        <g className="text-indigo">
          <line x1={0} y1={-244} x2={0} y2={-CENTRE_R} stroke="currentColor" strokeWidth={1.4} />
          <polygon points={`0,${-CENTRE_R + 6} -6,${-CENTRE_R - 5} 6,${-CENTRE_R - 5}`} fill="currentColor" />
        </g>

        <EqualRing
          radius={PASARAN_R}
          names={PASARAN as unknown as ReadonlyArray<string>}
          rotationDeg={pasaranRotation}
          currentIndex={trace.pasaran.index}
          labelled
          fontSize={13}
          highlighted={highlightRing === 'pasaran'}
        />
        <EqualRing
          radius={DINA_R}
          names={DINA as unknown as ReadonlyArray<string>}
          rotationDeg={dinaRotation}
          currentIndex={trace.dina.index}
          labelled
          fontSize={12.5}
          highlighted={highlightRing === 'dina'}
        />
        <EqualRing
          radius={WUKU_R}
          names={WUKU as unknown as ReadonlyArray<string>}
          rotationDeg={wukuRotation}
          currentIndex={trace.wuku.index}
          labelled={false}
          emphasiseCurrent
          highlighted={highlightRing === 'wuku'}
        />

        {mangsa.type === 'ok' ? (
          <UnequalRing
            radius={MANGSA_R}
            entries={table}
            cumulative={mangsaCumulative}
            total={totalMangsaDays}
            rotationDeg={mangsaRotation}
            currentEntry={mangsa.value.entry}
            labelled={!compact}
          />
        ) : null}

        {lunar.type === 'ok' ? (
          <EqualRing
            radius={LUNAR_R}
            names={Array.from({ length: lunar.value.monthLength }, () => '')}
            rotationDeg={lunarRotation}
            currentIndex={lunar.value.day - 1}
            labelled={false}
            emphasiseCurrent
            muted={lunarUnverified}
            markStart
            highlighted={highlightRing === 'lunar'}
          />
        ) : null}

        <g className="text-indigo">
          {crossings.map((r) => (
            <circle
              key={r}
              cx={0}
              cy={-r}
              r={3.2}
              fill="currentColor"
              strokeWidth={1.5}
              className="stroke-paper"
            />
          ))}
        </g>

        <circle r={CENTRE_R} className="fill-paper stroke-ochre/40" strokeWidth={1} />
        <text y={-4} textAnchor="middle" fontSize={15} className="fill-indigo font-display">
          {trace.dina.name}
        </text>
        <text y={14} textAnchor="middle" fontSize={15} className="fill-indigo font-display">
          {trace.pasaran.name}
        </text>
        <text y={30} textAnchor="middle" fontSize={9} className="fill-ink/60 font-mono">
          {`neptu ${trace.weton.neptu.total}`}
        </text>
      </svg>
      {footer ? <figcaption className="mt-3">{footer}</figcaption> : null}
    </figure>
  )
}

/** Ring radii, centre outwards, and the half-height of a labelled band. */
const CENTRE_R = 42
const PASARAN_R = 66
const DINA_R = 112
const WUKU_R = 154
const MANGSA_R = 190
const LUNAR_R = 228
const BAND = 15

/** Degrees from twelve o'clock, clockwise, for a point at `deg` on `radius`. */
function pointOn(radius: number, deg: number): readonly [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [radius * Math.cos(rad), radius * Math.sin(rad)]
}

/** A filled band between two radii, from `startDeg` to `endDeg` — the
    "current segment" emphasis, thick enough to read as an arc rather than a
    line (DESIGN-REWORK §3.1: the wuku ring's current week, the mangsa ring's
    current, unequal mangsa). */
function segmentBand(radiusInner: number, radiusOuter: number, startDeg: number, endDeg: number): string {
  const [x1o, y1o] = pointOn(radiusOuter, startDeg)
  const [x2o, y2o] = pointOn(radiusOuter, endDeg)
  const [x2i, y2i] = pointOn(radiusInner, endDeg)
  const [x1i, y1i] = pointOn(radiusInner, startDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${x1o} ${y1o}`,
    `A ${radiusOuter} ${radiusOuter} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x2i} ${y2i}`,
    `A ${radiusInner} ${radiusInner} 0 ${largeArc} 0 ${x1i} ${y1i}`,
    'Z',
  ].join(' ')
}

const TURN = 'transform 420ms cubic-bezier(0.33, 0, 0.2, 1)'

/** Written out in full so Tailwind can find every class at build time. */
const BAND_CLASS = {
  computed: { soft: 'fill-indigo/20', medium: 'fill-indigo/25', strong: 'fill-indigo/35' },
  unverified: { soft: 'fill-unverified/20', medium: 'fill-unverified/30', strong: 'fill-unverified/40' },
} as const

function bandClass(muted: boolean, weight: 'soft' | 'medium' | 'strong'): string {
  return BAND_CLASS[muted ? 'unverified' : 'computed'][weight]
}

/** A ring of equal segments — pasaran, dina, wuku (as weeks), and one lunar
    month (as days). `names` may be all-empty strings for a tick-only ring.

    Segment boundaries are prada (ochre): cycle marks, per PRD §9. The
    current segment's band is indigo, because where today sits is computed. */
function EqualRing({
  radius,
  names,
  rotationDeg,
  currentIndex,
  labelled,
  fontSize = 12,
  emphasiseCurrent = false,
  muted = false,
  markStart = false,
  highlighted = false,
}: {
  radius: number
  names: ReadonlyArray<string>
  rotationDeg: number
  currentIndex: number
  labelled: boolean
  fontSize?: number
  emphasiseCurrent?: boolean
  muted?: boolean
  /** Mark segment 0 (month start) with a small dot outside the ring, fixed
      in the ring's own rotating frame rather than at the current position.
      Today always sits under the ray by construction, so it cannot show a
      divergence on its own — where two reckonings' month starts land
      relative to the same fixed ray is what does (DESIGN-REWORK §3.3, the
      two lunar rings on /pelajari/kurup/). */
  markStart?: boolean
  /** A derivation drawer for this ring is open. Strengthens the current
      band and the guide circle, so the reader can find the ring the numbers
      above belong to without reading five of them. */
  highlighted?: boolean
}) {
  const step = 360 / names.length

  // A labelled ring centres each name on its own angle; a tick ring runs
  // each segment from its tick to the next.
  const bandStart = labelled ? (currentIndex - 0.5) * step : currentIndex * step
  const half = labelled ? BAND : 7

  return (
    <g>
      <circle
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={highlighted ? 1.2 : 0.8}
        className={highlighted ? 'text-indigo/60' : 'text-ink/15'}
      />
      <g style={{ transform: `rotate(${rotationDeg}deg)`, transition: TURN }}>
        {labelled || emphasiseCurrent || highlighted ? (
          <path
            d={segmentBand(radius - half, radius + half, bandStart, bandStart + step)}
            className={bandClass(muted, highlighted ? 'strong' : labelled ? 'soft' : 'medium')}
          />
        ) : null}

        {markStart ? (
          <circle cx={0} cy={-(radius + 11)} r={3.4} className={muted ? 'fill-unverified' : 'fill-ochre'} />
        ) : null}

        {names.map((name, i) => {
          if (!labelled) {
            const major = i % 5 === 0
            const [x1, y1] = pointOn(radius - (major ? 7 : 5), i * step)
            const [x2, y2] = pointOn(radius + (major ? 7 : 5), i * step)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={major ? 1.3 : 0.8}
                className={muted ? 'text-unverified/70' : major ? 'text-ochre' : 'text-ochre/50'}
              />
            )
          }
          const [x, y] = pointOn(radius, i * step)
          const [t1x, t1y] = pointOn(radius - BAND, (i - 0.5) * step)
          const [t2x, t2y] = pointOn(radius + BAND, (i - 0.5) * step)
          const isCurrent = i === currentIndex
          return (
            <g key={name}>
              <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} strokeWidth={1} className="stroke-ochre/60" />
              <g transform={`translate(${x} ${y})`}>
                {/* Counter-rotated on the same transition as the ring, so a
                    name stays upright the whole way round, not just at rest. */}
                <text
                  style={{ transform: `rotate(${-rotationDeg}deg)`, transition: TURN }}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  strokeWidth={isCurrent ? 5 : 0}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  className={
                    isCurrent
                      ? 'fill-indigo stroke-paper font-ui font-semibold'
                      : 'fill-ink/65 font-ui'
                  }
                >
                  {name}
                </text>
              </g>
            </g>
          )
        })}
      </g>
    </g>
  )
}

/** The mangsa ring — twelve segments, unequal by design. Kasa and Kapitu are
    not drawn the same size, because they are not the same length
    (DESIGN-REWORK §3.1: "the drawing lies about the one property that makes
    pranata mangsa interesting" if they are). */
function UnequalRing({
  radius,
  entries,
  cumulative,
  total,
  rotationDeg,
  currentEntry,
  labelled,
}: {
  radius: number
  entries: ReadonlyArray<Mangsa>
  cumulative: ReadonlyArray<number>
  total: number
  rotationDeg: number
  currentEntry: Mangsa
  labelled: boolean
}) {
  const degFor = (days: number) => (days / total) * 360

  return (
    <g>
      <g style={{ transform: `rotate(${rotationDeg}deg)`, transition: TURN }}>
        {entries.map((entry, i) => {
          const startDeg = degFor(cumulative[i] ?? 0)
          const endDeg = degFor((cumulative[i] ?? 0) + entry.lengthDays)
          const midDeg = (startDeg + endDeg) / 2
          const isCurrent = entry.index === currentEntry.index
          const [x, y] = pointOn(radius + 17, midDeg)

          return (
            <g key={entry.index}>
              <path
                d={segmentBand(radius - (isCurrent ? 5 : 3.5), radius + (isCurrent ? 5 : 3.5), startDeg + 0.7, endDeg - 0.7)}
                className={isCurrent ? 'fill-indigo' : 'fill-ink/20'}
              />
              {labelled ? (
                <g transform={`translate(${x} ${y})`}>
                  <text
                    style={{ transform: `rotate(${-rotationDeg}deg)`, transition: TURN }}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    className={isCurrent ? 'fill-indigo font-ui font-semibold' : 'fill-ink/55 font-ui'}
                  >
                    {entry.name}
                  </text>
                </g>
              ) : null}
            </g>
          )
        })}
      </g>
    </g>
  )
}

function cumulativeBefore(entries: ReadonlyArray<Mangsa>): ReadonlyArray<number> {
  const result: number[] = []
  let sum = 0
  for (const entry of entries) {
    result.push(sum)
    sum += entry.lengthDays
  }
  return result
}

function mangsaDayOffset(result: MangsaResult, cumulative: ReadonlyArray<number>): number {
  return (cumulative[result.entry.index - 1] ?? 0) + (result.dayWithin - 1)
}
