'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from './Icons'

export default function ScrollButtons({ targetId }: { targetId: string }) {
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    const update = () => {
      setAtStart(el.scrollLeft <= 4)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    const ro = new ResizeObserver(update)
    ro.observe(el)
    for (const img of Array.from(el.querySelectorAll('img'))) ro.observe(img)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [targetId])

  const scrollBy = useCallback(
    (dir: number) => {
      const el = document.getElementById(targetId)
      if (!el) return
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
    },
    [targetId],
  )

  const base =
    'absolute top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full ' +
    'border border-white/10 bg-base-900/85 text-ink backdrop-blur-md ' +
    'transition-all duration-200 hover:border-accent/50 hover:bg-accent hover:text-white lg:grid'

  return (
    <>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Cuộn sang trái"
        className={`${base} -left-4 ${
          atStart
            ? 'pointer-events-none opacity-0'
            : 'opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Cuộn sang phải"
        className={`${base} -right-4 ${
          atEnd
            ? 'pointer-events-none opacity-0'
            : 'opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </>
  )
}
