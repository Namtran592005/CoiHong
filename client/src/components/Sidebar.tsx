'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MOVIE_TYPES, QUICK_LINKS, SIDEBAR_YEARS, SUBTITLES, browseUrl } from '@/lib/catalog'
import type { Category, Country } from '@/types'
import {
  Bookmark,
  BrandLogo,
  ChevronDown,
  Globe,
  LayoutGrid,
  Search,
  Sparkles,
  X,
} from './Icons'

interface Props {
  open: boolean
  onClose: () => void
  categories: Category[]
  countries: Country[]
  years: number[]
  currentYear: number
}

export default function Sidebar({ open, onClose, categories, countries, years, currentYear }: Props) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    theLoai: true,
    quocGia: false,
    nam: false,
  })

  useEffect(() => {
    onClose()
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const yearList = years.slice(0, SIDEBAR_YEARS)
  const toggle = (key: string) => setExpanded((s) => ({ ...s, [key]: !s[key] }))

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/65 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Danh mục phim"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[340px] flex-col
          border-r border-white/[0.12] backdrop-blur-2xl backdrop-saturate-150
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(18,18,26,0.72) 0%, rgba(8,8,11,0.88) 60%, rgba(6,6,9,0.94) 100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3) 15%, rgba(255,255,255,0.3) 85%, transparent)',
          }}
        />
        <div className="relative flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5" aria-label="CoiHong">
            <BrandLogo className="h-8" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng danh mục"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-white/[0.07] hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-8 pt-3">
          <Link
            href="/tim-kiem"
            onClick={onClose}
            className="mb-6 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.06]
              px-3.5 py-2.5 text-sm text-ink-muted backdrop-blur-xl transition-colors
              hover:border-white/[0.16] hover:bg-white/[0.09] hover:text-ink"
          >
            <Search className="h-4 w-4 shrink-0" />
            Tìm phim, diễn viên…
          </Link>

          <Group title="Khám phá">
            <ul className="space-y-0.5">
              {QUICK_LINKS.map(({ to, label, icon: Icon }) => {
                const active = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
                return (
                  <li key={to}>
                    <Link
                      href={to}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                        active
                          ? 'bg-white/[0.07] font-medium text-ink'
                          : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-ink-faint'}`}
                      />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Group>

          <Group title="Loại phim">
            <ul className="space-y-0.5">
              {MOVIE_TYPES.map(({ slug, label, icon: Icon }) => {
                const href = `/danh-sach/${slug}`
                const active = pathname === href
                return (
                  <li key={slug}>
                    <Link
                      href={href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                        active
                          ? 'bg-white/[0.07] font-medium text-ink'
                          : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-accent' : 'text-ink-faint'}`}
                      />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Group>

          <Group title="Ngôn ngữ & phụ đề">
            <ChipGrid
              cols={3}
              items={SUBTITLES.map(({ slug, label }) => ({
                key: slug,
                label,
                href: browseUrl('/danh-sach', { lang: slug }),
              }))}
              onClose={onClose}
              emptyText=""
            />
          </Group>

          <Section
            title="Thể loại"
            icon={Sparkles}
            expanded={expanded.theLoai}
            onToggle={() => toggle('theLoai')}
            count={categories.length}
          >
            <ChipGrid
              items={categories.map((c) => ({ key: c._id ?? c.id ?? c.slug, label: c.name, href: `/the-loai/${c.slug}` }))}
              onClose={onClose}
              emptyText="Không tải được danh mục."
            />
          </Section>

          <Section
            title="Quốc gia"
            icon={Globe}
            expanded={expanded.quocGia}
            onToggle={() => toggle('quocGia')}
            count={countries.length}
          >
            <ChipGrid
              items={countries.map((c) => ({ key: c._id ?? c.id ?? c.slug, label: c.name, href: `/quoc-gia/${c.slug}` }))}
              onClose={onClose}
              emptyText="Không tải được danh mục."
            />
          </Section>

          <Section
            title="Năm phát hành"
            icon={LayoutGrid}
            expanded={expanded.nam}
            onToggle={() => toggle('nam')}
          >
            <div className="grid grid-cols-4 gap-1.5 px-3">
              {yearList.map((y) => (
                <Link
                  key={y}
                  href={`/nam/${y}`}
                  onClick={onClose}
                  className={`rounded-lg py-1.5 text-center text-[12px] transition-colors ${
                    pathname === `/nam/${y}`
                      ? 'bg-white/[0.07] font-medium text-ink'
                      : 'text-ink-muted hover:bg-white/[0.06] hover:text-ink'
                  }`}
                >
                  {y}
                </Link>
              ))}
            </div>
            {years.length > SIDEBAR_YEARS && (
              <Link
                href="/danh-sach?sort=year"
                onClick={onClose}
                className="mx-3 mt-2.5 block rounded-lg py-1.5 text-center text-[12px] text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                Xem tất cả năm ({years.length})
              </Link>
            )}
            <p className="mt-2 px-3 text-[11px] text-ink-faint">Cập nhật đến năm {currentYear}</p>
          </Section>
        </nav>

        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <Link
            href="/quan-tainh"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink"
          >
            <Bookmark className="h-4 w-4 shrink-0 text-accent" />
            Danh sách yêu thích
          </Link>
        </div>
      </aside>
    </>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Section({
  title,
  icon: Icon,
  expanded,
  onToggle,
  count,
  children,
}: {
  title: string
  icon: typeof Globe
  expanded: boolean
  onToggle: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="mb-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        <h3 className="flex-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {title}
        </h3>
        {count ? <span className="text-[10.5px] tabular-nums text-ink-faint/70">{count}</span> : null}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && children}
    </section>
  )
}

function ChipGrid({
  items,
  onClose,
  emptyText,
  cols = 2,
}: {
  items: { key: string; label: string; href: string }[]
  onClose: () => void
  emptyText: string
  cols?: 2 | 3
}) {
  if (!items.length) return <p className="px-3 text-[12px] text-ink-faint">{emptyText}</p>

  return (
    <div className={`grid gap-1.5 px-3 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          onClick={onClose}
          title={it.label}
          className="truncate rounded-lg border border-white/[0.08] px-2.5 py-[7px] text-center text-[12px]
            text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
        >
          {it.label}
        </Link>
      ))}
    </div>
  )
}
