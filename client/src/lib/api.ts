import 'server-only'

import { cache } from 'react'
import type {
  Category,
  Country,
  KeywordResponse,
  ListFilters,
  Movie,
  Paginated,
  PeopleResponse,
} from '@/types'

const API_BASE = (process.env.API_BASE ?? 'https://phimapi.com').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Query = Record<string, string | number | undefined | null>

function buildUrl(path: string, params?: Query): string {
  const search = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return `${API_BASE}${path}${qs ? `?${qs}` : ''}`
}

const TTL = {
  home: 300,
  list: 180,
  movie: 3600,
  people: 86400,
  catalog: 86400,
} as const

type CacheOpts = { revalidate: number; tags: string[] }

async function apiGet<T>(path: string, params?: Query, timeout = 15000, cacheOpts?: CacheOpts) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(buildUrl(path, params), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      ...(cacheOpts ? { next: { revalidate: cacheOpts.revalidate, tags: cacheOpts.tags } } : { cache: 'no-store' }),
    })
    if (!res.ok) throw new ApiError(`HTTP ${res.status}`, res.status)
    const body = (await res.json()) as Record<string, unknown>
    if (body.status === false || body.status === 'error') {
      throw new ApiError((body.msg as string) || (body.message as string) || 'Lỗi API', 502)
    }
    return body as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    const message = err instanceof Error ? err.message : 'Không kết nối được API'
    throw new ApiError(message, 0)
  } finally {
    clearTimeout(timer)
  }
}

type RawBody = Record<string, unknown>

function pickItems(body: RawBody): Movie[] {
  const data = (body.data ?? body) as RawBody
  const items = (data.items ?? body.items) as unknown
  return Array.isArray(items) ? (items as Movie[]) : []
}

function pickPagination(body: RawBody): Paginated['pagination'] {
  const data = (body.data ?? body) as RawBody
  const params = (data.params ?? body.params) as RawBody | undefined
  const p = (params?.pagination ?? data.pagination ?? body.pagination) as RawBody | undefined
  const current = Number(p?.currentPage ?? 1)
  const totalPages = Number(p?.totalPages ?? 1)
  const totalItems = Number(p?.totalItems ?? 0)
  return {
    currentPage: Number.isFinite(current) && current > 0 ? current : 1,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    totalItems: Number.isFinite(totalItems) ? totalItems : 0,
    totalItemsPerPage: Number(p?.totalItemsPerPage ?? 0),
  }
}

function toPaginated(body: RawBody): Paginated {
  return { items: pickItems(body), pagination: pickPagination(body) }
}

function cleanParams(filters?: ListFilters): Query {
  if (!filters) return {}
  return {
    page: filters.page,
    limit: filters.limit,
    category: filters.category,
    country: filters.country,
    year: filters.year,
    sort_field: filters.sort_field,
    sort_type: filters.sort_type,
    sort_lang: filters.sort_lang,
  }
}

const memo = cache(<T, A extends unknown[]>(fn: (...args: A) => Promise<T>) => fn)

export async function getHome() {
  const body = await apiGet<RawBody>(
    '/v1/api/home',
    undefined,
    20000,
    { revalidate: TTL.home, tags: ['home'] },
  )
  const data = (body.data ?? body) as RawBody
  const sports = (data.itemsSportsVideos ?? []) as Movie[]
  return {
    sections: pickItems(body),
    sports: Array.isArray(sports) ? sports : [],
    cdn: (data.APP_DOMAIN_CDN_IMAGE as string) ?? '',
    frontend: (data.APP_DOMAIN_FRONTEND as string) ?? '',
  }
}

export const listMovies = memo((filters?: ListFilters) =>
  apiGet<RawBody>('/v1/api/danh-sach', cleanParams(filters), 15000, {
    revalidate: TTL.list,
    tags: ['list'],
  }).then(toPaginated),
)

export const listByType = memo((type: string, filters?: ListFilters) =>
  apiGet<RawBody>(`/v1/api/danh-sach/${encodeURIComponent(type)}`, cleanParams(filters), 15000, {
    revalidate: TTL.list,
    tags: ['list'],
  }).then(toPaginated),
)

export const listByCategory = memo((slug: string, filters?: ListFilters) =>
  apiGet<RawBody>(`/v1/api/the-loai/${encodeURIComponent(slug)}`, cleanParams(filters), 15000, {
    revalidate: TTL.list,
    tags: ['list'],
  }).then(toPaginated),
)

export function hotScore(m: Movie): number {
  const imdb = typeof m.imdb?.vote_average === 'number' ? m.imdb.vote_average : 0
  const tmdb = typeof m.tmdb?.vote_average === 'number' ? m.tmdb.vote_average : 0
  const vote = imdb || tmdb
  return (
    vote * 10 +
    (m.episode_current ? 3 : 0) +
    Math.min(m.lang_key?.length ?? 0, 2) * 1.5 +
    (m.quality ? 1 : 0)
  )
}

export function voteOf(m: Movie): number {
  const imdb = typeof m.imdb?.vote_average === 'number' ? m.imdb.vote_average : 0
  return imdb || (typeof m.tmdb?.vote_average === 'number' ? m.tmdb.vote_average : 0)
}

export async function getHotMovies(limit = 24): Promise<Movie[]> {
  const sources = await Promise.all([
    listMovies({ page: 1, sort_field: '_id', sort_type: 'desc' }),
    listByType('phim-le', { page: 1 }),
    listByType('phim-bo', { page: 1 }),
    listByType('hoat-hinh', { page: 1 }),
    listByType('tv-shows', { page: 1 }),
  ])

  const seen = new Set<string>()
  const all: Movie[] = []
  for (const s of sources) {
    for (const m of s.items) {
      if (seen.has(m.slug)) continue
      seen.add(m.slug)
      all.push(m)
    }
  }

  return all
    .filter((m) => voteOf(m) > 0 || m.episode_current)
    .sort((a, b) => hotScore(b) - hotScore(a))
    .slice(0, limit)
}

export const listByCountry = memo((slug: string, filters?: ListFilters) =>
  apiGet<RawBody>(`/v1/api/quoc-gia/${encodeURIComponent(slug)}`, cleanParams(filters), 15000, {
    revalidate: TTL.list,
    tags: ['list'],
  }).then(toPaginated),
)

export const listByYear = memo((year: number, filters?: ListFilters) =>
  apiGet<RawBody>(`/v1/api/nam/${encodeURIComponent(String(year))}`, cleanParams(filters), 15000, {
    revalidate: TTL.list,
    tags: ['list'],
  }).then(toPaginated),
)

export const searchMovies = memo((keyword: string, filters?: ListFilters) =>
  apiGet<RawBody>(
    '/v1/api/tim-kiem',
    { keyword, ...cleanParams({ limit: 24, sort_field: 'modified.time', sort_type: 'desc', ...filters }) },
    15000,
    { revalidate: TTL.list, tags: ['list'] },
  ).then(toPaginated),
)

export async function getMovie(slug: string) {
  const body = await apiGet<RawBody>(
    `/v1/api/phim/${encodeURIComponent(slug)}`,
    undefined,
    20000,
    { revalidate: TTL.movie, tags: [`movie:${slug}`] },
  )
  const data = (body.data ?? body) as RawBody
  const item = (data.item ?? body.movie ?? data) as Movie
  if (!item?.slug) throw new ApiError('Không tìm thấy phim', 404)
  return normalizeMovie(item)
}

function normalizeMovie(movie: Movie): Movie {
  return {
    ...movie,
    actor: toStringArray(movie.actor),
    director: toStringArray(movie.director),
    category: toArray(movie.category),
    country: toArray(movie.country),
    alternative_names: toStringArray(movie.alternative_names),
  }
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value === undefined || value === null || value === '') return []
  return [value as T]
}

function toStringArray(value: unknown): string[] {
  return toArray(value)
    .map((v) => (typeof v === 'string' ? v : ((v as { name?: string })?.name ?? '')))
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
}

export async function getMoviePeoples(slug: string): Promise<PeopleResponse> {
  try {
    const body = await apiGet<RawBody>(
      `/v1/api/phim/${encodeURIComponent(slug)}/peoples`,
      undefined,
      15000,
      { revalidate: TTL.people, tags: [`movie:${slug}`] },
    )
    const data = (body.data ?? body) as RawBody
    return {
      people: ((data.peoples ?? []) as PeopleResponse['people']) ?? [],
      profileSizes: (data.profile_sizes ?? {}) as Record<string, string>,
    }
  } catch {
    return { people: [], profileSizes: {} }
  }
}

export async function getMovieKeywords(slug: string): Promise<KeywordResponse> {
  try {
    const body = await apiGet<RawBody>(
      `/v1/api/phim/${encodeURIComponent(slug)}/keywords`,
      undefined,
      15000,
      { revalidate: TTL.people, tags: [`movie:${slug}`] },
    )
    const data = (body.data ?? body) as RawBody
    const raw = data.keywords as unknown
    const keywords = Array.isArray(raw)
      ? (raw as unknown[])
          .map((k) => (typeof k === 'string' ? { name: k } : (k as { name?: string })))
          .filter(Boolean)
      : []
    return { keywords } as KeywordResponse
  } catch {
    return { keywords: [] }
  }
}

export const getCategories = memo(async () => {
  try {
    const body = await apiGet<RawBody>('/v1/api/the-loai', undefined, 15000, {
      revalidate: TTL.catalog,
      tags: ['catalog'],
    })
    return pickItems(body) as unknown as Category[]
  } catch {
    return []
  }
})

export const getCountries = memo(async () => {
  try {
    const body = await apiGet<RawBody>('/v1/api/quoc-gia', undefined, 15000, {
      revalidate: TTL.catalog,
      tags: ['catalog'],
    })
    return pickItems(body) as unknown as Country[]
  } catch {
    return []
  }
})

export const getYears = memo(async () => {
  const fallback = [new Date().getFullYear()]
  try {
    const body = await apiGet<RawBody>('/nam-phat-hanh', undefined, 15000, {
      revalidate: TTL.catalog,
      tags: ['catalog'],
    })
    const data = (body.data ?? body) as RawBody
    const items = (data.items ?? []) as { year: number }[]
    const years = items.map((i) => Number(i.year)).filter((y) => Number.isFinite(y))
    return years.length ? years : fallback
  } catch {
    return fallback
  }
})
