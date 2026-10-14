import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import LangBadge from '@/components/LangBadge'
import { ErrorBlock } from '@/components/StateBlocks'
import { Flame, Play, Star } from '@/components/Icons'
import { getHotMovies, voteOf } from '@/lib/api'
import { imageUrl } from '@/lib/images'
import { movieTypeLabel } from '@/lib/labels'
import type { Movie } from '@/types'

export const revalidate = 180

export const metadata: Metadata = {
  title: 'Phim HOT — đang được xem nhiều',
  description:
    'Danh sách phim đang nóng trên CoiHong: xếp theo điểm đánh giá, phim đang cập nhật tập và phim được đánh giá cao.',
  alternates: { canonical: '/hot' },
}

export default async function HotPage() {
  const movies = await getHotMovies(24).catch(() => null)
  const [first, second, third] = movies ?? []
  const rest = (movies ?? []).slice(3)

  return (
    <div className="container-app pb-20 pt-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/" className="transition-colors hover:text-ink">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-ink-muted">Phim HOT</span>
      </nav>

      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          <Flame className="h-7 w-7 text-accent" />
          Phim đang nóng
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Xếp theo điểm đánh giá, ưu tiên phim đang cập nhật tập và phim có nhiều bản ngôn ngữ.
          Khác với <Link href="/top-phim" className="text-accent hover:text-accent-soft">Top phim</Link>{' '}
          — bảng đó xếp theo thứ tự phim được thêm vào.
        </p>
      </header>

      {movies === null ? (
        <ErrorBlock message="Không tải được danh sách phim HOT." />
      ) : movies.length === 0 ? (
        <ErrorBlock message="Chưa có đủ dữ liệu để xếp hạng." />
      ) : (
        <div className="space-y-10">
          <section className="grid gap-4 sm:grid-cols-3">
            <HotCard movie={first} rank={1} className="sm:order-2" />
            <HotCard movie={second} rank={2} className="sm:order-3" />
            <HotCard movie={third} rank={3} className="sm:order-1" />
          </section>

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-[19px] font-semibold tracking-tight text-ink">
                Xếp hạng 4 → {movies.length}
              </h2>
              <ol className="space-y-2">
                {rest.map((m, i) => (
                  <HotRow key={m.slug} movie={m} rank={i + 4} />
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

const RANK_COLOR = [
  'text-amber-300',
  'text-slate-200',
  'text-orange-300',
  'text-ink-muted',
]

function HotCard({ movie, rank, className = '' }: { movie?: Movie; rank: number; className?: string }) {
  if (!movie) return <div className={`skeleton h-[210px] ${className}`} />
  const first = rank === 1

  return (
    <Link
      href={`/phim/${movie.slug}`}
      className={`group relative overflow-hidden rounded-card p-4 transition-all duration-300 hover:-translate-y-1 ${
        first
          ? 'bg-gradient-to-b from-amber-400/[0.16] to-transparent ring-1 ring-amber-400/35'
          : 'ring-1 ring-white/[0.07]'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`font-display text-[62px] leading-[0.85] ${RANK_COLOR[rank - 1] ?? RANK_COLOR[3]}`}>
          {rank}
        </span>
        {first && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-amber-200">
            Nóng nhất
          </span>
        )}
      </div>

      <div className="mt-3.5 flex gap-3.5">
        <Poster movie={movie} w={74} h={112} className="sm:w-[86px] sm:h-[130px]" />
        <div className="min-w-0 flex-1">
          <span className="line-clamp-2-safe text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft">
            {movie.name}
          </span>
          <span className="mt-1 block text-[11.5px] text-ink-faint">
            {[movieTypeLabel(movie.type), movie.year].filter(Boolean).join(' · ')}
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {voteOf(movie) > 0 && (
              <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-ink-muted">
                <Star className="h-3 w-3 text-amber-400" />
                {voteOf(movie).toFixed(1)}
              </span>
            )}
            {movie.episode_current && (
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
                {movie.episode_current}
              </span>
            )}
          </div>
          <LangBadge movie={movie} size="sm" className="mt-1.5" />
        </div>
      </div>
    </Link>
  )
}

function HotRow({ movie, rank }: { movie: Movie; rank: number }) {
  const vote = voteOf(movie)

  return (
    <li>
      <Link
        href={`/phim/${movie.slug}`}
        className="group flex items-center gap-3 rounded-card border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.055] sm:gap-4 sm:p-3"
      >
        <span className="w-[42px] shrink-0 text-center font-display text-[36px] leading-none text-ink-muted sm:text-[40px]">
          {rank}
        </span>

        <Poster movie={movie} w={52} h={70} className="sm:w-[62px] sm:h-[84px]" />

        <div className="min-w-0 flex-1">
          <span className="line-clamp-2-safe text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent-soft sm:text-[15px]">
            {movie.name}
          </span>
          <span className="mt-0.5 line-clamp-1-safe block text-[11px] text-ink-faint">
            {[movieTypeLabel(movie.type), movie.year, movie.quality].filter(Boolean).join(' · ')}
          </span>
          <div className="mt-1.5 hidden flex-wrap items-center gap-2 sm:flex">
            {vote > 0 && (
              <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-faint">
                <Star className="h-3 w-3 text-amber-400" />
                {vote.toFixed(1)}
              </span>
            )}
            {movie.episode_current && (
              <span className="text-[11.5px] text-accent/90">{movie.episode_current}</span>
            )}
            <LangBadge movie={movie} size="sm" />
          </div>
        </div>

        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-ink-faint transition-all group-hover:border-accent/40 group-hover:bg-accent group-hover:text-white">
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        </span>
      </Link>
    </li>
  )
}

function Poster({
  movie,
  w,
  h,
  className = '',
}: {
  movie: Movie
  w: number
  h: number
  className?: string
}) {
  const src = imageUrl(movie.poster_url) || imageUrl(movie.thumb_url)
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 ${className}`}
      style={{ width: w, height: h }}
    >
      {src && <Image src={src} alt={movie.name} fill sizes={`${w}px`} className="object-cover" />}
    </div>
  )
}
