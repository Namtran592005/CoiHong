export type MovieType = 'single' | 'series' | 'hoathinh' | 'tvshows'

export interface Category {
  id?: string
  _id?: string
  name: string
  slug: string
}

export interface Country extends Category {}

export interface Episode {
  name: string
  slug?: string
  filename?: string
  link_embed?: string
  link_m3u8?: string
}

export interface EpisodeServer {
  server_name: string
  is_ai?: boolean
  server_data: Episode[]
}

export interface Movie {
  _id: string
  name: string
  slug: string
  origin_name?: string
  alternative_names?: string[]
  content?: string
  type?: MovieType | string
  status?: string
  thumb_url?: string
  poster_url?: string
  trailer_url?: string
  time?: string
  episode_current?: string | number
  episode_total?: number | string
  quality?: string
  lang?: string
  lang_key?: string[]
  year?: number
  view?: number
  actor?: string[]
  director?: string[]
  category?: Category[]
  country?: Country[]
  modified?: { time: string }
  episodes?: EpisodeServer[]
  last_episodes?: { server_name: string; is_ai?: boolean; name: string }[]
  tmdb?: { id: string | number; type: string; season?: number; vote_average?: number }
  imdb?: { id: string | null; vote_average?: number }
}

export interface Pagination {
  totalItems: number
  totalItemsPerPage: number
  currentPage: number
  totalPages: number
}

export interface Paginated {
  items: Movie[]
  pagination: Pagination
}

export interface People {
  tmdb_people_id: number
  name: string
  original_name?: string
  character?: string
  profile_path?: string
  known_for_department?: string
  job?: string
}

export interface PeopleResponse {
  people: People[]
  profileSizes: Record<string, string>
}

export interface Keyword {
  tmdb_keyword_id?: number
  name?: string
  name_vn?: string
}

export interface KeywordResponse {
  keywords: Keyword[]
}

export type SortLang = 'vietsub' | 'thuyet-minh' | 'long-tieng'
export type SortType = 'asc' | 'desc'

export interface ListFilters {
  page?: number
  limit?: number
  category?: string
  country?: string
  year?: string
  sort_field?: 'modified.time' | '_id' | 'year'
  sort_type?: SortType
  sort_lang?: SortLang
}
