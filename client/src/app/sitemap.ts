import type { MetadataRoute } from 'next'
import { getCategories, getCountries } from '@/lib/api'
import { resolveSiteUrl } from '@/lib/site'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = await resolveSiteUrl()
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/hot`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/top-phim`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/danh-sach`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE}/the-loai`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/quoc-gia`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/tim-kiem`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/gioi-thieu`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/lien-he`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/chinh-sach-rieng-tu`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const types = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows'].map((t) => ({
    url: `${BASE}/danh-sach/${t}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const [categories, countries] = await Promise.all([getCategories(), getCountries()])

  return [
    ...staticPages,
    ...types,
    ...categories.map((c) => ({
      url: `${BASE}/the-loai/${c.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...countries.map((c) => ({
      url: `${BASE}/quoc-gia/${c.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]
}