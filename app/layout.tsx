import type { Metadata, Viewport } from 'next'
import { Petrona, Schibsted_Grotesk, Sometype_Mono, Young_Serif } from 'next/font/google'
import { DARK, LIGHT } from '@/theme/palette'
import './globals.css'

/*
 * Young Serif for the figure a reader came for — a weton, a mangsa — and for
 * page titles: the weight and warmth of an almanac heading, and it holds up
 * at 90px. Petrona for prose — a text serif with the warmth of a printed
 * almanac. Sometype Mono for the arithmetic trace, for its typewriter
 * quality: it should read as working-out, not as the answer. Schibsted
 * Grotesk for controls and labels, crisp at small sizes.
 * Self-hosted by next/font, so the site stays fully offline after first load.
 */
const youngSerif = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

const petrona = Petrona({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-prose',
  display: 'swap',
})

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
  display: 'swap',
})

const sometype = Sometype_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

// Same source as next.config.js, deliberately (PRD §12).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

// The origin only. Next resolves file-based metadata against this and adds
// the basePath itself, so putting the basePath here too yields
// /selapan/selapan/opengraph-image.png.
const SITE_ORIGIN = 'https://andifathulms.github.io'
const SITE_URL = `${SITE_ORIGIN}${basePath}/`

// What a reader sees in a search result or a shared link is often the only
// description they get, so it says what the thing does before it says what is
// interesting about how it does it.
const TITLE = 'Selapan — kalender Jawa dan weton'
const DESCRIPTION =
  'Cari weton, tanggal Jawa, wuku, dan mangsa untuk tanggal mana pun — lengkap dengan hitungannya, sumbernya, dan perbedaan Aboge dan Asapon.'

/*
 * Icons and the social image are file-based: `app/icon.svg`,
 * `app/apple-icon.png`, and `app/opengraph-image.png` (from the brand set in
 * `exports/`, which is not committed). Next emits the link tags and the
 * basePath itself, which is why they are not written out by hand here.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'Selapan',
  // The manifest is a static file under public/ rather than an app/manifest.ts,
  // because Next emits the generated one's <link> without the basePath and
  // that resolves off-site on Pages. It carries the basePath in its own paths,
  // so it is the second place after next.config.js that must change if the
  // repository is ever renamed.
  manifest: `${basePath}/manifest.webmanifest`,
  openGraph: {
    type: 'website',
    siteName: 'Selapan',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'id_ID',
    alternateLocale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

// A phone's browser chrome takes the page's own paper, light or dark, so the
// page runs edge to edge rather than under a bar of a different colour.
// Same values as `paper` in theme/palette.ts.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: LIGHT.paper },
    { media: '(prefers-color-scheme: dark)', color: DARK.paper },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${youngSerif.variable} ${petrona.variable} ${schibsted.variable} ${sometype.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}
