import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),

  outputFileTracingExcludes: {
    '*': ['node_modules/typescript/**'],
  },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/webp'],
    deviceSizes: [384, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*.(svg|png|jpg|jpeg|webp|avif|ico|woff2)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },

  async redirects() {
    return [{ source: '/phim/:slug/xem', destination: '/phim/:slug', permanent: true }]
  },
}

export default nextConfig