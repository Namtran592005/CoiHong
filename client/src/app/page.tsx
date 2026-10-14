import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import InterestRow from '@/components/InterestRow'
import ListRail from '@/components/ListRail'
import LogoMarquee from '@/components/LogoMarquee'
import PosterGrid from '@/components/PosterGrid'
import Row from '@/components/Row'
import TopMovies from '@/components/TopMovies'
import { getHome, listByCountry, listByType, listMovies } from '@/lib/api'

export const metadata: Metadata = {
  title: 'CoiHong — xem phim online miễn phí',
  description:
    'Xem phim online miễn phí, chất lượng cao, cập nhật mới nhất. Phim lẻ, phim bộ, hoạt hình, TV Show.',
  alternates: { canonical: '/' },
}

export const revalidate = 300

const PER_SECTION = 10

export default async function HomePage() {
  const [home, banner, top, phimLe, phimBo, hoatHinh, hanQuoc, trungQuoc] = await Promise.all([
    getHome(),
    listMovies({ limit: 24, sort_field: 'modified.time', sort_type: 'desc' }),
    listMovies({ limit: 10, sort_field: '_id', sort_type: 'desc' }),
    listByType('phim-le', { limit: PER_SECTION }),
    listByType('phim-bo', { limit: PER_SECTION }),
    listByType('hoat-hinh', { limit: 12 }),
    listByCountry('han-quoc', { limit: 10 }),
    listByCountry('trung-quoc', { limit: 10 }),
  ])

  const sections = home.sections.slice(0, 12)

  return (
    <>
      <Hero movies={banner.items} />

      <div className="container-app space-y-12 pb-20">
        <InterestRow />

        <TopMovies movies={top.items} href="/top-phim" railId="rail-top" />

        <Row
          title="Mới cập nhật"
          href="/danh-sach"
          note="Phim vừa thêm và cập nhật tập mới nhất"
          railId="rail-new"
          movies={sections}
        />

        <PosterGrid
          title="Phim Hàn Quốc"
          href="/quoc-gia/han-quoc"
          note={`${hanQuoc.items.length} phim mới nhất`}
          railId="rail-han-quoc"
          movies={hanQuoc.items}
        />
        <PosterGrid
          title="Phim Trung Quốc"
          href="/quoc-gia/trung-quoc"
          note={`${trungQuoc.items.length} phim mới nhất`}
          railId="rail-trung-quoc"
          movies={trungQuoc.items}
        />

        <ListRail
          title="Phim bộ đang cập nhật"
          href="/danh-sach/phim-bo"
          note="Theo dõi tập mới nhất của các phim nhiều tập"
          movies={phimBo.items}
        />

        <div className="space-y-10">
          <Row
            title="Phim lẻ"
            href="/danh-sach/phim-le"
            note="Phim điện ảnh chiếu rạp"
            railId="rail-phim-le"
            movies={phimLe.items}
          />
          <Row
            title="Hoạt hình"
            href="/danh-sach/hoat-hinh"
            note="Dành cho mọi lứa tuổi"
            railId="rail-hoat-hinh"
            movies={hoatHinh.items}
          />
        </div>
      </div>

      <LogoMarquee />
    </>
  )
}
