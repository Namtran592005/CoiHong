export default function PlayBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-12 w-12' : 'h-11 w-11'
  const icon = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-[18px] w-[18px]'

  return (
    <span
      className={`grid ${box} place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/25 backdrop-blur-md`}
    >
      <svg viewBox="0 0 24 24" className={`ml-0.5 ${icon}`} fill="currentColor" aria-hidden>
        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.14-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
      </svg>
    </span>
  )
}
