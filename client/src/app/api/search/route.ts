import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { searchMovies } from '@/lib/api'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit') ?? '6') || 6, 1), 12)

  if (q.length < 2) return NextResponse.json({ items: [] })

  try {
    const data = await searchMovies(q, { limit })
    return NextResponse.json(
      {
        items: data.items.map((m) => ({
          name: m.name,
          slug: m.slug,
          year: m.year,
          poster_url: m.poster_url,
        })),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600' } },
    )
  } catch {
    return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'public, s-maxage=30' } })
  }
}
