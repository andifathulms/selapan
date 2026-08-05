/**
 * The masthead of a section: the same rule, the same measure, the same
 * spacing on every page. A reader should be able to tell where a page's
 * explanation ends and its apparatus begins without reading either.
 */
export function PageHeader({
  title,
  intro,
  aside,
}: {
  title: string
  intro: string
  aside?: React.ReactNode
}) {
  return (
    <header className="border-b hairline pb-6">
      <h1 className="font-prose text-title">{title}</h1>
      <p className="lede mt-3 max-w-measure">{intro}</p>
      {aside ? <div className="mt-4">{aside}</div> : null}
    </header>
  )
}
