/**
 * The Selapan mark — "empat gelang", four concentric rings for the four
 * cycles that run at once.
 *
 * Inlined rather than loaded from `public/`: it is six shapes, it must be
 * crisp at 28px, and inlining costs no request and can shift no layout. The
 * geometry and the fills are the master at `exports/svg/selapan-icon-ink.svg`
 * — the brand set is not committed, so change them together.
 *
 * The colours are the brand's own, which sit close to but not on the site
 * tokens. They are left exact: this is a piece of artwork with its own
 * palette, not a UI element borrowing the computed-value indigo (PRD §9).
 */
export function SelapanMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
      className="shrink-0"
    >
      <rect x="0" y="0" width="100" height="100" rx="22" fill="#2B2620" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#F1EBDC55" strokeWidth="1.6" />
      {/* Gold marks the ring belonging to the dial itself, and nothing else. */}
      <circle cx="50" cy="50" r="30" fill="none" stroke="#B98A34" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="#F1EBDC55" strokeWidth="1.6" />
      <circle cx="50" cy="50" r="10" fill="#1E3A6B" />
    </svg>
  )
}
