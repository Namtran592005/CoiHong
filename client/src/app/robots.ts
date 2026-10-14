import type { MetadataRoute } from 'next'
import { resolveSiteUrl } from '@/lib/site'

export const revalidate = 86400

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await resolveSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',

        disallow: ['/xem-phim/', '/tim-kiem', '/api/', '/quan-tainh'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}