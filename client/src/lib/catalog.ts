import type { Category, Country } from '../types'
import {
  Bookmark,
  Clapperboard,
  Flame,
  Home,
  LayoutGrid,
  MonitorPlay,
  Sparkles,
  Tv,
} from '../components/Icons'

export const MOVIE_TYPES = [
  { slug: 'phim-le', label: 'Phim lẻ', desc: 'Phim điện ảnh chiếu rạp', icon: Clapperboard },
  { slug: 'phim-bo', label: 'Phim bộ', desc: 'Phim nhiều tập, serial', icon: Tv },
  { slug: 'hoat-hinh', label: 'Hoạt hình', desc: 'Animation cho mọi lứa tuổi', icon: Sparkles },
  { slug: 'tv-shows', label: 'TV Shows', desc: 'Chương trình truyền hình', icon: MonitorPlay },
] as const

export const SUBTITLES = [
  { slug: 'vietsub', label: 'Vietsub', desc: 'Phụ đề tiếng Việt' },
  { slug: 'thuyet-minh', label: 'Thuyết minh', desc: 'Lồng tiếng Việt' },
  { slug: 'long-tieng', label: 'Lồng tiếng', desc: 'Bản gốc, không phụ đề' },
] as const

export type Catalog = {
  categories: Category[]
  countries: Country[]
  years: number[]
}

export const SIDEBAR_YEARS = 24

export const INTERESTS = [
  { to: '/danh-sach?sort=modified.time', label: 'Hot', icon: 'flame', tint: 'rose' },
  { to: '/danh-sach/phim-le', label: 'Chiếu rạp', icon: 'clapper', tint: 'amber' },
  { to: '/danh-sach?lang=long-tieng', label: 'Lồng tiếng', icon: 'volume', tint: 'violet' },
  { to: '/danh-sach?lang=thuyet-minh', label: 'Thuyết minh', icon: 'mic', tint: 'sky' },
  { to: '/the-loai/co-trang', label: 'Cổ trang', icon: 'landmark', tint: 'emerald' },
  { to: '/the-loai/tam-ly', label: 'Tâm lý', icon: 'brain', tint: 'indigo' },
  { to: '/the-loai/hanh-dong', label: 'Hành động', icon: 'zap', tint: 'orange' },
  { to: '/the-loai/hai-huoc', label: 'Hài hước', icon: 'smile', tint: 'yellow' },
  { to: '/the-loai/kinh-di', label: 'Kinh dị', icon: 'ghost', tint: 'red' },
  { to: '/the-loai/tinh-cam', label: 'Tình cảm', icon: 'heart', tint: 'pink' },
  { to: '/the-loai/vien-tuong', label: 'Viễn tưởng', icon: 'rocket', tint: 'cyan' },
  { to: '/the-loai/bi-an', label: 'Bí ẩn', icon: 'search', tint: 'teal' },
  { to: '/the-loai/tre-em', label: 'Trẻ em', icon: 'baby', tint: 'lime' },
  { to: '/the-loai/hoc-duong', label: 'Học đường', icon: 'graduation', tint: 'blue' },
  { to: '/the-loai/lich-su', label: 'Lịch sử', icon: 'scroll', tint: 'stone' },
  { to: '/danh-sach/hoat-hinh', label: 'Hoạt hình', icon: 'sparkles', tint: 'fuchsia' },
  { to: '/danh-sach/phim-bo', label: 'Phim bộ', icon: 'tv', tint: 'slate' },
  { to: '/the-loai/phieu-luu', label: 'Phiêu lưu', icon: 'compass', tint: 'orange' },
] as const

export type InterestIcon = (typeof INTERESTS)[number]['icon']
export type InterestTint = (typeof INTERESTS)[number]['tint']

export const QUICK_LINKS = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/hot', label: 'Phim HOT', icon: Flame },
  { to: '/top-phim', label: 'Top phim', icon: Flame },
  { to: '/danh-sach', label: 'Tất cả phim', icon: LayoutGrid },
  { to: '/tim-kiem', label: 'Tìm kiếm', icon: LayoutGrid },
  { to: '/quan-tainh', label: 'Yêu thích', icon: Bookmark },
]

export function browseUrl(
  base: string,
  params: Record<string, string | undefined> = {},
): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v)
  const query = qs.toString()
  return query ? `${base}?${query}` : base
}