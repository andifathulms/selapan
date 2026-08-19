'use client'

import { useRef } from 'react'
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
export function CycleWheels({ trace }: { trace: CalendarTrace }) {
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

  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <svg viewBox="-240 -240 480 480" role="img" className="w-full">
        <title>{`${titleParts.join(', ')} — ${trace.weton.name}, neptu ${trace.weton.neptu.total}`}</title>

        <EqualRing
          radius={54}
          names={PASARAN as unknown as ReadonlyArray<string>}
          rotationDeg={pasaranRotation}
          currentIndex={trace.pasaran.index}
          labelled
        />
        <EqualRing
          radius={92}
          names={DINA as unknown as ReadonlyArray<string>}
          rotationDeg={dinaRotation}
          currentIndex={trace.dina.index}
          labelled
        />
        <EqualRing
          radius={130}
          names={WUKU as unknown as ReadonlyArray<string>}
          rotationDeg={wukuRotation}
          currentIndex={trace.wuku.index}
          labelled={false}
          emphasiseCurrent
        />

        {mangsa.type === 'ok' ? (
          <UnequalRing
            radius={168}
            entries={table}
            cumulative={mangsaCumulative}
            total={totalMangsaDays}
            rotationDeg={mangsaRotation}
            currentEntry={mangsa.value.entry}
          />
        ) : null}

        {lunar.type === 'ok' ? (
          <EqualRing
            radius={206}
            names={Array.from({ length: lunar.value.monthLength }, () => '')}
            rotationDeg={lunarRotation}
            currentIndex={lunar.value.day - 1}
            labelled={false}
            emphasiseCurrent
            muted={lunarUnverified}
            markStart
          />
        ) : null}

        {/* The marker is fixed; the rings move beneath it (PRD §9). One ray,
            crossing every ring drawn, with a mark at each crossing — that is
            today, one position in every cycle at once (DESIGN-REWORK §3.2).
            Computed, so indigo — never rubric (CLAUDE.md invariant 12). */}
        <g className="text-indigo">
          <line x1={0} y1={-228} x2={0} y2={-38} stroke="currentColor" strokeWidth={1} />
          <polygon points="0,-32 -5,-42 5,-42" fill="currentColor" />
          {[54, 92, 130, mangsa.type === 'ok' ? 168 : null, lunar.type === 'ok' ? 206 : null]
            .filter((r): r is number => r !== null)
            .map((r) => (
              <circle key={r} cx={0} cy={-r} r={2.4} fill="currentColor" />
            ))}
        </g>

        <text y={-2} textAnchor="middle" fontSize={15} className="fill-indigo font-mono">
          {trace.weton.name}
        </text>
        <text y={18} textAnchor="middle" fontSize={11} className="fill-ink/55 font-mono">
          {`neptu ${trace.weton.neptu.total}`}
        </text>
      </svg>
    </figure>
  )
}

/** Degrees from twelve o'clock, clockwise, for a point at `deg` on `radius`. */
function pointOn(radius: number, deg: number): readonly [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [radius * Math.cos(rad), radius * Math.sin(rad)]
}

function arcPath(radius: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = pointOn(radius, startDeg)
  const [x2, y2] = pointOn(radius, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
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

/** A ring of equal segments — pasaran, dina, wuku (as weeks), and one lunar
    month (as days). `names` may be all-empty strings for a tick-only ring. */
function EqualRing({
  radius,
  names,
  rotationDeg,
  currentIndex,
  labelled,
  emphasiseCurrent = false,
  muted = false,
  markStart = false,
}: {
  radius: number
  names: ReadonlyArray<string>
  rotationDeg: number
  currentIndex: number
  labelled: boolean
  emphasiseCurrent?: boolean
  muted?: boolean
  /** Mark segment 0 (month start) with a small dot outside the ring, fixed
      in the ring's own rotating frame rather than at the current position.
      Today always sits under the ray by construction, so it cannot show a
      divergence on its own — where two reckonings' month starts land
      relative to the same fixed ray is what does (DESIGN-REWORK §3.3, the
      two lunar rings on /kurup/). */
  markStart?: boolean
}) {
  const step = 360 / names.length
  const colour = muted ? 'text-unverified' : 'text-indigo'

  return (
    <g>
      <circle r={radius} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-ink/20" />
      <g
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition: 'transform 420ms cubic-bezier(0.33, 0, 0.2, 1)',
        }}
      >
        {emphasiseCurrent ? (
          <path
            d={segmentBand(radius - 6, radius + 6, currentIndex * step, (currentIndex + 1) * step)}
            className={muted ? 'fill-unverified/30' : 'fill-indigo/15'}
          />
        ) : null}

        {markStart ? (
          <circle cx={0} cy={-(radius + 6)} r={2.2} className={muted ? 'fill-unverified' : 'fill-indigo'} />
        ) : null}

        {names.map((name, i) => {
          const long = !labelled && i % Math.max(1, Math.round(names.length / 30)) === 0
          if (!labelled) {
            const inner = radius - (long ? 7 : 3)
            const [x1, y1] = pointOn(inner, i * step)
            const [x2, y2] = pointOn(radius, i * step)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={long ? 1 : 0.5}
                className={i === currentIndex ? colour : muted ? 'text-unverified/80' : 'text-indigo/40'}
              />
            )
          }
          const [x, y] = pointOn(radius, i * step)
          const isCurrent = i === currentIndex
          return (
            <g key={name} transform={`translate(${x} ${y})`}>
              <text
                transform={`rotate(${-rotationDeg})`}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                className={isCurrent ? `fill-indigo font-ui font-semibold` : 'fill-ink/70 font-ui'}
              >
                {name}
              </text>
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
}: {
  radius: number
  entries: ReadonlyArray<Mangsa>
  cumulative: ReadonlyArray<number>
  total: number
  rotationDeg: number
  currentEntry: Mangsa
}) {
  const degFor = (days: number) => (days / total) * 360

  return (
    <g>
      <circle r={radius} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-ink/20" />
      <g
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition: 'transform 420ms cubic-bezier(0.33, 0, 0.2, 1)',
        }}
      >
        {entries.map((entry, i) => {
          const startDeg = degFor(cumulative[i] ?? 0)
          const endDeg = degFor((cumulative[i] ?? 0) + entry.lengthDays)
          const midDeg = (startDeg + endDeg) / 2
          const isCurrent = entry.index === currentEntry.index
          const [x, y] = pointOn(radius, midDeg)

          return (
            <g key={entry.index}>
              {isCurrent ? (
                <path
                  d={segmentBand(radius - 7, radius + 7, startDeg, endDeg)}
                  className="fill-indigo/15"
                />
              ) : null}
              <line
                {...lineAt(radius, startDeg)}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-indigo/40"
              />
              <g transform={`translate(${x} ${y})`}>
                <text
                  transform={`rotate(${-rotationDeg})`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8.5}
                  className={isCurrent ? 'fill-indigo font-ui font-semibold' : 'fill-ink/60 font-ui'}
                >
                  {entry.name}
                </text>
              </g>
            </g>
          )
        })}
      </g>
    </g>
  )
}

function lineAt(radius: number, deg: number) {
  const [x1, y1] = pointOn(radius - 5, deg)
  const [x2, y2] = pointOn(radius, deg)
  return { x1, y1, x2, y2 }
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
