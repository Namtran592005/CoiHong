import type { Metadata } from 'next'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import CardGrid from '@/components/CardGrid'
import PageBanner from '@/components/PageBanner'
import {
  FilterPanel,
  Pagination,
  activeFilterCount,
  buildListUrl,
  readFilters,
  toApiFilters,
} from '@/components/Browse'
import type { SearchParams } from '@/components/Browse'
import { ErrorBlock } from '@/components/StateBlocks'
import { getCategories, getCountries, getYears } from '@/lib/api'
import type { Category, Country, Paginated } from '@/types'

export const revalidate = 180



export default async function BrowseView({
  heading,
  base,
  description,
  searchParams,
  fetchList,
}: {
  heading: string
  base: string
  description?: string
  searchParams: Promise<SearchParams>
  fetchList: (f: ReturnType<typeof toApiFilters>) => Promise<Paginated>
}) {
  const sp = await searchParams
  const f = readFilters(sp)

  const [data, categories, countries, years] = await Promise.all([
    fetchList(toApiFilters(f)).catch(() => null),
    getCategories(),
    getCountries(),
    getYears(),
  ])

  const count = activeFilterCount(f)
  const { pagination } = data ?? { pagination: null }
  const totalPages = pagination?.totalPages ?? 1

  const urlFor = (page: number) =>
    buildListUrl(base, {
      page,
      category: f.category,
      'quoc-gia': f.country,
      nam: f.year,
      lang: f.sortLang,
      sort: f.sortField === 'modified.time' ? '' : f.sortField,
    })

  return (
    <>
      <PageBanner
        title={heading}
        meta={
          <>
            {pagination && (
              <span>
                <b className="font-semibold text-ink-muted">
                  {pagination.totalItems.toLocaleString('vi-VN')}
                </b>{' '}
                phim · trang {pagination.currentPage}/{pagination.totalPages}
              </span>
            )}
            {description && <span className="hidden sm:inline">{description}</span>}
          </>
        }
      />

      <div className="container-app pb-20 pt-5">
      <details open={count > 0} className="group mb-6 [&_summary::-webkit-details-marker]:hidden">
        <summary className="list-none">
          <span className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]">
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold tracking-tight text-ink">
                Bộ lọc
                {count > 0 && (
                  <span className="ml-2 align-middle text-[13px] font-normal text-ink-faint">
                    đang áp dụng {count} điều kiện
                  </span>
                )}
              </span>
              </span>

            <span className="flex shrink-0 items-center gap-2">
              {count > 0 && (
                <Link href={base} className="btn-ghost !px-3 !py-1.5">
                  Bỏ lọc
                </Link>
              )}
              <span
                className="btn-ghost !px-2.5 !py-2"
                title={count > 0 ? 'Thu gọn bộ lọc' : 'Mở bộ lọc'}
                aria-expanded={count > 0}
              >
                <SlidersHorizontal
                  className="h-4 w-4 transition-transform duration-300 group-open:rotate-90"
                  aria-hidden
                  strokeWidth={2}
                />
              </span>
            </span>
          </span>
        </summary>

        <div className="pt-5">
          <FilterPanel
            base={base}
            filters={f}
            categories={categories as Category[]}
            countries={countries as Country[]}
            years={years}
          />
        </div>
      </details>

      {data === null ? (
        <ErrorBlock message="Không tải được danh sách phim." />
      ) : (
        <>
          <CardGrid movies={data.items} />
          <Pagination page={f.page} totalPages={totalPages} url={urlFor} />
        </>
      )}
    </div>
    </>
  )
}

export async function browseMetadata(
  title: string,
  description: string,
  base: string,
  searchParams: Promise<SearchParams>,
): Promise<Metadata> {
  const f = readFilters(await searchParams)
  const qs = buildListUrl(base, { page: f.page > 1 ? f.page : undefined })
  return {
    title,
    description,
    alternates: { canonical: qs },


    robots: f.page > 1 ? { index: false, follow: true } : undefined,
  }
}
