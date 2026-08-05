'use client'

import { formatGregorian, parseGregorian, type GregorianDate } from '@/lib/jdn'
import type { DayBoundary, KurupReckoning, TraceOptions } from '@/lib/trace'
import { SUNSET_HOUR } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

export function DateControls({
  date,
  options,
  t,
  onDate,
  onStep,
  onToday,
  onReckoning,
  onDayBoundary,
  onHour,
  showOptions = true,
}: {
  date: GregorianDate
  options: TraceOptions
  t: Dictionary
  onDate: (date: GregorianDate) => void
  onStep: (delta: number) => void
  onToday: () => void
  onReckoning?: (value: KurupReckoning) => void
  onDayBoundary?: (value: DayBoundary) => void
  onHour?: (value: number) => void
  showOptions?: boolean
}) {
  return (
    <div className="border-y hairline py-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="rule-label">{t.common.date}</span>
          <input
            type="date"
            value={formatGregorian(date)}
            onChange={(e) => {
              const parsed = parseGregorian(e.target.value)
              if (parsed) onDate(parsed)
            }}
            className="border hairline bg-transparent px-3 py-1.5 font-mono text-base tabular-nums"
          />
        </label>

        <div className="flex gap-1">
          <StepButton label={t.common.previousDay} onClick={() => onStep(-1)}>
            −1
          </StepButton>
          <StepButton label={t.common.nextDay} onClick={() => onStep(1)}>
            +1
          </StepButton>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="border hairline px-3 py-1.5 font-ui text-sm hover:border-indigo hover:text-indigo"
        >
          {t.common.today}
        </button>
      </div>

      {showOptions && onReckoning && onDayBoundary ? (
        <div className="mt-4 flex flex-wrap items-end gap-6">
          <Choice
            label={t.common.reckoning}
            value={options.reckoning}
            options={[
              { value: 'chronological', label: 'Asapon · kronologis' },
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
            <label className="flex flex-col gap-1">
              <span className="rule-label">{t.common.hour}</span>
              <input
                type="number"
                min={0}
                max={23}
                value={options.hour ?? 0}
                onChange={(e) => onHour(Number(e.target.value))}
                className="w-20 border hairline bg-transparent px-3 py-1.5 font-mono tabular-nums"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function StepButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="border hairline px-3 py-1.5 font-mono text-sm hover:border-indigo hover:text-indigo"
    >
      {children}
    </button>
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
    <fieldset className="flex flex-col gap-1">
      <legend className="rule-label">{label}</legend>
      <div className="flex">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={[
              'border px-3 py-1.5 font-ui text-sm -ml-px first:ml-0',
              value === option.value
                ? 'border-indigo bg-indigo text-paper'
                : 'hairline hover:border-indigo hover:text-indigo',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
