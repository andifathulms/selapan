'use client'

import { useState } from 'react'
import { formatGregorian, parseGregorian, type GregorianDate } from '@/lib/jdn'
import type { DayBoundary, KurupReckoning, TraceOptions } from '@/lib/trace'
import { SUNSET_HOUR } from '@/lib/trace'
import type { Dictionary } from '@/lib/i18n'

/**
 * The one control every page shares: which date is being reckoned.
 *
 * It sits in a panel rather than between two rules so that it reads as the
 * instrument and the page below it as the reading. The options — reckoning
 * and day boundary — are behind a disclosure, because they are real choices
 * that most readers should never have to make, and a row of four controls at
 * the top of every page taxes everyone for the sake of a few.
 */
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
  const canConfigure = showOptions && onReckoning !== undefined && onDayBoundary !== undefined
  // Non-default options are surfaced rather than hidden: a reader who follows
  // a shared link reckoned by Aboge must see that this is what they are
  // looking at.
  const [optionsOpen, setOptionsOpen] = useState(
    options.reckoning !== 'chronological' || options.dayBoundary !== 'midnight',
  )

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="rule-label">{t.common.date}</span>
          <input
            type="date"
            value={formatGregorian(date)}
            onChange={(e) => {
              const parsed = parseGregorian(e.target.value)
              if (parsed) onDate(parsed)
            }}
            className="field text-base"
          />
        </label>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label={t.common.previousDay}
            title={t.common.previousDay}
            className="btn w-11 font-mono"
          >
            −1
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label={t.common.nextDay}
            title={t.common.nextDay}
            className="btn w-11 font-mono"
          >
            +1
          </button>
          <button type="button" onClick={onToday} className="btn">
            {t.common.today}
          </button>
        </div>

        <div className="ml-auto flex flex-wrap gap-1.5">
          <CopyLinkButton t={t} />
          {canConfigure ? (
            <button
              type="button"
              onClick={() => setOptionsOpen((o) => !o)}
              aria-expanded={optionsOpen}
              className="btn"
            >
              <span aria-hidden className={optionsOpen ? 'rotate-90 transition-transform' : 'transition-transform'}>
                ›
              </span>
              {t.common.options}
            </button>
          ) : null}
        </div>
      </div>

      {canConfigure && optionsOpen ? (
        <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4 border-t hairline pt-4">
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
            <label className="flex flex-col gap-1.5">
              <span className="rule-label">{t.common.hour}</span>
              <input
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
      ) : null}
    </div>
  )
}

/**
 * There are no accounts and no server, so the URL hash is how a reckoning
 * travels between people (PRD §5). That only helps if the reader can tell
 * the link carries their state — hence a button rather than a note about it.
 */
function CopyLinkButton({ t }: { t: Dictionary }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(window.location.href).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        })
      }}
      className="btn"
    >
      {copied ? t.common.copied : t.common.copyLink}
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
    <fieldset className="flex flex-col gap-1.5">
      <legend className="rule-label">{label}</legend>
      <div className="flex">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={['btn -ml-px first:ml-0', value === option.value ? 'btn-solid' : ''].join(
              ' ',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
