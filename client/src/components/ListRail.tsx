import Link from 'next/link'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import type { Movie } from '@/types'
import Img from './Img'
import LangBadge from './LangBadge'
import { ChevronRight } from './Icons'

interface Props {
  title: string
  movies: Movie[]
  href?: string
  note?: string
}

export default function ListRail({ title, movies, href, note }: Props) {
  if (!movies.length) return null

  return (
    <section>
      <header className="mb-3.5 flex items-end justify-between gap-4 px-0.5">
        <div className="min-w-0">
          <h2 className="truncate text-[19px] font-semibold tracking-tight text-ink">{title}</h2>
          {note && <p className="mt-0.5 truncate text-xs text-ink-faint">{note}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-faint transition-colors hover:text-accent-soft"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {movies.map((m, i) => (
          <li key={m.slug}>
            <Link
              href={`/phim/${m.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 transition-colors hover:border-white/[0.15] hover:bg-white/[0.055]"
            >
              <div className="relative h-[58px] w-[96px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.08]">
                <Img
                  src={imageUrl(m.thumb_url)}
                  fallbackSrc={imageUrl(m.poster_url)}
                  alt={m.name}
                  ratio="16 / 10"
                  sizes="96px"
                />
                <span className="pointer-events-none absolute inset-0 bg-black/15 transition-opacity duration-300 group-hover:opacity-0" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="line-clamp-1-safe block text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft">
                  {m.name}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span className="truncate">
                    {[movieTypeLabel(m.type), m.year].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {m.episode_current && (
                    <span className="truncate text-[10.5px] font-medium text-accent/90">
                      {m.episode_current}
                    </span>
                  )}
                  <LangBadge movie={m} size="sm" />
                </div>
              </div>

              <span
                className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
