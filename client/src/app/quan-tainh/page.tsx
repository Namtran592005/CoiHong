'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EmptyWatchlist } from '@/components/StateBlocks'
import { Bookmark, Check, Compass, X } from '@/components/Icons'
import PageBanner from '@/components/PageBanner'
import { useWatchlist } from '@/hooks/useWatchlist'
import { imageUrl } from '@/lib/images'
import type { WatchEntry } from '@/hooks/useWatchlist'

const HOLD_MS = 420

const MOVE_TOLERANCE = 10

export default function WatchlistPage() {
  const { entries, remove, clear } = useWatchlist()

  const [picked, setPicked] = useState<Set<string>>(new Set())
  const selecting = picked.size > 0

  const exitSelect = useCallback(() => setPicked(new Set()), [])

  useEffect(() => {
    if (!selecting) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitSelect()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selecting, exitSelect])

  const togglePick = useCallback((slug: string) => {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  const deletePicked = useCallback(() => {
    picked.forEach((slug) => remove(slug))
    setPicked(new Set())
  }, [picked, remove])

  if (!entries.length) {
    return (
      <>
        <PageBanner
          eyebrow="Thư viện cá nhân"
          title="Yêu thích"
          icon={Bookmark}
          meta="Danh sách lưu ngay trên máy này, không cần đăng nhập."
        />
        <div className="container-app pb-20 pt-6">
          <EmptyWatchlist />
        </div>
      </>
    )
  }

  return (
    <>
      <PageBanner
        eyebrow="Thư viện cá nhân"
        title="Yêu thích"
        icon={Bookmark}
        meta={
          selecting ? (
            <span className="text-ink">
              Đã chọn <b className="font-semibold text-accent">{picked.size}</b> phim
            </span>
          ) : (
            <>
              <b className="font-semibold text-ink-muted">
                {entries.length.toLocaleString('vi-VN')}
              </b>{' '}
              phim đã lưu · <span className="hidden sm:inline">nhấn giữ một thẻ để chọn nhiều</span>
              <span className="sm:hidden">nhấn giữ để chọn</span>
            </>
          )
        }
      >
        {selecting ? (
          <button
            type="button"
            onClick={exitSelect}
            className="btn-ghost !px-3.5 !py-2 !text-[13px]"
          >
            <X className="h-4 w-4" aria-hidden />
            Huỷ
          </button>
        ) : (
          <button
            type="button"
            onClick={clear}
            className="btn-ghost !px-3.5 !py-2 !text-[13px]"
          >
            Xóa tất cả
          </button>
        )}
      </PageBanner>

      <div className="container-app pb-20 pt-6">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {entries.map((entry, i) => (
            <WatchCard
              key={entry.slug}
              entry={entry}
              index={i}
              selecting={selecting}
              picked={picked.has(entry.slug)}
              onPick={togglePick}
              onRemove={() => remove(entry.slug)}
            />
          ))}
        </div>
      </div>

      {selecting && (
        <SelectBar
          count={picked.size}
          total={entries.length}
          onDelete={deletePicked}
          onSelectAll={() =>
            setPicked(
              picked.size === entries.length
                ? new Set()
                : new Set(entries.map((e) => e.slug)),
            )
          }
          onCancel={exitSelect}
        />
      )}
    </>
  )
}

function WatchCard({
  entry,
  index,
  selecting,
  picked,
  onPick,
  onRemove,
}: {
  entry: WatchEntry
  index: number
  selecting: boolean
  picked: boolean
  onPick: (slug: string) => void
  onRemove: () => void
}) {
  const src = imageUrl(entry.poster)

  const stateRef = useRef({ selecting, picked, onPick })
  stateRef.current = { selecting, picked, onPick }

  const timer = useRef(0)
  const origin = useRef({ x: 0, y: 0 })

  const swallowed = useRef(false)

  const beginHold = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    origin.current = { x: e.clientX, y: e.clientY }
    swallowed.current = false
    timer.current = window.setTimeout(() => {
      timer.current = 0
      const { onPick: pick } = stateRef.current
      swallowed.current = true

      navigator.vibrate?.(12)

      pick(entry.slug)
    }, HOLD_MS)
  }

  const moveHold = (e: React.PointerEvent) => {
    if (!timer.current) return
    const dx = Math.abs(e.clientX - origin.current.x)
    const dy = Math.abs(e.clientY - origin.current.y)
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) cancelHold()
  }

  const cancelHold = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = 0
    }
  }

  useEffect(() => cancelHold, [])

  const body = (
    <>
      <div className="relative aspect-[2/3] overflow-hidden rounded-card bg-white/[0.03] transition-transform duration-300 group-hover:-translate-y-1">
        {src ? (
          <Image
            src={src}
            alt={entry.name}
            fill
            sizes="(max-width: 640px) 30vw, 14vw"
            className={picked ? 'scale-[0.94] opacity-40' : 'object-cover'}
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-faint">
            <Compass className="h-6 w-6" aria-hidden />
          </div>
        )}

        {picked && (
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">
              <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <h3 className="line-clamp-2-safe mt-2.5 text-[13.5px] font-semibold leading-snug text-ink">
        {entry.name}
      </h3>
      <p className="mt-1 text-[11px] text-ink-faint">
        Đã lưu {new Date(entry.at).toLocaleDateString('vi-VN')}
      </p>
    </>
  )

  const onClick = (e: React.MouseEvent) => {
    if (selecting) {
      e.preventDefault()
      onPick(entry.slug)
    }
  }

  return (
    <div
      className="group relative animate-fade-up select-none"
      style={{ animationDelay: `${index * 30}ms` }}
      onPointerDown={beginHold}
      onPointerMove={moveHold}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
    >
      {selecting ? (
        <button type="button" onClick={onClick} className="block w-full text-left" aria-pressed={picked}>
          {body}
        </button>
      ) : (
        <Link
          href={`/phim/${entry.slug}`}
          onClick={(e) => {
            if (swallowed.current) {
              e.preventDefault()
              swallowed.current = false
            }
          }}
          className="block"
        >
          {body}
        </Link>
      )}

      {!selecting && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Bỏ ${entry.name} khỏi yêu thích`}
          title="Bỏ khỏi yêu thích"
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full
            bg-black/65 text-ink opacity-0 backdrop-blur-md transition-all
            hover:bg-accent hover:text-white focus-visible:opacity-100
            group-hover:opacity-100"
        >
          <Bookmark className="h-4 w-4" fill="currentColor" aria-hidden />
        </button>
      )}
    </div>
  )
}

function SelectBar({
  count,
  total,
  onDelete,
  onSelectAll,
  onCancel,
}: {
  count: number
  total: number
  onDelete: () => void
  onSelectAll: () => void
  onCancel: () => void
}) {
  const all = count === total
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="glass glass-edge pointer-events-auto flex w-full max-w-lg items-center gap-2 rounded-2xl p-2 animate-fade-up">
        <button
          type="button"
          onClick={onSelectAll}
          className="btn-ghost !px-3 !py-2 !text-[13px]"
        >
          {all ? 'Bỏ chọn tất cả' : `Chọn tất cả (${total})`}
        </button>

        <span className="min-w-0 flex-1 truncate text-center text-[13px] text-ink-muted">
          <b className="font-semibold text-ink">{count}</b> / {total}
        </span>

        <button
          type="button"
          onClick={onDelete}
          className="btn !px-3.5 !py-2 !text-[13px] bg-red-500/90 text-white hover:bg-red-500"
        >
          <Bookmark className="h-4 w-4" aria-hidden />
          Xóa
        </button>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Huỷ chọn"
          title="Huỷ chọn"
          className="btn-ghost !px-2.5 !py-2"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}