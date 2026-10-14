import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/api'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Thể loại phim',
  description: 'Danh mục thể loại phim tại CoiHong: hành động, tình cảm, kinh dị, hoạt hình và hơn.',
  alternates: { canonical: '/the-loai' },
}

export default async function CategoryIndexPage() {
  const categories = await getCategories()

  return (
    <div className="container-app pb-20 pt-8">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-ink">Thể loại phim</h1>
      <p className="mb-7 text-sm text-ink-faint">Chọn một mục để xem danh sách phim tương ứng.</p>

      {categories.length === 0 ? (
        <p className="text-sm text-ink-faint">Không tải được danh mục.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((item, i) => (
            <Link
              key={item._id ?? item.id ?? item.slug}
              href={`/the-loai/${item.slug}`}
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
