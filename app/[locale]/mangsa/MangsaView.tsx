import type { GregorianDate } from '@/lib/jdn'
import { mangsaFor } from '@/lib/mangsa'
import type { CalendarTrace } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The current mangsa panel — a sweep of /ubah/'s instrument along the solar
 * year, not a page of its own (DESIGN-REWORK §4). The date and its trace
 * come from the caller, which already computed both; this renders them.
 */
export function MangsaView({ t, date, trace }: { t: Dictionary; date: GregorianDate; trace: CalendarTrace }) {
  const result = mangsaFor(date)

  return (
    <section className="panel p-6">
      <span className="rule-label">{t.mangsa.current}</span>
      {result.type === 'ok' ? (
        <>
          <p className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="computed text-figure">{result.value.entry.name}</span>
            <span className="font-mono text-lg text-ink/50">{result.value.entry.numeral}</span>
            <span className="font-mono text-sm text-ink/60">
              {result.value.dayWithin}/{result.value.entry.lengthDays}
            </span>
          </p>
          <div className="mt-5 max-w-measure">
            <span className="rule-label block">{t.mangsa.marker}</span>
            <p className="mt-1 text-ink/80">{result.value.entry.marker}</p>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 unverified-value text-figure">{t.common.refused}</p>
          <p className="mt-3 max-w-prose text-sm text-ink/70">{result.refusal.reason}</p>
        </>
      )}

      {/* The independence is the point: the same day, reckoned two ways
          that share nothing. */}
      <p className="mt-5 border-t hairline pt-4 font-mono text-sm text-ink/55">
        {trace.weton.name} · {trace.wuku.name}
        {trace.lunar.type === 'ok'
          ? ` · ${trace.lunar.value.day} ${trace.lunar.value.monthName} ${trace.lunar.value.yearAj}`
          : ''}
      </p>
    </section>
  )
}
