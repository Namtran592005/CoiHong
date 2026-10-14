const CDN_FALLBACK = 'https://phimimg.com'
const TMDB_IMG = 'https://image.tmdb.org/t/p'

export function imageUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const clean = path.replace(/^\/+/, '')
  if (clean.startsWith('data:')) return path
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+\//i.test(clean)) return ''
  return `${CDN_FALLBACK}/${clean}`
}

export function personImage(profilePath?: string | null, size = 'w185'): string {
  if (!profilePath) return ''
  if (/^https?:\/\//i.test(profilePath)) return profilePath
  return `${TMDB_IMG}/${size}${profilePath.startsWith('/') ? '' : '/'}${profilePath}`
}
