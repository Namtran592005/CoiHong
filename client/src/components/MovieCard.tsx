import Link from 'next/link'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import type { Movie } from '@/types'
import Img from './Img'
import LangBadge from './LangBadge'
import PlayBadge from './PlayBadge'
import { Flame, TrendingUp } from './Icons'

interface Props {
  movie: Movie
  index?: number
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const year = movie.year ?? ''
  const type = movieTypeLabel(movie.type)
  const isSeries = movie.type === 'series' || movie.type === 'tvshows'
  const isHot = index === 0
  const isNew = !isHot && index === 1

  return (
    <Link
      href={`/phim/${movie.slug}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 11) * 35}ms` }}
    >
      <div className="relative overflow-hidden rounded-card shadow-glow transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        <Img
          src={imageUrl(movie.poster_url)}
          fallbackSrc={imageUrl(movie.thumb_url)}
          alt={movie.name}
          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 14vw"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <PlayBadge size="sm" />
          </span>
        </div>

        {isHot && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            <Flame className="h-3 w-3" />
            Hot
          </span>
        )}
        {isNew && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-sky-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            <TrendingUp className="h-3 w-3" />
            Mới
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {movie.quality && (
            <span className="rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink backdrop-blur-md">
              {movie.quality}
            </span>
          )}
          {isSeries && movie.episode_current && (
            <span className="rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-ink backdrop-blur-md">
              {movie.episode_current}
            </span>
          )}
        </div>

        <LangBadge movie={movie} className="absolute bottom-2 right-2" />
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="line-clamp-2-safe text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft">
          {movie.name}
        </h3>
        <p className="mt-1 truncate text-xs text-ink-faint">
          {[type, year].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}
