const typeLabel: Record<string, string> = {
  single: 'Phim lẻ',
  series: 'Phim bộ',
  hoathinh: 'Hoạt hình',
  tvshows: 'TV Shows',
}

export function movieTypeLabel(type?: string): string {
  if (!type) return ''
  return typeLabel[type] ?? type
}

const statusLabel: Record<string, string> = {
  ongoing: 'Đang cập nhật',
  completed: 'Hoàn thành',
  trailer: 'Trailer',
}

export function movieStatusLabel(status?: string): string {
  if (!status) return ''
  return statusLabel[status] ?? status
}

export function stripHtml(html?: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}
