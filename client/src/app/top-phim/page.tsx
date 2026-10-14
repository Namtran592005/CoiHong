import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ErrorBlock } from '@/components/StateBlocks'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import { listMovies } from '@/lib/api'
import { ArrowLeft, Captions, ChevronRight, Clock, Flame, Star } from '@/components/Icons'
import type { Movie } from '@/types'

export const revalidate = 180

export const metadata: Metadata = {
  title: 'Top phim đang hot',
  description: 'Bảng xếp hạng phim được thêm nhiều gần đây nhất trên CoiHong, cập nhật liên tục.',
  alternates: { canonical: '/top-phim' },
}

const REQUEST = { limit: 24, sort_field: '_id', sort_type: 'desc' } as const

function rankStyle(rank: number) {
  if (rank === 1) return 'text-amber-300'
  if (rank === 2) return 'text-slate-200'
  if (rank === 3) return 'text-orange-300'
  return 'text-ink-faint'
}

function statusLabel(m: Movie): string | null {
  const cur = String(m.episode_current ?? '').trim()
  if (!cur) return null
  if (/hoàn tất|hoan tat/i.test(cur)) return cur
  if (/full/i.test(cur)) return 'Full'
  if (/tập/i.test(cur)) return cur
  return null
}

export default async function TopPage() {
  const data = await listMovies({ ...REQUEST }).catch(() => null)
  const movies = data?.items ?? []
  const [first, second, third] = movies
  const rest = movies.slice(3)

  return (
    <div className="container-app pb-20 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/" className="transition-colors hover:text-ink">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-ink-muted">Top phim</span>
      </nav>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            <Flame className="h-7 w-7 text-accent" />
            Top phim đang hot
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            Bảng xếp hạng {movies.length} phim được thêm vào gần đây nhất, cập nhật liên tục mỗi khi
            có phim mới.
          </p>
        </div>
        <Link href="/danh-sach" className="btn-ghost shrink-0 !py-2">
          <ArrowLeft className="h-4 w-4" />
          Xem tất cả phim
        </Link>
      </header>

      {data === null ? (
        <ErrorBlock message="Không tải được bảng xếp hạng." />
      ) : movies.length === 0 ? (
        <ErrorBlock message="Bảng xếp hạng đang trống." />
      ) : (
        <div className="space-y-10">
          {movies.length > 0 && (
            <section className="grid gap-4 sm:grid-cols-3">
              <PodiumCard movie={first} rank={1} className="sm:order-2" />
              <PodiumCard movie={second} rank={2} className="sm:order-3" />
              <PodiumCard movie={third} rank={3} className="sm:order-1" />
            </section>
          )}

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-[19px] font-semibold tracking-tight text-ink">
                Xếp hạng 4 → {movies.length}
              </h2>
              <ol className="space-y-2.5">
                {rest.map((m, i) => (
                  <RankRow key={m.slug} movie={m} rank={i + 4} />
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function PodiumCard({ movie, rank, className = '' }: { movie?: Movie; rank: number; className?: string }) {
  if (!movie) return <div className={`skeleton aspect-[3/4] ${className}`} />
  const first = rank === 1

  return (
    <Link
      href={`/phim/${movie.slug}`}
      className={`group relative overflow-hidden rounded-card p-4 transition-all duration-300 hover:-translate-y-1 ${
        first
          ? 'bg-gradient-to-b from-amber-400/[0.14] to-transparent ring-1 ring-amber-400/30'
          : 'ring-1 ring-white/[0.07]'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`font-display text-[62px] leading-[0.85] ${rankStyle(rank)}`}>{rank}</span>
        {first && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-200">
            Hạng nhất
          </span>
        )}
      </div>

      <div className="mt-3.5 flex gap-3.5">
        <div className="relative h-[112px] w-[74px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 sm:h-[130px] sm:w-[86px]">
          <Image
            src={imageUrl(movie.poster_url) || imageUrl(movie.thumb_url)}
            alt={movie.name}
            fill
            sizes="86px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="line-clamp-2-safe text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft">
            {movie.name}
          </span>
          {movie.origin_name && (
            <span className="line-clamp-1-safe mt-1 text-[11.5px] text-ink-faint">{movie.origin_name}</span>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            {statusLabel(movie) && (
              <span className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-ink-muted">
                {statusLabel(movie)}
              </span>
            )}
            <span className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-ink-muted">
              {movieTypeLabel(movie.type)}
            </span>
            {movie.lang_key?.includes('vs') && (
              <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-ink-muted">
                <Captions className="h-3 w-3" />
                Vietsub
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function RankRow({ movie, rank }: { movie: Movie; rank: number }) {
  const badge = statusLabel(movie)

  return (
    <li>
      <Link
        href={`/phim/${movie.slug}`}
        className="group flex items-center gap-3 rounded-card border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.055] sm:gap-4 sm:p-3"
      >
        <span className="w-[42px] shrink-0 text-center font-display text-[36px] leading-none text-ink-muted sm:text-[40px]">
          {rank}
        </span>

        <div className="relative h-[70px] w-[52px] shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:h-[84px] sm:w-[62px]">
          <Image
            src={imageUrl(movie.poster_url) || imageUrl(movie.thumb_url)}
            alt={movie.name}
            fill
            sizes="62px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="line-clamp-2-safe text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft sm:text-[15px]">
            {movie.name}
          </span>
          {movie.origin_name && (
            <span className="line-clamp-1-safe mt-0.5 text-[11px] text-ink-faint">{movie.origin_name}</span>
          )}
          <div className="mt-1.5 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-faint sm:flex">
            {movie.year && <span>{movie.year}</span>}
            {movieTypeLabel(movie.type) && <span>{movieTypeLabel(movie.type)}</span>}
            {badge && <span>{badge}</span>}
            {movie.imdb?.vote_average ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400" />
                {movie.imdb.vote_average.toFixed(1)}
              </span>
            ) : null}
            {movie.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {movie.time}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" />
      </Link>
    </li>
  )
}
