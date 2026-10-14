import Link from 'next/link'
import type { ListFilters, Paginated, SortLang } from '@/types'

export const TYPE_LABELS: Record<string, string> = {
  'phim-le': 'Phim lẻ',
  'phim-bo': 'Phim bộ',
  'hoat-hinh': 'Hoạt hình',
  'tv-shows': 'TV Shows',
}

export const SORTS: { value: string; label: string }[] = [
  { value: 'modified.time', label: 'Mới cập nhật' },
  { value: 'year', label: 'Năm phát hành' },
  { value: '_id', label: 'Đánh giá' },
]

export const LANGS: { value: SortLang; label: string }[] = [
  { value: 'vietsub', label: 'Vietsub' },
  { value: 'thuyet-minh', label: 'Thuyết minh' },
  { value: 'long-tieng', label: 'Lồng tiếng' },
]

export type SearchParams = Record<string, string | string[] | undefined>

export function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? ''
  return v ?? ''
}

export function readFilters(sp: SearchParams) {
  const sortField = first(sp.sort) || 'modified.time'
  return {
    page: Math.max(1, Number(first(sp.page) || '1') || 1),
    category: first(sp.category),
    country: first(sp['quoc-gia']),
    year: first(sp.nam),
    sortField,
    sortLang: first(sp.lang) as SortLang | '',
  }
}

export function activeFilterCount(f: ReturnType<typeof readFilters>) {
  return (
    (f.category ? 1 : 0) +
    (f.country ? 1 : 0) +
    (f.year ? 1 : 0) +
    (f.sortLang ? 1 : 0) +
    (f.sortField !== 'modified.time' ? 1 : 0)
  )
}

export function buildListUrl(
  base: string,
  filters: Record<string, string | number | undefined>,
): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === '' || v === 1 || (k === 'page' && v === 1)) continue
    qs.set(k, String(v))
  }
  const query = qs.toString()
  return query ? `${base}?${query}` : base
}

export function toApiFilters(f: ReturnType<typeof readFilters>): ListFilters {
  return {
    page: f.page,
    limit: 24,
    sort_field: f.sortField as ListFilters['sort_field'],
    sort_type: 'desc',
    sort_lang: (f.sortLang || undefined) as SortLang | undefined,
    category: f.category || undefined,
    country: f.country || undefined,
    year: f.year || undefined,
  }
}

const selectClass =
  'w-full appearance-none rounded-xl border border-white/10 bg-base-800/80 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent/50'

export function FilterGroup({
  label,
  name,
  value,
  options,
}: {
  label: string
  name: string
  value: string
  options: { value: string | number; label: string }[]
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-faint">{label}</span>
      <select name={name} defaultValue={value} className={selectClass}>
        <option value="">Tất cả</option>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterPanel({
  base,
  filters,
  categories,
  countries,
  years,
}: {
  base: string
  filters: ReturnType<typeof readFilters>
  categories: { slug: string; name: string }[]
  countries: { slug: string; name: string }[]
  years: number[]
}) {
  const count = activeFilterCount(filters)

  return (
    <form action={base} method="get" className="card-surface space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterGroup
          label="Thể loại"
          name="category"
          value={filters.category}
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <FilterGroup
          label="Quốc gia"
          name="quoc-gia"
          value={filters.country}
          options={countries.map((c) => ({ value: c.slug, label: c.name }))}
        />
        <FilterGroup
          label="Năm"
          name="nam"
          value={filters.year}
          options={years.slice(0, 60).map((y) => ({ value: y, label: String(y) }))}
        />
        <FilterGroup
          label="Ngôn ngữ"
          name="lang"
          value={filters.sortLang}
          options={LANGS.map((l) => ({ value: l.value, label: l.label }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-ink-faint">Sắp xếp:</span>
        {SORTS.map((s) => {
          const next = { ...filters, sort: s.value === 'modified.time' ? '' : s.value, page: undefined }
          return (
            <Link
              key={s.value}
              href={buildListUrl(base, {
                category: next.category,
                'quoc-gia': next.country,
                nam: next.year,
                lang: next.sortLang,
                sort: s.value === 'modified.time' ? '' : s.value,
              })}
              className={`chip ${filters.sortField === s.value ? 'chip-active' : ''}`}
            >
              {s.label}
            </Link>
          )
        })}

        {count > 0 && (
          <Link href={base} className="btn-subtle ml-auto !text-xs">
            Xóa bộ lọc
          </Link>
        )}

        <button type="submit" className="btn-primary !px-4 !py-1.5 !text-xs">
          Áp dụng
        </button>
      </div>
    </form>
  )
}

export function Pagination({ page, totalPages, url }: { page: number; totalPages: number; url: (page: number) => string }) {
  if (totalPages <= 1) return null
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={url(page - 1)} className={pageBtnClass} aria-label="Trang trước">
          ‹
        </Link>
      )}
      {pageNumbers(page, totalPages).map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1.5 text-ink-faint">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={url(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${pageBtnClass} ${p === page ? 'bg-accent text-white' : ''}`}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link href={url(page + 1)} className={pageBtnClass} aria-label="Trang sau">
          ›
        </Link>
      )}
    </nav>
  )
}

const pageBtnClass =
  'grid min-w-9 place-items-center rounded-xl px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-white/[0.09] hover:text-ink'

function pageNumbers(current: number, total: number): number[] {
  const out: number[] = []
  const push = (n: number) => out.push(n)
  const from = Math.max(1, current - 2)
  const to = Math.min(total, current + 2)
  if (from > 1) {
    push(1)
    if (from > 2) push(-1)
  }
  for (let i = from; i <= to; i++) push(i)
  if (to < total) {
    if (to < total - 1) push(-1)
    push(total)
  }
  return out
}

export type { Paginated }
