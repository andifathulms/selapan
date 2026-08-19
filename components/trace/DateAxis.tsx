/**
 * A horizontal axis with points placed in true day-proportion, rather than a
 * table's flat list of numbers. Unevenness — or evenness — is seen, not
 * read (DESIGN-REWORK §5). Dates only: no colour beyond indigo for a
 * computed point and `unverified` for one that could not be, no
 * interpretation, nothing ranked (CLAUDE.md invariant 13 for the slametan
 * caller in particular).
 */
// Points close enough together to collide are common here on purpose — a
// death seven days ago and one three days ago sit almost on top of each
// other on a 0–1000 axis, and that clustering is itself the content. Rather
// than truncate or rotate the label into something harder to read, a label
// too close to the last one shown is dropped; its dot stays. The dots
// clustering together says "these are close" at least as clearly as
// overlapping text would.
const MIN_LABEL_GAP_PCT = 7

export function DateAxis({
  points,
  max,
}: {
  points: ReadonlyArray<{ key: string; days: number; label: string; ok: boolean }>
  max: number
}) {
  const sorted = [...points].sort((a, b) => a.days - b.days)
  let lastLabelPct = -Infinity

  return (
    <div className="relative mt-3 h-9 w-full" aria-hidden="true">
      <div className="absolute inset-x-0 top-1 h-px bg-ink/20" />
      {sorted.map((p) => {
        const pct = max > 0 ? Math.min(100, (p.days / max) * 100) : 0
        const showLabel = pct - lastLabelPct >= MIN_LABEL_GAP_PCT
        if (showLabel) lastLabelPct = pct

        return (
          <div
            key={p.key}
            className="absolute top-1 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${pct}%` }}
          >
            <span
              className={[
                'block h-1.5 w-1.5 -translate-y-1/2 rounded-full ring-2 ring-paper',
                p.ok ? 'bg-indigo' : 'bg-unverified',
              ].join(' ')}
            />
            {showLabel ? (
              <span className="mt-1.5 whitespace-nowrap font-mono text-[0.6rem] leading-none text-ink/55">
                {p.label}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
