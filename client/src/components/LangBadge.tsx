import { Captions, Mic, Volume2 } from './Icons'
import type { LucideIcon } from 'lucide-react'
import type { Movie } from '@/types'

const LANGS: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  vs: { label: 'Vietsub', icon: Captions, cls: 'text-emerald-300' },
  tm: { label: 'Thuyết minh', icon: Mic, cls: 'text-violet-300' },
  lt: { label: 'Lồng tiếng', icon: Volume2, cls: 'text-sky-300' },
}

interface Props {
  movie: Pick<Movie, 'lang_key'>

  size?: 'sm' | 'md'
  className?: string
}

export default function LangBadge({ movie, size = 'md', className = '' }: Props) {
  const keys = (movie.lang_key ?? []).filter((k) => LANGS[k]).slice(0, 2)
  if (!keys.length) return null

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {keys.map((k) => {
        const { label, icon: Icon, cls } = LANGS[k]
        if (size === 'sm') {
          return (
            <span
              key={k}
              title={label}
              aria-label={label}
              className={`grid h-[19px] w-[19px] place-items-center rounded-[6px] border border-white/15 bg-black/70 backdrop-blur-md ${cls}`}
            >
              <Icon className="h-[11px] w-[11px]" />
            </span>
          )
        }
        return (
          <span
            key={k}
            title={label}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2 py-[3px] text-[10px] font-medium text-ink/90 backdrop-blur-md"
          >
            <Icon className={`h-3 w-3 ${cls}`} />
            {label}
          </span>
        )
      })}
    </div>
  )
}
