/**
 * Day numbers on a logarithmic axis, for counts whose spacing spans three
 * orders of magnitude — the third day and the thousandth. On a linear axis
 * the first four slametan sit on top of one another at the left edge; on a
 * logarithmic one each is legible, and the axis says which scale it is.
 *
 * Dates only (CLAUDE.md invariant 13): one colour for a computed point, no
 * emphasis on any one of them, nothing ranked.
 */
export function LogAxis({
  points,
  caption,
}: {
  points: ReadonlyArray<{ key: string; day: number; label: string }>
  /** Names the scale, so the spacing is not misread as linear. */
  caption: string
}) {
  const max = Math.max(10, ...points.map((p) => p.day))
  const decades = Math.ceil(Math.log10(max))
  const top = 10 ** decades
  const x = (day: number) => 24 + (Math.log10(Math.max(1, day)) / Math.log10(top)) * 852
  const ticks = Array.from({ length: decades + 1 }, (_, i) => 10 ** i)

  return (
    <figure className="overflow-x-auto">
      <svg viewBox="0 0 900 118" className="block w-full min-w-[36rem]" role="img" aria-label={caption}>
        <line x1={24} x2={876} y1={66} y2={66} strokeWidth={1.5} className="stroke-ink/30" />
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1={72} y2={78} className="stroke-ink/30" />
            <text x={x(tick)} y={94} textAnchor="middle" fontSize={11} className="fill-ink/60 font-mono">
              {tick}
            </text>
          </g>
        ))}
        {points.map((point, i) => (
          <g key={point.key}>
            <line x1={x(point.day)} x2={x(point.day)} y1={i % 2 ? 44 : 30} y2={60} className="stroke-ink/20" />
            <circle cx={x(point.day)} cy={66} r={5} strokeWidth={2} className="fill-paper stroke-indigo" />
            <text
              x={x(point.day)}
              y={i % 2 ? 38 : 24}
              textAnchor="middle"
              fontSize={12}
              className="fill-ink font-ui"
            >
              {point.label}
            </text>
          </g>
        ))}
        <text x={876} y={114} textAnchor="end" fontSize={11} className="fill-ink/60 font-ui">
          {caption}
        </text>
      </svg>
    </figure>
  )
}
