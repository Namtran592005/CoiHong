import Link from 'next/link'
import { INTERESTS } from '@/lib/catalog'
import type { InterestIcon, InterestTint } from '@/lib/catalog'
import {
  Baby,
  Brain,
  Clapperboard,
  Compass,
  Flame,
  Ghost,
  GraduationCap,
  Heart,
  Landmark,
  Mic,
  Rocket,
  ScrollText,
  Search,
  Smile,
  Sparkles,
  Tv,
  Volume2,
  Zap,
} from './Icons'
import type { LucideIcon } from 'lucide-react'
import ScrollButtons from './ScrollButtons'

const ICONS: Record<InterestIcon, LucideIcon> = {
  flame: Flame,
  clapper: Clapperboard,
  volume: Volume2,
  mic: Mic,
  landmark: Landmark,
  brain: Brain,
  zap: Zap,
  smile: Smile,
  ghost: Ghost,
  heart: Heart,
  rocket: Rocket,
  search: Search,
  baby: Baby,
  graduation: GraduationCap,
  scroll: ScrollText,
  sparkles: Sparkles,
  tv: Tv,
  compass: Compass,
}

const TINTS: Record<InterestTint, string> = {
  rose: 'text-rose-300',
  amber: 'text-amber-300',
  violet: 'text-violet-300',
  sky: 'text-sky-300',
  emerald: 'text-emerald-300',
  indigo: 'text-indigo-300',
  orange: 'text-orange-300',
  yellow: 'text-yellow-300',
  red: 'text-red-300',
  pink: 'text-pink-300',
  cyan: 'text-cyan-300',
  teal: 'text-teal-300',
  lime: 'text-lime-300',
  blue: 'text-blue-300',
  stone: 'text-stone-300',
  fuchsia: 'text-fuchsia-300',
  slate: 'text-slate-300',
}

export default function InterestRow() {
  return (
    <section className="group/rail relative -mx-4 px-4 pt-1 sm:mx-0 sm:px-0">
      <h2 className="mb-3 text-[17px] font-semibold tracking-tight text-ink">
        Bạn đang quan tâm gì ?
      </h2>

      <div className="relative">
        <div
          id="rail-interest"
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
        {INTERESTS.map((item) => {
          const Icon = ICONS[item.icon]
          return (
            <Link
              key={item.label}
              href={item.to}
              className="group relative flex h-[104px] w-[190px] shrink-0 snap-start items-center overflow-hidden
                rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 backdrop-blur-xl
                transition-colors hover:border-white/[0.16] hover:bg-white/[0.07] sm:w-[214px] sm:h-[112px]"
            >
              <Icon
                strokeWidth={1.05}
                aria-hidden
                className={`pointer-events-none absolute right-2 top-1/2 h-[80px] w-[80px]
                -translate-y-1/2 opacity-[0.18] transition-all duration-300
                group-hover:scale-105 group-hover:opacity-[0.32] sm:h-[92px] sm:w-[92px] ${TINTS[item.tint]}`}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base-950/75 via-base-950/35 to-transparent"
              />
              <span className="relative z-10 max-w-full font-label line-clamp-2-safe text-[18px] font-bold uppercase leading-[1.2] tracking-tight text-ink [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] sm:text-[20px]">
                {item.label}
              </span>
            </Link>
          )
        })}
        </div>
        <ScrollButtons targetId="rail-interest" />
      </div>
    </section>
  )
}
