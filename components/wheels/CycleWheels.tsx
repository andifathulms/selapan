'use client'

import { useRef } from 'react'
import { DINA, PASARAN, WUKU } from '@/lib/cycles'
import type { CalendarTrace } from '@/lib/trace'

/**
 * Three concentric rings, one per cycle, turning together.
 *
 * Stepping a day advances every ring by exactly one position, and the rings
 * visibly return to alignment after 35 days and again after 210. This is the
 * one orchestrated moment in the app (PRD §9): watching the realignment
 * teaches the modular arithmetic better than any explanation of it.
 *
 * Rotation is continuous rather than derived from the index. Driving it from
 * the index alone would make the ring spin backwards through a whole turn
 * every time the cycle wrapped, which would say something false about how
 * the cycle moves.
 */
export function CycleWheels({ trace }: { trace: CalendarTrace }) {
  const origin = useRef<{ jdn: number; pasaran: number; dina: number; wuku: number }>({
    jdn: trace.jdn,
    pasaran: trace.pasaran.index,
    dina: trace.dina.index,
    wuku: trace.wuku.index * 7 + (trace.dayInWuku - 1),
  })

  const elapsed = trace.jdn - origin.current.jdn
  const rings = [
    {
      key: 'pasaran',
      radius: 62,
      names: PASARAN as ReadonlyArray<string>,
      position: origin.current.pasaran + elapsed,
      labelled: true,
    },
    {
      key: 'dina',
      radius: 108,
      names: DINA as ReadonlyArray<string>,
      position: origin.current.dina + elapsed,
      labelled: true,
    },
    {
      key: 'wuku',
      radius: 156,
      // 210 positions, one per day of the pawukon cycle. Thirty names would
      // not fit legibly, so the ring shows the ticks and the centre names the
      // wuku the marker is pointing at.
      names: Array.from({ length: WUKU.length * 7 }, () => ''),
      position: origin.current.wuku + elapsed,
      labelled: false,
    },
  ]

  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <svg viewBox="-190 -190 380 380" role="img" className="w-full">
        <title>
          {`Cincin pasaran, dina, dan wuku pada ${trace.weton.name}, wuku ${trace.wuku.name}`}
        </title>

        {rings.map((ring) => {
          const step = 360 / ring.names.length
          const rotation = -ring.position * step
          return (
            <g key={ring.key}>
              <circle
                r={ring.radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-ink/25"
              />
              <g
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 420ms cubic-bezier(0.33, 0, 0.2, 1)',
                }}
              >
                {ring.names.map((name, i) => {
                  const angle = ((i * step - 90) * Math.PI) / 180
                  const x = ring.radius * Math.cos(angle)
                  const y = ring.radius * Math.sin(angle)
                  if (!ring.labelled) {
                    // Tick marks: every seventh is longer, marking a wuku edge.
                    const long = i % 7 === 0
                    const inner = ring.radius - (long ? 9 : 4)
                    return (
                      <line
                        key={i}
                        x1={inner * Math.cos(angle)}
                        y1={inner * Math.sin(angle)}
                        x2={x}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth={long ? 1 : 0.5}
                        className={long ? 'text-ochre' : 'text-ink/30'}
                      />
                    )
                  }
                  return (
                    <g key={name} transform={`translate(${x} ${y})`}>
                      {/* Counter-rotated so the names stay readable as the ring turns. */}
                      <text
                        transform={`rotate(${-rotation})`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        className="fill-ink/70 font-ui"
                      >
                        {name}
                      </text>
                    </g>
                  )
                })}
              </g>
            </g>
          )
        })}

        {/* The marker is fixed; the rings move beneath it. */}
        <g className="text-ochre">
          <line x1={0} y1={-178} x2={0} y2={-38} stroke="currentColor" strokeWidth={1} />
          <polygon points="0,-32 -5,-42 5,-42" fill="currentColor" />
        </g>

        <text
          y={4}
          textAnchor="middle"
          fontSize={15}
          className="fill-indigo font-mono"
        >
          {trace.weton.name}
        </text>
        <text y={24} textAnchor="middle" fontSize={11} className="fill-ink/55 font-ui">
          {`wuku ${trace.wuku.name} · ${trace.dayInWuku}/7`}
        </text>
      </svg>
    </figure>
  )
}
