import type { ReactNode } from 'react'

export default function PageBanner({
  eyebrow,
  title,
  meta,
  icon: Icon,
  children,
}: {
  eyebrow?: string
  title: string

  meta?: ReactNode

  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>

  children?: ReactNode
}) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/[0.06]">
      <img
        src="/earth-1920.jpg"
        alt=""
        aria-hidden
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70"
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(8,8,11,0.92) 0%, rgba(8,8,11,0.55) 55%, #08080b 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(8,8,11,0.85) 0%, rgba(8,8,11,0.3) 55%, rgba(8,8,11,0) 100%)',
        }}
      />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="container-app relative flex flex-wrap items-end justify-between gap-4 pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent/80">
              {eyebrow}
            </p>
          )}
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-ink sm:text-[32px] sm:leading-[1.15]">
            {Icon && <Icon className="h-6 w-6 shrink-0 text-accent sm:h-7 sm:w-7" aria-hidden />}
            <span className="min-w-0">{title}</span>
          </h1>
          {meta && <div className="mt-2 text-sm text-ink-faint">{meta}</div>}
        </div>

        {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
      </div>
    </header>
  )
}