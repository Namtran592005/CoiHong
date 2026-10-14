'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  src?: string
  alt: string
  className?: string
  ratio?: string

  priority?: boolean

  fallbackSrc?: string
  sizes?: string
}

export default function Img({
  src,
  alt,
  className = '',
  ratio = '2 / 3',
  priority = false,
  fallbackSrc,
  sizes = '(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw',
}: Props) {
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    setUseFallback(false)
  }, [src])

  const activeSrc = useFallback && fallbackSrc ? fallbackSrc : src || fallbackSrc
  const hasImage = Boolean(activeSrc)

  return (
    <div
      className={`relative overflow-hidden bg-base-800 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {!hasImage && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-base-800 via-base-850 to-base-900 p-[18%]">
          <Image
            src="/logo-96.webp"
            alt=""
            aria-hidden
            width={96}
            height={96}
            className="max-h-full w-full object-contain opacity-25 blur-[0.3px]"
          />
        </div>
      )}

      {hasImage && (
        <Image
          src={activeSrc as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          draggable={false}
          onError={() => {
            if (!useFallback && fallbackSrc && fallbackSrc !== src) setUseFallback(true)
          }}
          className="object-cover"
        />
      )}
    </div>
  )
}
