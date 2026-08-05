import type { Dictionary } from '@/lib/i18n'

/**
 * The key to the two-colour system, printed where a reader can find it.
 *
 * The palette carries the ethical distinction in PRD §4 — indigo for what is
 * arithmetic, rubric red for what is inherited — and a distinction the reader
 * has to infer is one they can get wrong. So it is stated, once, plainly.
 *
 * The rubric swatch appears even though the primbon layer has not shipped:
 * saying what the colour is reserved for is the point of reserving it.
 */
export function PaletteLegend({ t, className = '' }: { t: Dictionary; className?: string }) {
  const entries = [
    { color: 'bg-indigo', label: t.site.computed, note: t.site.computedNote },
    { color: 'bg-rubric', label: t.site.tradition, note: t.site.traditionNote },
    { color: 'bg-unverified', label: t.site.unverified, note: t.site.unverifiedNote },
  ]

  return (
    <ul className={`grid gap-x-8 gap-y-2 sm:grid-cols-3 ${className}`}>
      {entries.map((entry) => (
        <li key={entry.label} className="flex gap-2.5">
          <span aria-hidden className={`mt-[0.45em] h-2.5 w-2.5 shrink-0 ${entry.color}`} />
          <span>
            <span className="block font-ui text-xs uppercase tracking-widest text-ink/70">
              {entry.label}
            </span>
            <span className="mt-0.5 block text-sm leading-snug text-ink/60">{entry.note}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
