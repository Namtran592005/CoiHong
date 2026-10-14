'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Bookmark, BrandLogo, Clapperboard, Flame, Home as HomeIcon, Menu, Search, X } from '@/components/Icons'
import { imageUrl } from '@/lib/images'
import type { LucideIcon } from 'lucide-react'

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Trang chủ', icon: HomeIcon, end: true },
  { to: '/hot', label: 'HOT', icon: Flame },
  { to: '/danh-sach', label: 'Tất cả', icon: Clapperboard },
  { to: '/quan-tainh', label: 'Yêu thích', icon: Bookmark },
]

export default function Navbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [suggest, setSuggest] = useState<{ name: string; slug: string; year?: number; poster_url?: string }[]>([])
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden'
      const t = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => {
        document.body.style.overflow = ''
        window.clearTimeout(t)
      }
    }
    document.body.style.overflow = ''
    setKeyword('')
    setSuggest([])
    setCursor(-1)
    return undefined
  }, [searchOpen])

  useEffect(() => {
    const term = keyword.trim()
    if (term.length < 2) {
      setSuggest([])
      return
    }
    const controller = new AbortController()
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=6`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('search failed')
        const data = (await res.json()) as { items?: typeof suggest }
        setSuggest(Array.isArray(data.items) ? data.items.slice(0, 6) : [])
      } catch {
        if (!controller.signal.aborted) setSuggest([])
      }
    }, 320)
    return () => {
      controller.abort()
      window.clearTimeout(t)
    }
  }, [keyword])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = keyword.trim()
    if (!term) return
    setSearchOpen(false)
    window.location.href = `/tim-kiem?q=${encodeURIComponent(term)}`
  }

  const go = (slug: string) => {
    setSearchOpen(false)
    window.location.href = `/phim/${slug}`
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'glass-nav' : 'bg-gradient-to-b from-base-950/90 to-transparent'
        }`}
      >
        <div className="container-app grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-6 lg:px-10">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Mở danh mục"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <Link href="/" className="flex items-center justify-center" aria-label="CoiHong — trang chủ">
            <BrandLogo className="h-9 sm:h-11" priority />
          </Link>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </button>
            <ActiveLink href="/quan-tainh" label="Yêu thích">
              <Bookmark className="h-5 w-5" />
            </ActiveLink>
          </div>
        </div>
      </header>

      <BottomNav items={NAV} />

      {searchOpen && (
        <div className="fixed inset-0 z-50 animate-scale-in" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="container-app relative pt-[12vh]">
            <form
              onSubmit={submit}
              className="glass glass-edge mx-auto flex max-w-2xl items-center gap-2 rounded-2xl p-2 pl-4"
            >
              <Search className="h-5 w-5 shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCursor(-1)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false)
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setCursor((c) => Math.min(c + 1, suggest.length - 1))
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setCursor((c) => Math.max(c - 1, -1))
                  }
                  if (e.key === 'Enter' && cursor >= 0 && suggest[cursor]) {
                    e.preventDefault()
                    go(suggest[cursor].slug)
                  }
                }}
                placeholder="Tìm phim, ví dụ: người nhện…"
                className="w-full bg-transparent py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Đóng tìm kiếm"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-white/10 hover:text-ink"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
              <button
                type="submit"
                aria-label="Tìm"
                title="Tìm"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white
                  transition-transform hover:bg-accent-soft active:scale-95"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            </form>

            <div className="mx-auto mt-3 max-w-2xl">
              {suggest.length > 0 ? (
                <ul className="glass glass-edge divide-y divide-white/[0.07] overflow-hidden rounded-2xl p-1">
                  {suggest.map((s, i) => {
                    const src = imageUrl(s.poster_url)
                    return (
                      <li key={s.slug}>
                        <button
                          type="button"
                          onClick={() => go(s.slug)}
                          onMouseEnter={() => setCursor(i)}
                          className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
                            cursor === i ? 'bg-white/[0.08]' : ''
                          }`}
                        >
                          {src ? (
                            <Image
                              src={src}
                              alt=""
                              width={32}
                              height={48}
                              loading="lazy"
                              className="h-12 w-8 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <span aria-hidden className="h-12 w-8 shrink-0 rounded bg-white/[0.06]" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink">{s.name}</span>
                            <span className="block text-xs text-ink-faint">{s.year ?? ''}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                keyword.trim().length >= 2 && (
                  <p className="px-2 text-xs text-ink-faint">Không có gợi ý nào.</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ActiveLink({
  href,
  label,
  children,
  className = '',
}: {
  href: string
  label: string
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      aria-label={label}
      className={`transition-colors hover:bg-white/10 ${active ? 'text-accent' : 'text-ink'} ${className}`}
    >
      {children}
    </Link>
  )
}

function BottomNav({ items }: { items: typeof NAV }) {
  const pathname = usePathname() ?? '/'
  return (
    <nav
      aria-label="Điều hướng chính"
      className="glass-bar fixed inset-x-0 bottom-0 z-30 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.28) 22%, rgba(255,255,255,0.28) 78%, transparent)',
        }}
      />

      <div className="mx-auto grid max-w-lg grid-cols-4 px-2">
        {items.map(({ to, label, icon: Icon, end }) => {
          const active = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
          return (
            <Link
              key={to}
              href={to}

              aria-current={active ? 'page' : undefined}
              className="group flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5"
            >
              <span
                className={`grid h-8 w-full max-w-[62px] place-items-center rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-accent/15 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-ink-faint group-active:bg-white/[0.07]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />
              </span>
              <span
                className={`text-[10px] leading-none tracking-tight transition-colors ${
                  active ? 'font-semibold text-ink' : 'font-medium text-ink-faint'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
