import type { CalendarTrace } from '@/lib/trace'

/**
 * Neptu as something counted: the dina's value in dots, the pasaran's in
 * dots, and the sum. A count, not a grade — nothing here is ranked or
 * coloured by size (CLAUDE.md invariant 11). The arithmetic is also the
 * accessible name, so a screen reader hears the sum rather than dots.
 */
export function NeptuPips({ trace, size = 'md' }: { trace: CalendarTrace; size?: 'sm' | 'md' }) {
  const { dina, pasaran, total } = trace.weton.neptu
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <p
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono"
      aria-label={`${trace.dina.name} ${dina} + ${trace.pasaran.name} ${pasaran} = ${total}`}
    >
      <Dots count={dina} dot={dot} />
      <span aria-hidden="true" className="text-sm text-ink/60">
        <span className="hidden sm:inline">
          {trace.dina.name} {dina}{' '}
        </span>
        +
        <span className="hidden sm:inline">
          {' '}
          {trace.pasaran.name} {pasaran}
        </span>
      </span>
      <Dots count={pasaran} dot={dot} />
      <span aria-hidden="true" className="text-ink/60">=</span>
      <span aria-hidden="true" className={size === 'sm' ? 'text-xl text-indigo' : 'text-3xl text-indigo'}>
        {total}
      </span>
    </p>
  )
}

function Dots({ count, dot }: { count: number; dot: string }) {
  return (
    <span aria-hidden="true" className="inline-flex gap-1 rounded-full bg-indigo/10 px-2 py-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`${dot} rounded-full bg-indigo`} />
      ))}
    </span>
  )
}
