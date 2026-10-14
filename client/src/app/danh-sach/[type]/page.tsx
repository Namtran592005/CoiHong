import type { Metadata } from 'next'
import BrowseView, { browseMetadata } from '@/components/BrowseView'
import type { SearchParams } from '@/components/Browse'
import { TYPE_LABELS } from '@/components/Browse'
import { listByType } from '@/lib/api'

export const revalidate = 180

const TYPES = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows']

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const { type } = await params
  const label = TYPE_LABELS[type] ?? 'Phim'
  return browseMetadata(
    `${label} — Danh sách phim`,
    `Danh sách ${label.toLowerCase()} cập nhật mới nhất trên CoiHong. Lọc theo thể loại, quốc gia, năm và ngôn ngữ.`,
    `/danh-sach/${type}`,
    searchParams,
  )
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<SearchParams>
}) {
  const { type } = await params
  const base = `/danh-sach/${type}`
  return (
    <BrowseView
      heading={TYPE_LABELS[type] ?? 'Danh sách phim'}
      base={base}
      searchParams={searchParams}
      fetchList={(f) => listByType(type, f)}
    />
  )
}
