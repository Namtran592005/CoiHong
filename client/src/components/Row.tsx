import Link from 'next/link'
import MovieCard from './MovieCard'
import ScrollButtons from './ScrollButtons'
import { ChevronRight } from './Icons'
import type { Movie } from '@/types'

interface Props {
  title: string
  movies: Movie[]
  href?: string
  note?: string

  railId: string
}

export default function Row({ title, movies, href, note, railId }: Props) {
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
            className="group/link inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-faint transition-colors hover:text-accent-soft"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        )}
      </header>

      <div className="relative">
        <div
          id={railId}
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
        >
          {movies.map((movie, i) => (
            <div key={movie.slug} className="w-[140px] shrink-0 snap-start sm:w-[160px]">
              <MovieCard movie={movie} index={i} />
            </div>
          ))}
        </div>
        <ScrollButtons targetId={railId} />
      </div>
    </section>
  )
}
