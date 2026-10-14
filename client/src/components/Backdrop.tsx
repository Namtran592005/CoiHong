import Image from 'next/image'
import { BrandLogo } from './Icons'

interface Props {
  src?: string
  alt?: string
  className?: string

  priority?: boolean

  position?: string
}

export default function Backdrop({
  src,
  alt = '',
  className = '',
  priority = false,
  position = 'center top',
}: Props) {
  const hasImage = Boolean(src)

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(120% 90% at 20% 10%, #1b1b26 0%, #101017 45%, #0a0a0f 100%)',
      }}
    >
      {!hasImage && (
        <div className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-6">
          <BrandLogo sizes="200px" className="h-20 opacity-[0.08]" />
        </div>
      )}

      {hasImage && (
        <Image
          src={src as string}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          draggable={false}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: position }}
        />
      )}
    </div>
  )
}

export function Grain({ soft = false }: { soft?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${soft ? 'grain-soft grain' : 'grain'}`}
    />
  )
}
