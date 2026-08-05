import type { Metadata } from 'next'
import { Petrona, Karla, Sometype_Mono } from 'next/font/google'
import './globals.css'

/*
 * Petrona for prose — a text serif with the warmth of a printed almanac.
 * Sometype Mono for dates, numbers, and the arithmetic trace, for its
 * typewriter quality: it should read as working-out. Karla for controls.
 * Self-hosted by next/font, so the site stays fully offline after first load.
 */
const petrona = Petrona({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-prose',
  display: 'swap',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-ui',
  display: 'swap',
})

const sometype = Sometype_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  // What a reader sees in a search result or a shared link is often the only
  // description they get, so it says what the thing does before it says what
  // is interesting about how it does it.
  title: 'Selapan — kalender Jawa dan weton',
  description:
    'Cari weton, tanggal Jawa, wuku, dan mangsa untuk tanggal mana pun — lengkap dengan hitungannya, sumbernya, dan perbedaan Aboge dan Asapon.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${petrona.variable} ${karla.variable} ${sometype.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}
