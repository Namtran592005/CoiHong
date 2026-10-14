'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from './Icons'
import { useWatchlist } from '@/hooks/useWatchlist'

interface Props {
  slug: string
  name: string
  poster?: string
}

export default function SaveButton({ slug, name, poster }: Props) {
  const { has, toggle } = useWatchlist()
  const [busy, setBusy] = useState(false)
  const saved = has(slug)

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true)
        toggle({ slug, name, poster })
        setBusy(false)
      }}
      className={`btn-ghost !px-4 !py-3 !text-[15px] ${saved ? '!border-accent/50 !text-accent' : ''}`}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 text-accent" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {saved ? 'Đã lưu' : 'Lưu'}
    </button>
  )
}
