import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Backdrop, { Grain } from '@/components/Backdrop'
import MovieCard from '@/components/MovieCard'
import SaveButton from '@/components/SaveButton'
import ScrollButtons from '@/components/ScrollButtons'
import TopMovies from '@/components/TopMovies'
import { ChevronRight, Clapperboard, Play, Star, Users } from '@/components/Icons'
import { getMovie, getMovieKeywords, getMoviePeoples, listByCategory, listMovies } from '@/lib/api'
import { imageUrl, personImage } from '@/lib/images'
import { movieStatusLabel, movieTypeLabel, stripHtml } from '@/lib/labels'
import type { Movie } from '@/types'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const movie = await getMovie(slug)
    const desc =
      stripHtml(movie.content).slice(0, 155) ||
      `Xem ${movie.name} trên CoiHong — miễn phí, cập nhật mới nhất.`
    return {
      title: movie.name,
      description: desc,
      alternates: { canonical: `/phim/${slug}` },
      openGraph: {
        type: 'video.movie',
        title: `${movie.name} — CoiHong`,
        description: desc,
        images: movie.poster_url
          ? [{ url: imageUrl(movie.poster_url), alt: movie.name }]
          : undefined,
      },
    }
  } catch {
    return { title: 'Không tìm thấy phim', robots: { index: false, follow: true } }
  }
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params

  const movie = await getMovie(slug).catch(() => null)
  if (!movie) notFound()

  const data = movie
  const cat = data.category?.[0]?.slug

  const [peoples, keywords, top, related] = await Promise.all([
    getMoviePeoples(slug),
    getMovieKeywords(slug),
    listMovies({ limit: 10, sort_field: '_id', sort_type: 'desc' }).catch(() => null),
    cat
      ? listByCategory(cat, { limit: 14, sort_field: 'modified.time' })
          .then((r) => r.items.filter((m) => m.slug !== slug))
          .catch(() => [])
      : Promise.resolve([]),
  ])

  const servers = data.episodes ?? []
  const firstEpisode = servers.find((s) => s.server_data?.length)?.server_data[0]
  const totalEpisodes = servers.reduce((sum, s) => sum + (s.server_data?.length ?? 0), 0)

  const meta = [
    data.quality,
    data.lang,
    movieTypeLabel(data.type),
    movieStatusLabel(data.status),
    data.year?.toString(),
    data.time,
  ].filter(Boolean) as string[]

  return (
    <div className="pb-16">
      <div className="relative">
        <Backdrop src={imageUrl(data.thumb_url)} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/80 to-base-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-base-950 via-base-950/45 to-transparent" />
        <Grain soft />

        <div className="container-app relative pb-8 pt-20 sm:pb-10 sm:pt-32">
          <nav
            aria-label="Breadcrumb"
            className="no-scrollbar -mx-1 mb-5 flex items-center gap-1 overflow-x-auto px-1 pb-1
              text-[11.5px] text-ink-faint sm:text-xs"
          >
            <Link href="/" className="shrink-0 transition-colors hover:text-ink">
              Trang chủ
            </Link>
            <Sep />
            {data.category?.[0] && (
              <>
                <Link href={`/the-loai/${data.category[0].slug}`} className="shrink-0 transition-colors hover:text-ink">
                  {data.category[0].name}
                </Link>
                <Sep />
              </>
            )}
            {data.country?.[0] && (
              <>
                <Link href={`/quoc-gia/${data.country[0].slug}`} className="shrink-0 transition-colors hover:text-ink">
                  {data.country[0].name}
                </Link>
                <Sep />
              </>
            )}
            <span aria-current="page" className="shrink-0 whitespace-nowrap text-ink-muted">
              {data.name}
            </span>
          </nav>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative h-[160px] w-28 shrink-0 overflow-hidden rounded-card shadow-lift ring-1 ring-white/10 sm:h-[264px] sm:w-44">
              <Poster movie={data} priority />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-title text-balance pt-0.5 text-[28px] font-semibold uppercase leading-[1.3] tracking-tight text-ink sm:text-[36px] lg:text-[48px]">
                {data.name}
              </h1>
              {data.origin_name && (
                <p className="mt-1.5 hidden text-sm text-ink-muted sm:block">{data.origin_name}</p>
              )}

              {meta.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                  {meta.map((m) => (
                    <span
                      key={m}
                      className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-ink-muted"
                    >
                      {m}
                    </span>
                  ))}
                  {data.imdb?.vote_average ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-ink-muted">
                      <Star className="h-3 w-3 text-amber-400" />
                      {data.imdb.vote_average.toFixed(1)}
                    </span>
                  ) : null}
                  {totalEpisodes > 0 && (
                    <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-ink-muted">
                      {totalEpisodes} tập
                    </span>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {firstEpisode ? (
                  <Link href={`/xem-phim/${slug}`} className="btn-primary !px-6 !py-3 !text-[15px]">
                    <Play className="h-4 w-4" fill="currentColor" />
                    Xem ngay
                    {data.type === 'series' || data.type === 'tvshows' ? ' tập 1' : ''}
                  </Link>
                ) : (
                  <span className="btn-ghost cursor-not-allowed opacity-60">Chưa có nguồn phát</span>
                )}

                <SaveButton slug={data.slug} name={data.name} poster={imageUrl(data.poster_url)} />

                {data.trailer_url && (
                  <a
                    href={data.trailer_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-subtle !px-4 !py-3 !text-[15px]"
                  >
                    Trailer
                  </a>
                )}
              </div>

              {data.category?.length ? (
                <div className="mt-3.5 flex flex-wrap gap-1.5 sm:hidden">
                  {data.category.slice(0, 3).map((c) => (
                    <Link key={c._id ?? c.id ?? c.slug} href={`/the-loai/${c.slug}`} className="chip !py-1 !text-[11px]">
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {servers.length > 0 && servers[0].server_data.length > 1 && (
        <section className="container-app pt-8">
          <div className="card-surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/[0.12] text-accent">
                  <Clapperboard className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold leading-tight text-ink">Danh sách tập</h2>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">{servers[0].server_name}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[12px] font-medium text-ink-muted">
                {servers[0].server_data.length} tập
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {servers[0].server_data.map((ep, i) => (
                <Link
                  key={`${ep.slug ?? ep.name}-${i}`}
                  href={`/xem-phim/${slug}?tap=${i + 1}`}
                  title={`Xem ${ep.name}`}
                  aria-label={`Xem ${ep.name}`}
                  className={`group flex h-11 items-center justify-center rounded-xl border text-center transition-all duration-200 ${
                    i === 0
                      ? 'border-accent/40 bg-accent/[0.12] text-accent hover:bg-accent hover:text-base-950'
                      : 'border-white/[0.07] bg-white/[0.03] text-ink-muted hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/[0.12] hover:text-accent'
                  }`}
                >
                  <span className="font-title text-[15px] font-medium leading-none">
                    {episodeLabel(ep.name, i)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-app grid gap-8 pt-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-8">
          {data.content && (
            <section>
              <h2 className="mb-2 text-lg font-semibold tracking-tight text-ink">Nội dung</h2>
              <p className="line-clamp-5-safe text-sm leading-relaxed text-ink-muted">
                {stripHtml(data.content)}
              </p>
            </section>
          )}

          {!!peoples.people.length && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
                <Users className="h-4.5 w-4.5 text-accent" />
                Diễn viên & ê-kíp
              </h2>
              <PeopleRow
                people={peoples.people.map((p) => ({
                  id: p.tmdb_people_id,
                  name: p.name,
                  character: p.character,
                  profile: p.profile_path,
                }))}
              />
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-5">
          {data.director?.length ? <InfoList title="Đạo diễn" items={data.director} /> : null}
          {data.country?.length ? (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Quốc gia
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.country.map((c) => (
                  <Link key={c._id ?? c.id ?? c.slug} href={`/quoc-gia/${c.slug}`} className="chip">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {(data.category?.length || !!keywords.keywords.length) && (
        <section className="container-app space-y-2.5 pt-8">
          {!!data.category?.length && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Thể loại
              </span>
              {data.category.map((c) => (
                <Link key={c._id ?? c.id ?? c.slug} href={`/the-loai/${c.slug}`} className="chip !py-1">
                  {c.name}
                </Link>
              ))}
            </div>
          )}
          {!!keywords.keywords.length && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Từ khóa
              </span>
              {keywords.keywords.slice(0, 10).map((k, i) => {
                const label = k.name_vn || k.name
                if (!label) return null
                return (
                  <Link
                    key={`${k.tmdb_keyword_id ?? label}-${i}`}
                    href={`/tim-kiem?q=${encodeURIComponent(label)}`}
                    className="chip !py-1"
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {top && <section className="container-app pt-12"><TopMovies movies={top.items} href="/top-phim" /></section>}

      {related.length > 0 && (
        <section className="group/rail container-app relative pt-12">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-ink">Phim liên quan</h2>
          <div className="relative">
            <div
              id={`rail-related-${slug}`}
              className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2"
            >
              {related.slice(0, 14).map((m, i) => (
                <div key={m.slug} className="w-[140px] shrink-0 snap-start sm:w-[160px]">
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
            </div>
            <ScrollButtons targetId={`rail-related-${slug}`} />
          </div>
        </section>
      )}
    </div>
  )
}

function Sep() {
  return (
    <span aria-hidden className="shrink-0 select-none text-ink-faint/60">
      <ChevronRight className="h-3 w-3 sm:hidden" />
      <span className="hidden sm:inline">/</span>
    </span>
  )
}

function episodeLabel(name: string, index: number): string {
  const m = name.match(/(\d+)/)
  return m ? m[1] : String(index + 1)
}

function Poster({ movie, priority }: { movie: Movie; priority?: boolean }) {
  const poster = imageUrl(movie.poster_url)
  const thumb = imageUrl(movie.thumb_url)
  const src = poster || thumb
  if (!src) return null
  return (
    <Image
      src={src}
      alt={movie.name}
      fill
      priority={priority}
      sizes="(max-width: 640px) 112px, 176px"
      className="object-cover"
    />
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.map((name) => (
          <li key={name}>
            <Link
              href={`/tim-kiem?q=${encodeURIComponent(name)}`}
              className="text-ink-muted transition-colors hover:text-accent"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PeopleRow({
  people,
}: {
  people: { id: number; name: string; character?: string; profile?: string }[]
}) {
  return (
    <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
      {people.map((p) => {
        const src = personImage(p.profile, 'w185')
        return (
          <div key={p.id} className="w-[96px] shrink-0 snap-start text-center sm:w-[112px]">
            <div className="relative aspect-square overflow-hidden rounded-full ring-1 ring-white/10">
              {src ? (
                <Image
                  src={src}
                  alt={p.name}
                  fill
                  loading="lazy"
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 grid place-items-center bg-base-800 p-[18%]">
                  <Image
                    src="/logo-96.webp"
                    alt=""
                    aria-hidden
                    width={96}
                    height={96}
                    className="w-full object-contain opacity-30"
                  />
                </span>
              )}
            </div>
            <p className="line-clamp-2-safe mt-2 text-[11.5px] font-medium text-ink">{p.name}</p>
            {p.character && (
              <p className="line-clamp-2-safe mt-0.5 text-[10.5px] text-ink-faint">{p.character}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
