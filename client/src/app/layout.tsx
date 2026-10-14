import type { Metadata, Viewport } from 'next'
import Layout from '@/components/Layout'
import { getCategories, getCountries, getYears } from '@/lib/api'
import { siteUrlForMetadata } from '@/lib/site'
import './globals.css'

const siteUrl = siteUrlForMetadata()

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: 'CoiHong — xem phim online miễn phí',
    template: '%s — CoiHong',
  },
  description:
    'CoiHong — xem phim online miễn phí, giao diện tối. Phim lẻ, phim bộ, hoạt hình, TV Show cập nhật hằng ngày.',
  applicationName: 'CoiHong',
  manifest: '/site.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'CoiHong',
    title: 'CoiHong — xem phim miễn phí',
    description: 'Xem phim online miễn phí, chất lượng cao, cập nhật mới nhất.',
    images: [{ url: '/og.webp', width: 1200, height: 630, alt: 'CoiHong' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoiHong — xem phim miễn phí',
    description: 'Xem phim online miễn phí, chất lượng cao, cập nhật mới nhất.',
    images: ['/og.webp'],
  },
  icons: {
    icon: [
      { url: '/icon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-180.webp', sizes: '180x180', type: 'image/webp' },
    ],
    apple: '/icon-180.png',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#08080b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
}

const splashGuard = `try{if(sessionStorage.getItem('coihong.splash.v2')==='done'){document.documentElement.dataset.splash='done'}}catch(e){}`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, countries, years] = await Promise.all([
    getCategories(),
    getCountries(),
    getYears(),
  ])

  const currentYear = new Date().getFullYear()

  return (
    <html lang="vi" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashGuard }} />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/files/inter-vietnamese-wght-normal.woff2"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://phimimg.com" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body>
        <Layout
          categories={categories}
          countries={countries}
          years={years}
          currentYear={currentYear}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
