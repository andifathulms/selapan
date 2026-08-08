'use client'

import { daysInMonth, gregorianToJdn } from '@/lib/jdn'
import { DINA } from '@/lib/cycles'
import { traceFor, type TraceOptions } from '@/lib/trace'

/**
 * The layout of the wall calendar in every Indonesian home: the Gregorian day
 * large, the Javanese figures small beneath it (PRD §6.8). The difference is
 * that each figure here traces back to a cited anchor.
 *
 * Columns run Ahad first, as printed calendars do.
 */
const COLUMN_ORDER = [6, 0, 1, 2, 3, 4, 5] as const

export function MonthGrid({
  year,
  month,
  options,
  today,
  onSelect,
}: {
  year: number
  month: number
  options: TraceOptions
  today?: number
  onSelect?: (day: number) => void
}) {
  const firstJdn = gregorianToJdn({ year, month, day: 1 })
  const length = daysInMonth(year, month)
  const leading = COLUMN_ORDER.indexOf(
    traceFor(firstJdn, options).dina.index as (typeof COLUMN_ORDER)[number],
  )

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr>
          {COLUMN_ORDER.map((index) => (
            <th
              key={index}
              scope="col"
              className="border-b hairline pb-2 pl-1.5 text-left font-ui text-[0.62rem] uppercase tracking-wide text-ink/55 sm:text-[0.68rem] sm:tracking-widest"
            >
              {/* Seven full dina names do not fit across a 360px screen, and
                  they collide rather than truncate. Abbreviated there. */}
              <span className="sm:hidden">{DINA[index].slice(0, 3)}</span>
              <span className="hidden sm:inline">{DINA[index]}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: cells.length / 7 }, (_, week) => (
          <tr key={week}>
            {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
              if (day === null) return <td key={i} className="border-b hairline p-0" />
              const jdn = firstJdn + day - 1
              const trace = traceFor(jdn, options)
              const isToday = today === jdn
              // Naming the wuku in every cell would repeat it seven times;
              // it is printed on the day it changes, as almanacs do.
              const wukuStarts = trace.dayInWuku === 1

              return (
                <td key={i} className="border-b hairline p-0 align-top">
                  <button
                    type="button"
                    onClick={onSelect ? () => onSelect(day) : undefined}
                    aria-current={isToday ? 'date' : undefined}
                    className={[
                      // Tall enough to be a comfortable target on a phone, and
                      // tall enough that four small lines under the numeral do
                      // not crowd it.
                      'block h-full min-h-[4.75rem] w-full border-l-2 px-1.5 pb-3 pt-2 text-left transition-colors sm:min-h-[5.5rem]',
                      onSelect ? 'hover:bg-paper-raised/80' : 'cursor-default',
                      isToday ? 'border-l-indigo bg-paper-deep/70' : 'border-l-transparent',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'block font-mono text-lg tabular-nums',
                        isToday ? 'text-indigo' : 'text-ink',
                      ].join(' ')}
                    >
                      {day}
                    </span>
                    <span className="mt-0.5 block font-ui text-[0.65rem] leading-tight text-ink/60">
                      {trace.pasaran.name}
                    </span>
                    <span className="block font-mono text-[0.65rem] leading-tight text-indigo/80">
                      {trace.lunar.type === 'ok'
                        ? `${trace.lunar.value.day} ${trace.lunar.value.monthName}`
                        : '—'}
                    </span>
                    {wukuStarts ? (
                      <span
                        className={[
                          'mt-0.5 block truncate font-ui text-[0.6rem] uppercase leading-tight tracking-wide',
                          trace.wuku.derivation.status === 'unverified'
                            ? 'text-unverified'
                            : 'text-indigo/70',
                        ].join(' ')}
                      >
                        {trace.wuku.name}
                      </span>
                    ) : null}
                  </button>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
