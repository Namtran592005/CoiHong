import type { Metadata } from 'next'
import BrowseView, { browseMetadata } from '@/components/BrowseView'
import type { SearchParams } from '@/components/Browse'
import { listMovies } from '@/lib/api'

export const revalidate = 180

const BASE = '/danh-sach'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  return browseMetadata(
    'Danh sách phim',
    'Xem toàn bộ phim lẻ, phim bộ, hoạt hình và TV Show. Lọc theo thể loại, quốc gia, năm và ngôn ngữ phụ đề.',
    BASE,
    searchParams,
  )
}

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <BrowseView heading="Danh sách phim" base={BASE} searchParams={searchParams} fetchList={listMovies} />
}
