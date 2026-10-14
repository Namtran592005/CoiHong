import Link from 'next/link'
import type { ReactNode } from 'react'

interface Props {
  title: string

  lead?: ReactNode

  parent?: { label: string; to: string }
  children: ReactNode
}

export default function StaticPage({ title, lead, parent, children }: Props) {
  return (
    <div className="container-app pb-20 pt-8">
      <nav
        aria-label="Breadcrumb"
        className="no-scrollbar -mx-1 mb-4 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 text-xs text-ink-faint"
      >
        <Link href="/" className="shrink-0 transition-colors hover:text-ink">
          Trang chủ
        </Link>
        <span aria-hidden className="shrink-0">
          /
        </span>
        {parent && (
          <>
            <Link href={parent.to} className="shrink-0 transition-colors hover:text-ink">
              {parent.label}
            </Link>
            <span aria-hidden className="shrink-0">
              /
            </span>
          </>
        )}
        <span aria-current="page" className="shrink-0 text-ink-muted">
          {title}
        </span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {lead && <div className="mt-3 text-[15px] leading-relaxed text-ink-muted">{lead}</div>}
      </header>

      <div className="max-w-3xl space-y-6">{children}</div>
    </div>
  )
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="mb-2.5 text-[17px] font-semibold tracking-tight text-ink">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  )
}
