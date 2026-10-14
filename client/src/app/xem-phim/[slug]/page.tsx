import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import WatchClient from '@/components/WatchClient'
import { getMovie, getMovieKeywords } from '@/lib/api'
import { first } from '@/components/Browse'
import { movieTypeLabel } from '@/lib/labels'

export const revalidate = 1800

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const movie = await getMovie(slug)
    return {
      title: `Xem ${movie.name}`,
      description: `Xem ${movie.name} ${movieTypeLabel(movie.type)?.toLowerCase() ?? ''} trên CoiHong, miễn phí, không quảng cáo.`.trim(),
      alternates: { canonical: `/xem-phim/${slug}` },

      robots: { index: false, follow: true },
    }
  } catch {
    return { title: 'Không tìm thấy phim', robots: { index: false, follow: true } }
  }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const movie = await getMovie(slug).catch(() => null)
  if (!movie) notFound()

  const servers = movie.episodes ?? []
  const firstServerEps = servers[0]?.server_data?.length ?? 0
  const tap = Math.max(1, Number(first(sp.tap) || '1') || 1)
  const initialEpisode = Math.min(tap - 1, Math.max(firstServerEps - 1, 0))

  const [keywords] = await Promise.all([getMovieKeywords(slug)])

  return (
    <WatchClient
      movie={{
        slug: movie.slug,
        name: movie.name,
        poster_url: movie.poster_url,
        thumb_url: movie.thumb_url,
        category: movie.category,
      }}
      keywords={keywords.keywords}
      servers={servers}
      initialEpisode={initialEpisode}
    />
  )
}
