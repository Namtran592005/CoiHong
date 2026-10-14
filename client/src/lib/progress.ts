'use client'

const COOKIE = 'ch_progress'
const MAX_AGE = 60 * 60 * 24 * 90
const MAX_ENTRIES = 24

const MIN_SECONDS = 15
const NEAR_END_RATIO = 0.97

export interface Progress {
  t: number

  e: number

  d: number

  u: number
}

type Store = Record<string, Progress>

function read(): Store {
  if (typeof document === 'undefined') return {}
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return parsed && typeof parsed === 'object' ? (parsed as Store) : {}
  } catch {
    return {}
  }
}

function write(store: Store) {
  const entries = Object.entries(store)
    .sort((a, b) => b[1].u - a[1].u)
    .slice(0, MAX_ENTRIES)

  if (!entries.length) {
    document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`
    return
  }

  const value = encodeURIComponent(JSON.stringify(Object.fromEntries(entries)))
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`
}

export function isWorthResuming(p?: Progress): p is Progress {
  if (!p) return false
  if (p.t < MIN_SECONDS) return false
  if (!p.d || p.d <= 0) return false
  return p.t < p.d * NEAR_END_RATIO
}

export function getProgress(slug: string): Progress | undefined {
  return read()[slug]
}

export function saveProgress(slug: string, p: Progress) {
  const store = read()
  store[slug] = p
  write(store)
}

export function clearProgress(slug: string) {
  const store = read()
  delete store[slug]
  write(store)
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function remainingText(p: Progress): string {
  const left = Math.max(0, p.d - p.t)
  const min = Math.ceil(left / 60)
  if (min < 1) return 'còn chưa đầy 1 phút'
  if (min < 60) return `còn ${min} phút`
  const h = Math.floor(min / 60)
  return `còn ${h} giờ ${min % 60} phút`
}