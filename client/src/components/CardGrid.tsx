import MovieCard from './MovieCard'
import { Film } from './Icons'
import type { Movie } from '@/types'

interface Props {
  movies: Movie[]
}

export default function CardGrid({ movies }: Props) {
  if (!movies.length) {
    return (
      <div className="card-surface flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/[0.05] text-ink-faint">
          <Film className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-ink">Chưa có phim nào</p>
        <p className="mt-1 max-w-xs text-xs text-ink-faint">
          Thử đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
        </p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {movies.map((movie, i) => (
        <MovieCard key={movie.slug} movie={movie} index={i} />
      ))}
    </div>
  )
}
