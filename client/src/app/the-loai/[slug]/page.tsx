import type { Metadata } from 'next'
import BrowseView, { browseMetadata } from '@/components/BrowseView'
import type { SearchParams } from '@/components/Browse'
import { listByCategory } from '@/lib/api'

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
    `Danh sách phim thể loại ${name} — cập nhật mới nhất, lọc theo quốc gia, năm và ngôn ngữ phụ đề.`,
    `/the-loai/${slug}`,
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
      description={`Thể loại ${name.toLowerCase()}`}
      base={`/the-loai/${slug}`}
      searchParams={searchParams}
      fetchList={(f) => listByCategory(slug, f)}
    />
  )
}
