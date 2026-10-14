'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Player from '@/components/Player'
import type { PlayerHandle } from '@/components/Player'
import { ArrowLeft, ChevronLeft, ChevronRight, Play, RotateCcw } from '@/components/Icons'
import { imageUrl } from '@/lib/images'
import {
  clearProgress,
  formatTime,
  getProgress,
  isWorthResuming,
  remainingText,
  saveProgress,
} from '@/lib/progress'
import type { Progress } from '@/lib/progress'
import type { Episode, EpisodeServer, Movie } from '@/types'

interface Props {
  movie: Pick<Movie, 'slug' | 'name' | 'poster_url' | 'thumb_url' | 'category'>
  keywords: { name?: string; name_vn?: string }[]
  servers: EpisodeServer[]
  initialEpisode: number
}

export default function WatchClient({ movie, keywords, servers, initialEpisode }: Props) {
  const router = useRouter()
  const [serverIdx, setServerIdx] = useState(0)
  const [epIdx, setEpIdx] = useState(initialEpisode)

  useEffect(() => {
    const eps = servers[0]?.server_data ?? []
    setEpIdx(Math.min(Math.max(initialEpisode, 0), Math.max(eps.length - 1, 0)))
    setServerIdx(0)
  }, [initialEpisode, servers])

  const current: Episode | undefined = servers[serverIdx]?.server_data?.[epIdx]
  const eps = servers[serverIdx]?.server_data ?? []

  const savedRef = useRef<Progress | null>(null)
  const [resume, setResume] = useState<Progress | null>(null)
  const [startAt, setStartAt] = useState(0)
  const lastSaveRef = useRef(0)
  const playerRef = useRef<PlayerHandle>(null)

  useEffect(() => {
    const p = getProgress(movie.slug)
    savedRef.current = null
    setResume(null)
    setStartAt(0)
    if (isWorthResuming(p) && p.e === epIdx) {
      savedRef.current = p
      setResume(p)
    }
  }, [movie.slug, epIdx])

  const handleTime = useCallback(
    ({ time, duration }: { time: number; duration: number }) => {
      if (!duration) return
      const now = Date.now()
      if (now - lastSaveRef.current < 5000) return
      lastSaveRef.current = now
      if (isWorthResuming({ t: time, e: epIdx, d: duration, u: now })) {
        saveProgress(movie.slug, { t: time, e: epIdx, d: duration, u: now })
      }
    },
    [movie.slug, epIdx],
  )

  const applyResume = useCallback(() => {
    const p = resume
    if (p) setStartAt(p.t)
    setResume(null)
  }, [resume])

  const startOver = useCallback(() => {
    clearProgress(movie.slug)
    setStartAt(0)
    setResume(null)
    playerRef.current?.seekTo(0)
  }, [movie.slug])

  const handleEnded = useCallback(() => {
    clearProgress(movie.slug)
  }, [movie.slug])

  const goEpisode = (delta: number) => {
    const next = epIdx + delta
    if (next < 0) {
      if (serverIdx > 0) {
        setServerIdx(serverIdx - 1)
        setEpIdx(Math.max((servers[serverIdx - 1]?.server_data?.length ?? 1) - 1, 0))
      }
      return
    }
    if (next >= eps.length) {
      if (serverIdx < servers.length - 1) {
        setServerIdx(serverIdx + 1)
        setEpIdx(0)
      }
      return
    }
    setEpIdx(next)
  }

  const poster = useMemo(
    () => imageUrl(movie.thumb_url || movie.poster_url),
    [movie.thumb_url, movie.poster_url],
  )

  const selectEpisode = (i: number) => {
    setEpIdx(i)
    router.replace(`/xem-phim/${movie.slug}?tap=${i + 1}`, { scroll: false })
  }

  return (
    <div className="pb-12">
      <div className="sticky top-16 z-30 border-b border-white/[0.07] bg-base-950/85 backdrop-blur-xl">
        <div className="container-app flex items-center gap-3 py-3">
          <Link
            href={`/phim/${movie.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-white/[0.09] hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Thông tin</span>
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-ink">{movie.name}</h1>
            <p className="truncate text-xs text-ink-faint">
              {servers[serverIdx]?.server_name} · {current?.name ?? 'Chưa có tập'}
              {current?.filename ? ` · ${current.filename}` : ''}
            </p>
          </div>

          <Link
            href={`/phim/${movie.slug}`}
            aria-label="Chi tiết phim"
            className="shrink-0 rounded-full p-2 text-ink-muted transition-colors hover:bg-white/10 hover:text-ink"
          >
            <PosterMini src={imageUrl(movie.poster_url)} />
          </Link>
        </div>
      </div>

      <div className="container-app pt-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {current ? (
              <>
                {resume && (
                  <div className="card-surface mb-3 flex flex-wrap items-center gap-3 border-accent/30 p-3.5 animate-fade-up">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        Bạn đã xem đến {formatTime(resume.t)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {current.name} · {remainingText(resume)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={startOver} className="btn-subtle !px-3.5 !py-2 !text-[13px]">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Từ đầu
                      </button>
                      <button type="button" onClick={applyResume} className="btn-primary !px-3.5 !py-2 !text-[13px]">
                        <Play className="h-3.5 w-3.5" fill="currentColor" />
                        Xem tiếp
                      </button>
                    </div>
                  </div>
                )}

                <Player
                  episode={current}
                  ref={playerRef}
                  poster={poster}
                  title={`${movie.name} - ${current.name}`}
                  startAt={startAt}
                  onTimeUpdate={handleTime}
                  onEnded={handleEnded}
                />
              </>
            ) : (
              <div className="card-surface flex aspect-video items-center justify-center">
                <p className="text-sm text-ink-faint">Phim chưa có tập nào để phát.</p>
              </div>
            )}

            {eps.length > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goEpisode(-1)}
                  disabled={epIdx === 0 && serverIdx === 0}
                  className="btn-ghost !px-4 !py-2 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Tập trước
                </button>
                <p className="text-xs text-ink-faint">
                  {current?.name} · {epIdx + 1}/{eps.length}
                </p>
                <button
                  type="button"
                  onClick={() => goEpisode(1)}
                  disabled={epIdx >= eps.length - 1 && serverIdx >= servers.length - 1}
                  className="btn-ghost !px-4 !py-2 disabled:opacity-40"
                >
                  Tập sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="card-surface p-4">
              <h2 className="mb-3 text-sm font-semibold text-ink">Danh sách tập</h2>

              {servers.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {servers.map((s, i) => (
                    <button
                      key={`${s.server_name}-${i}`}
                      type="button"
                      onClick={() => {
                        setServerIdx(i)
                        setEpIdx(0)
                      }}
                      className={`chip ${i === serverIdx ? 'chip-active' : ''}`}
                    >
                      {s.server_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid max-h-[52vh] grid-cols-3 gap-1.5 overflow-y-auto pr-1 lg:max-h-[60vh]">
                {eps.map((ep, i) => (
                  <button
                    key={`${ep.slug ?? ep.name}-${i}`}
                    type="button"
                    onClick={() => selectEpisode(i)}
                    className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition-all ${
                      i === epIdx
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/25 hover:text-ink'
                    }`}
                  >
                    {ep.name.replace(/^Tập\s*/i, '')}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {(movie.category?.length || keywords.length) && (
          <section className="mt-10 space-y-3">
            {!!movie.category?.length && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Thể loại
                </span>
                {movie.category.map((c) => (
                  <Link key={c._id ?? c.id ?? c.slug} href={`/the-loai/${c.slug}`} className="chip !py-1">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            {!!keywords.length && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Từ khóa
                </span>
                {keywords.slice(0, 10).map((k, i) => {
                  const label = k.name_vn || k.name
                  if (!label) return null
                  return (
                    <Link
                      key={`${label}-${i}`}
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
      </div>
    </div>
  )
}

function PosterMini({ src }: { src: string }) {
  if (!src) return <span className="block h-8 w-6 rounded bg-white/[0.06]" />
  return (
    <Image src={src} alt="" width={24} height={32} className="h-8 w-6 rounded object-cover" />
  )
}
