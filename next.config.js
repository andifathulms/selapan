/** @type {import('next').NextConfig} */

// basePath must match the repository name for GitHub Pages. PRD §12.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/selapan'

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

module.exports = nextConfig
