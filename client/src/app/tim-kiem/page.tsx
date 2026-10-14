import type { Metadata } from 'next'
import CardGrid from '@/components/CardGrid'
import PageBanner from '@/components/PageBanner'
import { Pagination, first } from '@/components/Browse'
import { ErrorBlock } from '@/components/StateBlocks'
import { searchMovies } from '@/lib/api'
import { Clapperboard, Search, Sparkles } from '@/components/Icons'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Tìm kiếm phim',
  description: 'Tìm phim theo tên phim, diễn viên, đạo diễn hoặc từ khóa.',
  alternates: { canonical: '/tim-kiem' },
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SUGGESTIONS = ['Viking', 'Hữu Nghị', 'One Piece', 'Naruto', 'Ma Thần', 'Bố Già']

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = first(sp.q).trim()
  const page = Math.max(1, Number(first(sp.page) || '1') || 1)

  const data = q ? await searchMovies(q, { page, limit: 24 }).catch(() => null) : null

  const totalPages = data?.pagination.totalPages ?? 1
  const total = data?.pagination.totalItems ?? 0

  const pageUrl = (p: number) => `/tim-kiem?q=${encodeURIComponent(q)}${p > 1 ? `&page=${p}` : ''}`

  return (
    <>
      <PageBanner
        eyebrow="Tra cứu nhanh"
        title={q ? 'Kết quả tìm kiếm' : 'Tìm kiếm phim'}
        icon={q ? Sparkles : Search}
        meta={
          q ? (
            data ? (
              <>
                <b className="font-semibold text-ink-muted">
                  {total.toLocaleString('vi-VN')}
                </b>{' '}
                kết quả cho “<b className="font-semibold text-ink">{q}</b>” · trang{' '}
                {page}/{totalPages}
              </>
            ) : null
          ) : (
            'Nhập tên phim, tên diễn viên hoặc đạo diễn để bắt đầu.'
          )
        }
      >
        <form
          action="/tim-kiem"
          method="get"
          className="flex w-full items-center gap-2 rounded-full border border-white/[0.1]
            bg-white/[0.06] p-1.5 pl-4 backdrop-blur-xl transition-colors
            focus-within:border-accent/60 focus-within:bg-white/[0.09] sm:w-[360px]"
        >
          <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Nhập tên phim…"
            aria-label="Tìm phim"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            aria-label="Tìm"
            title="Tìm"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white
              transition-transform hover:bg-accent-soft active:scale-95"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </PageBanner>

      <div className="container-app pb-20 pt-6">
        {!q && (
          <div className="relative overflow-hidden rounded-card border border-white/[0.07] bg-base-850/50 px-6 py-12 text-center backdrop-blur-xl sm:px-10 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-64 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(234,179,8,0.16) 0%, rgba(234,179,8,0) 70%)',
              }}
            />

            <div className="relative">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Clapperboard className="h-6 w-6" aria-hidden />
              </div>

              <p className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                Bắt đầu bằng một từ khóa
              </p>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-faint">
                Tìm theo tên phim, tên diễn viên hoặc đạo diễn — kết quả hiện ngay
                khi bấm Enter.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <a
                    key={s}
                    href={`/tim-kiem?q=${encodeURIComponent(s)}`}
                    className="btn-ghost !min-h-[34px] !rounded-full !px-3.5 !py-1.5 !text-[13px]"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {q && data === null ? (
          <ErrorBlock message="Không tải được kết quả tìm kiếm." />
        ) : q ? (
          <CardGrid movies={data?.items ?? []} />
        ) : null}

        {q && <Pagination page={page} totalPages={totalPages} url={pageUrl} />}
      </div>
    </>
  )
}