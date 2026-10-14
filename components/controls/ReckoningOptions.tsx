'use client'

import type { DayBoundary, KurupReckoning, TraceOptions } from '@/lib/trace'
import { SUNSET_HOUR } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The two real choices a reckoning has: which kurup rule, and when the day
 * turns. Both are stated, never assumed — Asapon and Aboge are both
 * first-class (CLAUDE.md invariant 6), and the day boundary defaults to
 * midnight explicitly (invariant 14).
 *
 * Segmented controls rather than a disclosure: two short choices are cheap
 * to show, and a reader following a shared Aboge link should see at once
 * that Aboge is what they are looking at.
 */
export function ReckoningOptions({
  options,
  t,
  onReckoning,
  onDayBoundary,
  onHour,
}: {
  options: TraceOptions
  t: Dictionary
  onReckoning: (value: KurupReckoning) => void
  onDayBoundary: (value: DayBoundary) => void
  onHour?: (value: number) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <Choice
        label={t.common.reckoning}
        value={options.reckoning}
        options={[
          { value: 'chronological', label: 'Asapon' },
          { value: 'aboge', label: 'Aboge' },
        ]}
        onChange={(v) => onReckoning(v as KurupReckoning)}
      />
      <Choice
        label={t.common.dayBoundary}
        value={options.dayBoundary}
        options={[
          { value: 'midnight', label: t.common.midnight },
          { value: 'sunset', label: `${t.common.sunset} (${SUNSET_HOUR}.00)` },
        ]}
        onChange={(v) => onDayBoundary(v as DayBoundary)}
      />
      {options.dayBoundary === 'sunset' && onHour ? (
        <label htmlFor="reckoning-hour" className="flex flex-col gap-1.5">
          <span className="rule-label">{t.common.hour}</span>
          <input
            id="reckoning-hour"
            type="number"
            min={0}
            max={23}
            value={options.hour ?? 0}
            onChange={(e) => onHour(Number(e.target.value))}
            className="field w-20"
          />
        </label>
      ) : null}
    </div>
  )
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="rule-label mb-1.5">{label}</legend>
      <div className="seg">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
