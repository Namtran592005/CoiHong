export {
  Search,
  Menu,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Film,
  Clapperboard,
  Tv,
  Sparkles,
  Globe,
  CalendarDays,
  Languages,
  LayoutGrid,
  ListFilter,
  Heart,
  Home,
  Info,
  Users,
  Star,
  TrendingUp,
  ArrowLeft,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Volume1,
  Gauge,
  PictureInPicture2,
  RotateCcw,
  RotateCw,
  SkipForward,
  SkipBack,
  PlayCircle,
  AlertTriangle,
  Loader2,
  Compass,
  Flame,
  Clock,
  Captions,
  MonitorPlay,
  Server,
  ScrollText,
  Mail,
  Send,
  MessageCircle,
  ShieldCheck,
  Zap,
  CircleHelp,
  CircleUser,
  Rss,
  Tag,
  Code2,
  SlidersHorizontal,
  Baby,
  Brain,
  Ghost,
  GraduationCap,
  Landmark,
  Mic,
  Rocket,
  Smile,
  CheckCircle2,
  Bug,
  KeyRound,
  Ban,
  FileText,
} from 'lucide-react'

import type { LucideProps } from 'lucide-react'
import { Play as PlayIconBase } from 'lucide-react'

export function BrandLogo({
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 40px, 56px',
}: {
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <img
      src="/logo-240.webp"
      srcSet="/logo-96.webp 96w, /logo-128.webp 128w, /logo-180.webp 180w, /logo-240.webp 240w, /logo-320.webp 320w, /logo-420.webp 420w"
      sizes={sizes}
      alt="CoiHong"
      width={1052}
      height={694}
      loading="eager"
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={`h-auto w-auto object-contain ${className}`}
    />
  )
}

export function PlayGlyph(props: LucideProps) {
  return <PlayIconBase {...props} fill="currentColor" />
}