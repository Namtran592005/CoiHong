'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'coihong.watchlist.v1'

export interface WatchEntry {
  slug: string
  name: string
  poster?: string
  at: number
}

function read(): WatchEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WatchEntry[]) : []
  } catch {
    return []
  }
}

function write(entries: WatchEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {}
}

let cache: WatchEntry[] | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

export function useWatchlist() {
  const [entries, setEntries] = useState<WatchEntry[]>([])

  useEffect(() => {
    if (!cache) cache = read()
    setEntries(cache)

    const fn = () => setEntries(cache ?? [])
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])

  const has = useCallback((slug: string) => entries.some((e) => e.slug === slug), [entries])

  const add = useCallback((entry: Omit<WatchEntry, 'at'>) => {
    const withTime: WatchEntry = { ...entry, at: Date.now() }
    const next = [withTime, ...(cache ?? []).filter((e) => e.slug !== entry.slug)].slice(0, 100)
    cache = next
    write(next)
    emit()
  }, [])

  const remove = useCallback((slug: string) => {
    const next = (cache ?? []).filter((e) => e.slug !== slug)
    cache = next
    write(next)
    emit()
  }, [])

  const toggle = useCallback(
    (entry: Omit<WatchEntry, 'at'>) => {
      if ((cache ?? []).some((e) => e.slug === entry.slug)) remove(entry.slug)
      else add(entry)
    },
    [add, remove],
  )

  const clear = useCallback(() => {
    cache = []
    write([])
    emit()
  }, [])

  return { entries, has, add, remove, toggle, clear }
}
