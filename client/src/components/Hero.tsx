'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import type { Movie } from '@/types'
import Backdrop, { Grain } from './Backdrop'
import Img from './Img'
import { Info, Play, Star } from './Icons'

export default function Hero({ movies }: { movies: Movie[] }) {
  const [index, setIndex] = useState(0)

  const list = useMemo(() => movies.filter((m) => m.thumb_url).slice(0, 5), [movies])
  const featured = list[index] ?? list[0]

  useEffect(() => {
    if (list.length < 2) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % list.length), 8000)
    return () => window.clearInterval(t)
  }, [list.length])

  useEffect(() => {
    if (list.length < 2) return
    const neighbours = [
      list[(index + 1) % list.length],
      list[(index - 1 + list.length) % list.length],
    ]
    for (const m of neighbours) {
      if (!m.thumb_url) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = imageUrl(m.thumb_url)
    }
  }, [index, list])

  const activeRef = useRef(false)

  if (!featured) return null

  return (
    <section className="relative -mt-16 overflow-hidden">
      <div className="absolute inset-0">
        <Backdrop src={imageUrl(featured.thumb_url)} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/70 to-base-950/10" />
        <div className="absolute inset-0 hidden sm:block sm:bg-gradient-to-r sm:from-base-950 sm:via-base-950/55 sm:to-transparent" />
        <Grain />
      </div>

      <div className="container-app relative flex min-h-[54vh] flex-col justify-end pb-10 pt-24 sm:min-h-[68vh] sm:pb-12 sm:pt-32">
        <div key={featured.slug} className="max-w-xl animate-fade-up">
          <div className="mb-4 flex items-center gap-2 text-xs text-ink-faint">
            <span className="rounded-md bg-accent/85 px-2 py-0.5 font-semibold text-white">
              {movieTypeLabel(featured.type)}
            </span>
            {featured.quality && <span>{featured.quality}</span>}
            {featured.year && <span>{featured.year}</span>}
            {featured.lang && <span>{featured.lang}</span>}
          </div>

          <h1 className="font-title text-balance pt-1 text-[34px] font-semibold uppercase leading-[1.3] tracking-tight text-ink [text-shadow:0_2px_18px_rgba(0,0,0,0.75)] sm:text-[48px] lg:text-[60px]">
            {featured.name}
          </h1>
          {featured.origin_name && (
            <p className="mt-3 line-clamp-1-safe text-sm text-ink-muted">{featured.origin_name}</p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Link href={`/phim/${featured.slug}`} className="btn-primary !px-5 !py-2.5">
              <Play className="h-4 w-4" fill="currentColor" />
              Xem ngay
            </Link>
            <Link
              href={`/phim/${featured.slug}`}
              className="btn-ghost !px-4 !py-2.5 sm:!px-5"
              aria-label="Xem chi tiết phim"
            >
              <Info className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Chi tiết</span>
            </Link>
            {featured.imdb?.vote_average ? (
              <span className="ml-1 inline-flex items-center gap-1 text-xs text-ink-faint">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                {featured.imdb.vote_average.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>

        {list.length > 1 && (
          <div
            className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Chọn phim nổi bật"
          >
            {list.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={m.name}
                title={m.name}
                onClick={() => {
                  activeRef.current = true
                  setIndex(i)
                }}
                className={`group/thumb relative h-[52px] w-[84px] shrink-0 overflow-hidden rounded-xl
                  border-2 transition-all duration-300 sm:h-[60px] sm:w-[96px]
                  ${
                    i === index
                      ? 'border-accent opacity-100'
                      : 'border-white/15 opacity-55 hover:border-white/35 hover:opacity-90'
                  }`}
              >
                <Img
                  src={imageUrl(m.thumb_url || m.poster_url)}
                  alt=""
                  ratio={`${84} / ${52}`}
                  className="h-full w-full sm:!aspect-[96/60]"
                  sizes="96px"
                />
                <span className="pointer-events-none absolute inset-0 bg-black/15" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
