import Link from 'next/link'
import { AlertTriangle, Compass } from './Icons'

interface Props {
  message?: string
}

export function ErrorBlock({ message }: Props) {
  return (
    <div className="card-surface flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-ink">Không tải được dữ liệu</p>
      <p className="mt-1 max-w-sm text-xs text-ink-faint">
        {message || 'Đường dẫn không ổn định. Bạn có thể thử lại sau vài giây.'}
      </p>
    </div>
  )
}

export function EmptyBlock({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}

export function EmptyWatchlist() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-col items-center px-6 pb-10 pt-10 text-center">
        <div
          aria-hidden
          className="mb-8 grid w-[260px] grid-cols-5 gap-2 [mask-image:linear-gradient(to_bottom,#000_45%,transparent_100%)]"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-[6px] border border-dashed border-white/[0.18] bg-white/[0.04]"
              style={{
                transform: i % 5 === 0 ? 'translateY(4px)' : i % 5 === 4 ? 'translateY(-4px)' : 'none',
              }}
            />
          ))}
        </div>

        <p className="text-base font-semibold tracking-tight text-ink">
          Chưa có phim nào trong thư viện
        </p>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-faint">
          Bấm biểu tượng ghim ở trang chi tiết phim để lưu lại xem sau.
          Danh sách lưu ngay trên máy này, không cần đăng nhập.
        </p>

        <Link href="/" className="btn-primary mt-6 !px-5 !py-2.5">
          <Compass className="h-4 w-4" aria-hidden />
          Khám phá phim
        </Link>
      </div>
    </div>
  )
}

export function NotFoundBlock() {
  return (
    <div className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold tracking-tight text-ink">404</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-muted">
        Không tìm thấy trang bạn yêu cầu. Có thể phim đã bị gỡ hoặc đường dẫn không đúng.
      </p>
      <div className="mt-7 flex gap-2.5">
        <Link href="/" className="btn-primary !px-5 !py-2.5">
          Về trang chủ
        </Link>
        <Link href="/tim-kiem" className="btn-ghost !px-5 !py-2.5">
          Tìm phim
        </Link>
      </div>
    </div>
  )
}
