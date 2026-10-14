'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronUp } from './Icons'

export default function ScrollToTop() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Cuộn lên đầu trang"
      title="Cuộn lên đầu trang"
      className={`fixed bottom-6 right-6 z-40 hidden h-11 w-11 place-items-center rounded-full
        border border-white/10 bg-base-850/90 text-ink shadow-lift backdrop-blur-xl
        transition-all duration-300 hover:border-accent/40 hover:bg-accent hover:text-white
        lg:grid ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
