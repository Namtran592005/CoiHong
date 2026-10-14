import type { Metadata } from 'next'
import Link from 'next/link'
import { getCountries } from '@/lib/api'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Quốc gia sản xuất',
  description: 'Phim theo quốc gia tại CoiHong: Hàn Quốc, Trung Quốc, Nhật Bản, Âu Mỹ, Thái Lan và hơn.',
  alternates: { canonical: '/quoc-gia' },
}

export default async function CountryIndexPage() {
  const countries = await getCountries()

  return (
    <div className="container-app pb-20 pt-8">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-ink">Quốc gia sản xuất</h1>
      <p className="mb-7 text-sm text-ink-faint">Chọn một mục để xem danh sách phim tương ứng.</p>

      {countries.length === 0 ? (
        <p className="text-sm text-ink-faint">Không tải được danh mục.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {countries.map((item, i) => (
            <Link
              key={item._id ?? item.id ?? item.slug}
              href={`/quoc-gia/${item.slug}`}
              className="chip animate-fade-up !px-4 !py-2 !text-sm"
              style={{ animationDelay: `${Math.min(i, 24) * 20}ms` }}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
