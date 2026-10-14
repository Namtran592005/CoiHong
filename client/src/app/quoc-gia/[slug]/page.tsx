import type { Metadata } from 'next'
import BrowseView, { browseMetadata } from '@/components/BrowseView'
import type { SearchParams } from '@/components/Browse'
import { listByCountry } from '@/lib/api'

export const revalidate = 180

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const { slug } = await params
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return browseMetadata(
    `Phim ${name}`,
    `Phim ${name} cập nhật mới nhất trên CoiHong — phim lẻ, phim bộ, hoạt hình. Lọc theo thể loại và năm.`,
    `/quoc-gia/${slug}`,
    searchParams,
  )
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}) {
  const { slug } = await params
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return (
    <BrowseView
      heading={name}
      description={`Sản phẩm từ ${name}`}
      base={`/quoc-gia/${slug}`}
      searchParams={searchParams}
      fetchList={(f) => listByCountry(slug, f)}
    />
  )
}
