'use client'

import { daysInMonth, gregorianToJdn } from '@/lib/jdn'
import { DINA, PASARAN } from '@/lib/cycles'
import { traceFor, type TraceOptions } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The layout of the wall calendar in every Indonesian home: the Gregorian day
 * large, the Javanese figures small beneath it (PRD §6.8). The difference is
 * that each figure here traces back to a cited anchor.
 *
 * Columns run Ahad first, as printed calendars do. Printed calendars also
 * set Ahad in red; here red is reserved for primbon material (PRD §9), so
 * Ahad is not tinted.
 *
 * Each cell carries only what changes day to day: the pasaran, and the day
 * of the Javanese month. The month's name is printed on its first day and
 * the wuku's on its first, as almanacs do — and as the bands above the grid
 * show at a glance — so a 45px phone column never has to hold "Jumadilawal"
 * seven times.
 */
const COLUMN_ORDER = [6, 0, 1, 2, 3, 4, 5] as const

export function MonthGrid({
  year,
  month,
  options,
  today,
  selected,
  onSelect,
  t,
}: {
  year: number
  month: number
  options: TraceOptions
  /** Today's JDN, resolved in the UI, once known. */
  today?: number
  /** The day of this month being reckoned, if it is in this month. */
  selected?: number
  onSelect?: (day: number) => void
  t: Dictionary
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
    <table className="w-full table-fixed border-separate border-spacing-1 sm:border-spacing-1.5">
      <thead>
        <tr>
          {COLUMN_ORDER.map((index) => (
            <th
              key={index}
              scope="col"
              abbr={DINA[index]}
              className="pb-1 text-left font-ui text-[0.62rem] font-semibold uppercase tracking-wide text-ink/60 sm:text-[0.7rem] sm:tracking-widest"
            >
              {/* Seven full dina names do not fit across a 360px screen, and
                  they collide rather than truncate. Abbreviated there. */}
              <span className="sm:hidden" aria-hidden="true">
                {DINA[index].slice(0, 3)}
              </span>
              <span className="sr-only sm:not-sr-only">{DINA[index]}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: cells.length / 7 }, (_, week) => (
          <tr key={week}>
            {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
              if (day === null) return <td key={i} className="p-0" />
              const jdn = firstJdn + day - 1
              const trace = traceFor(jdn, options)
              const isToday = today === jdn
              const isSelected = selected === day
              const wukuStarts = trace.dayInWuku === 1
              const lunar = trace.lunar.type === 'ok' ? trace.lunar.value : null
              const lunarUnverified = lunar?.derivation.status === 'unverified'

              return (
                <td key={i} className="p-0 align-top">
                  <button
                    type="button"
                    onClick={onSelect ? () => onSelect(day) : undefined}
                    aria-current={isToday ? 'date' : undefined}
                    aria-pressed={onSelect ? isSelected : undefined}
                    aria-label={`${day} — ${trace.weton.name}${lunar ? `, ${lunar.day} ${lunar.monthName}` : ''}${isToday ? `, ${t.kalender.todayBadge}` : ''}`}
                    className={[
                      // Tall enough to be a comfortable target on a phone,
                      // and for three small lines under the numeral.
                      'flex h-full min-h-[4.6rem] w-full flex-col items-start gap-0.5 rounded-control border px-1.5 pb-2 pt-1.5 text-left transition-colors sm:min-h-[5.5rem] sm:px-2',
                      isSelected
                        ? 'border-ink bg-paper-raised ring-1 ring-ink'
                        : 'border-ink/10 bg-paper-raised/60 hover:border-ink/35',
                      onSelect ? '' : 'cursor-default',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'grid h-7 min-w-[1.75rem] place-items-center rounded-full font-mono text-base tabular-nums leading-none sm:text-lg',
                        isToday ? 'bg-ink px-1 text-paper' : 'text-ink',
                      ].join(' ')}
                    >
                      {day}
                    </span>
                    <span className="flex w-full flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-1">
                      <PasaranMark index={trace.pasaran.index} />
                      <span className="truncate font-ui text-[0.62rem] leading-tight text-ink/70 sm:text-[0.68rem]">
                        {trace.pasaran.name}
                      </span>
                    </span>
                    <span
                      className={[
                        'block w-full truncate font-mono text-[0.62rem] leading-tight sm:text-[0.68rem]',
                        lunarUnverified ? 'text-unverified' : 'text-indigo',
                        lunar?.day === 1 ? 'font-medium' : '',
                      ].join(' ')}
                    >
                      {lunar ? (lunar.day === 1 ? `1 ${lunar.monthName}` : lunar.day) : '—'}
                    </span>
                    {wukuStarts ? (
                      <span
                        className={[
                          'block w-full truncate font-ui text-[0.56rem] uppercase leading-tight tracking-wide sm:text-[0.6rem]',
                          trace.wuku.derivation.status === 'unverified' ? 'text-unverified' : 'text-indigo/80',
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

/**
 * The 5-cycle against the 7-cycle produces a diagonal stripe across a month
 * grid — the visual signature of the whole system, and the reason a 35-day
 * selapan exists. A dot's position among five marks that shifts is that
 * signature; the pasaran name beside it is what actually says which one it
 * is (DESIGN-REWORK §5 — never colour alone).
 */
function PasaranMark({ index }: { index: number }) {
  return (
    <span className="flex shrink-0 items-center gap-[2px]" aria-hidden="true">
      {PASARAN.map((_, i) => (
        <span
          key={i}
          className={['h-1 w-1 rounded-full', i === index ? 'bg-indigo' : 'bg-ink/20'].join(' ')}
        />
      ))}
    </span>
  )
}
