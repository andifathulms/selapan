'use client'

import { jdnToGregorian } from '@/lib/jdn'
import { traceFor, type CalendarTrace, type TraceOptions } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

const SPAN = 5

/**
 * Eleven days, reckoned twice. Where Aboge and Asapon part, the month's
 * first day sits one column apart in the two rows — the divergence as a
 * shape, at equal weight for both, with neither marked as the correct one
 * (CLAUDE.md invariant 6). A real table, so the same comparison reads row
 * by row to a screen reader.
 */
export function ReckoningStrip({ jdn, options, t }: { jdn: number; options: TraceOptions; t: Dictionary }) {
  const days = Array.from({ length: SPAN * 2 + 1 }, (_, i) => jdn - SPAN + i)
  const rows: ReadonlyArray<{ name: string; mnemonic: string; traces: ReadonlyArray<CalendarTrace> }> = [
    {
      name: 'Asapon',
      mnemonic: 'Alip Selasa Pon',
      traces: days.map((d) => traceFor(d, { ...options, reckoning: 'chronological' })),
    },
    {
      name: 'Aboge',
      mnemonic: 'Alip Rebo Wage',
      traces: days.map((d) => traceFor(d, { ...options, reckoning: 'aboge' })),
    },
  ]

  return (
    <section>
      <h2 className="font-ui text-section font-semibold">{t.kurup.stripTitle}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[46rem] table-fixed border-separate border-spacing-1">
          <thead>
            <tr>
              <td className="w-32" />
              {days.map((d) => {
                const g = jdnToGregorian(d)
                return (
                  <th
                    key={d}
                    scope="col"
                    className={[
                      'pb-1 text-center font-mono text-xs font-normal',
                      d === jdn ? 'text-ink' : 'text-ink/60',
                    ].join(' ')}
                  >
                    {g.day} {t.common.months[g.month - 1]?.slice(0, 3)}
                    <span className="block font-ui text-[0.65rem]">{traceFor(d).pasaran.name}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row" className="pr-2 text-left align-middle font-ui text-sm font-semibold">
                  {row.name}
                  <span className="block text-xs font-normal text-ink/60">{row.mnemonic}</span>
                </th>
                {row.traces.map((trace) => {
                  const lunar = trace.lunar.type === 'ok' ? trace.lunar.value : null
                  const starts = lunar?.day === 1
                  return (
                    <td
                      key={trace.jdn}
                      className={[
                        'rounded-control border px-1 py-2 text-center',
                        starts ? 'border-ochre bg-ochre/10' : 'border-ink/10 bg-paper-raised',
                        trace.jdn === jdn ? 'ring-2 ring-ink' : '',
                      ].join(' ')}
                    >
                      {lunar ? (
                        <>
                          <span
                            className={[
                              'block font-mono text-base leading-tight',
                              lunar.derivation.status === 'unverified' ? 'text-unverified' : 'text-indigo',
                            ].join(' ')}
                          >
                            {lunar.day}
                          </span>
                          <span className="block truncate font-ui text-[0.6rem] text-ink/60">{lunar.monthName}</span>
                        </>
                      ) : (
                        <span className="font-ui text-xs text-unverified">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-ink/65">{t.kurup.stripLegend}</p>
    </section>
  )
}
