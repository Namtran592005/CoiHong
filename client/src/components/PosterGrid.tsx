import Link from 'next/link'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import type { Movie } from '@/types'
import Img from './Img'
import LangBadge from './LangBadge'
import PlayBadge from './PlayBadge'
import ScrollButtons from './ScrollButtons'
import { ChevronRight } from './Icons'

interface Props {
  title: string
  movies: Movie[]
  href?: string

  note?: string

  railId: string
}

export default function PosterGrid({ title, movies, href, note, railId }: Props) {
  if (!movies.length) return null

  return (
    <section className="group/rail relative">
      <header className="mb-3.5 flex items-end justify-between gap-4 px-0.5">
        <div className="min-w-0">
          <h2 className="truncate text-[19px] font-semibold tracking-tight text-ink">{title}</h2>
          {note && <p className="mt-0.5 truncate text-xs text-ink-faint">{note}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="group/link inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:border-accent/40 hover:text-accent"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </header>

      <div className="relative">
        <div
          id={railId}
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-1 pb-2"
        >
          {movies.map((m, i) => (
            <Link
              key={m.slug}
              href={`/phim/${m.slug}`}
              className="group relative block w-[220px] shrink-0 snap-start overflow-hidden rounded-card ring-1 ring-white/[0.07] transition-all duration-300 hover:ring-accent/40 sm:w-[248px]"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <Img
                src={imageUrl(m.thumb_url)}
                fallbackSrc={imageUrl(m.poster_url)}
                alt={m.name}
                ratio="16 / 10"
                sizes="(max-width: 640px) 55vw, 248px"
              />

              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/45" />

              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <PlayBadge />
                </span>
              </span>

              <span className="absolute inset-x-0 bottom-0 p-3 transition-opacity duration-300 group-hover:opacity-0">
                <span className="line-clamp-2-safe block text-[14px] font-semibold leading-snug text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.9)] transition-colors group-hover:text-accent-soft">
                  {m.name}
                </span>
                <span className="mt-1 block text-[11px] text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
                  {[movieTypeLabel(m.type), m.year].filter(Boolean).join(' · ')}
                </span>
                <LangBadge movie={m} size="sm" className="mt-1.5" />
              </span>
            </Link>
          ))}
        </div>
        <ScrollButtons targetId={railId} />
      </div>
    </section>
  )
}
