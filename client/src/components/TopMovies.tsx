import Link from 'next/link'
import { imageUrl } from '@/lib/images'
import type { Movie } from '@/types'
import Img from './Img'
import LangBadge from './LangBadge'
import PlayBadge from './PlayBadge'
import ScrollButtons from './ScrollButtons'
import { Flame } from './Icons'

interface Props {
  title?: string
  movies: Movie[]
  href?: string

  railId?: string
}

function statusBadge(m: Movie): string | null {
  const cur = String(m.episode_current ?? '').trim()
  if (!cur) return null
  if (/hoàn tất|hoan tat/i.test(cur)) return cur
  if (/full/i.test(cur)) return 'Full'
  if (/tập/i.test(cur)) return cur
  return null
}

export default function TopMovies({ title = 'Top 10 phim đang hot', movies, href, railId }: Props) {
  if (movies.length === 0) return null

  return (
    <section className="group/rail relative">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[19px] font-semibold tracking-tight text-ink">
          <Flame className="h-5 w-5 text-accent" />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-[13px] font-medium text-ink-faint transition-colors hover:text-accent-soft"
          >
            Xem thêm
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          id={railId}
          className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
        >
          {movies.map((m, i) => (
            <Link key={m.slug} href={`/phim/${m.slug}`} className="group w-[170px] shrink-0 snap-start sm:w-[196px]">
              <div className="relative overflow-hidden rounded-card ring-1 ring-white/[0.07] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
                <Img
                  src={imageUrl(m.poster_url)}
                  fallbackSrc={imageUrl(m.thumb_url)}
                  alt={m.name}
                  ratio="3 / 4"
                  sizes="(max-width: 640px) 42vw, 196px"
                />

                {statusBadge(m) && (
                  <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    {statusBadge(m)}
                  </span>
                )}

                <LangBadge movie={m} size="sm" className="absolute bottom-2 right-2" />

                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/45" />
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="scale-75 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <PlayBadge size="lg" />
                  </span>
                </span>
              </div>

              <div className="mt-2.5 flex min-h-[74px] items-start gap-1.5 sm:gap-2">
                <span className="shrink-0 font-display text-[42px] leading-[0.85] text-accent sm:text-[48px]">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <span className="line-clamp-2-safe text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft">
                    {m.name}
                  </span>
                  {m.origin_name && (
                    <span className="line-clamp-1-safe mt-0.5 text-[11.5px] text-ink-faint">
                      {m.origin_name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {railId && <ScrollButtons targetId={railId} />}
      </div>
    </section>
  )
}
