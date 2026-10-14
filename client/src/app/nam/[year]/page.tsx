import type { Metadata } from 'next'
import BrowseView, { browseMetadata } from '@/components/BrowseView'
import type { SearchParams } from '@/components/Browse'
import { listByYear } from '@/lib/api'

export const revalidate = 180

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const { year } = await params
  return browseMetadata(
    `Phim năm ${year}`,
    `Danh sách phim phát hành năm ${year} — phim lẻ, phim bộ, hoạt hình cập nhật trên CoiHong.`,
    `/nam/${year}`,
    searchParams,
  )
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>
  searchParams: Promise<SearchParams>
}) {
  const { year } = await params
  return (
    <BrowseView
      heading={`Phim năm ${year}`}
      base={`/nam/${year}`}
      searchParams={searchParams}
      fetchList={(f) => listByYear(Number(year), f)}
    />
  )
}
