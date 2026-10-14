import Link from 'next/link'
import type { Category, Country } from '@/types'
import { BrandLogo, FileText, Info, Mail, ShieldCheck } from './Icons'

const QUICK = [
  { to: '/', label: 'Trang chủ' },
  { to: '/hot', label: 'Phim HOT' },
  { to: '/top-phim', label: 'Top phim' },
  { to: '/danh-sach', label: 'Tất cả phim' },
  { to: '/tim-kiem', label: 'Tìm kiếm' },
  { to: '/quan-tainh', label: 'Yêu thích' },
]

const INFO = [
  { to: '/gioi-thieu', label: 'Giới thiệu', icon: Info },
  { to: '/lien-he', label: 'Liên hệ', icon: Mail },
  { to: '/chinh-sach-rieng-tu', label: 'Chính sách riêng tư', icon: ShieldCheck },
  { to: '/dmca', label: 'DMCA & bản quyền', icon: FileText },
]

interface Props {
  categories: Category[]
  countries: Country[]
  year: number
}

export default function Footer({ categories, countries, year }: Props) {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.07] bg-base-900/60">
      <FooterSky />

      <div className="container-app relative py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block" aria-label="CoiHong — trang chủ">
              <BrandLogo className="h-12" sizes="180px" />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              Xem phim online miễn phí, cập nhật hằng ngày. Giao diện tối dễ chịu, mở được trên
              điện thoại và máy tính.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <FooterCol title="Khám phá">
              {QUICK.map((l) => (
                <FooterLink key={l.to} to={l.to}>
                  {l.label}
                </FooterLink>
              ))}
            </FooterCol>

            <FooterCol title="Thể loại">
              {categories.slice(0, 5).map((c) => (
                <FooterLink key={c._id ?? c.id ?? c.slug} to={`/the-loai/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </FooterCol>

            <FooterCol title="Quốc gia">
              {countries.slice(0, 5).map((c) => (
                <FooterLink key={c._id ?? c.id ?? c.slug} to={`/quoc-gia/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </FooterCol>

            <FooterCol title="Về CoiHong">
              {INFO.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    href={to}
                    className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition-colors hover:text-accent"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </FooterCol>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/[0.07] pt-5">
          <p className="text-xs text-ink-faint">© {year} CoiHong</p>
        </div>
      </div>
    </footer>
  )
}

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const STAR5 =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

const SPARK4 = 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)'

function FooterSky() {
  const rnd = makeRng(20241219)

  const glows = [
    { left: '16%', top: '-34%', size: 680, op: 0.26 },
    { left: '66%', top: '-8%', size: 520, op: 0.2 },
    { left: '94%', top: '34%', size: 460, op: 0.15 },
  ]

  const lines = Array.from({ length: 7 }, () => {
    const top = rnd() * 100
    const left = rnd() * 60
    const angle = -28 + rnd() * 26
    const len = 22 + rnd() * 46
    return { top, left, angle, len, op: 0.09 + rnd() * 0.1 }
  })

  const stars = Array.from({ length: 64 }, (_, i) => {
    const spark = i % 9 === 0
    const size = spark ? 7 + rnd() * 6 : 2 + rnd() * 4
    return {
      left: rnd() * 100,
      top: rnd() * 100,
      size,
      spark,

      red: rnd() > 0.66,
      op: spark ? 0.34 + rnd() * 0.16 : 0.14 + rnd() * 0.26,
    }
  })

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {glows.map((g, i) => (
        <div
          key={`g${i}`}
          className="absolute rounded-full"
          style={{
            left: g.left,
            top: g.top,
            width: g.size,
            height: g.size,
            marginLeft: -g.size / 2,
            marginTop: -g.size / 2,
            opacity: g.op,
            mixBlendMode: 'screen',
            background:
              'radial-gradient(circle, #da251d 0%, rgba(218,37,29,0.35) 45%, rgba(218,37,29,0) 70%)',
          }}
        />
      ))}

      {lines.map((l, i) => (
        <div
          key={`l${i}`}
          className="absolute h-px"
          style={{
            top: `${l.top}%`,
            left: `${l.left}%`,
            width: `${l.len}%`,
            opacity: l.op,

            background:
              'linear-gradient(to right, rgba(218,37,29,0) 0%, rgba(218,37,29,0.75) 35%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0) 100%)',
            transform: `rotate(${l.angle}deg)`,
          }}
        />
      ))}

      {stars.map((s, i) => (
        <div
          key={`s${i}`}
          className="absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.op,
            background: s.red ? '#ff5a4e' : '#ffffff',
            clipPath: s.spark ? SPARK4 : STAR5,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-base-950/30" />
    </div>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {title}
      </h2>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={to}
        className="text-[13px] text-ink-muted transition-colors hover:text-accent"
      >
        {children}
      </Link>
    </li>
  )
}
