'use client'

import { useEffect, useState } from 'react'
import { BrandLogo } from './Icons'

const KEY = 'coihong.splash.v2'
const MIN_MS = 700
const MAX_MS = 2600
const FADE_MS = 450

export default function SplashScreen() {
  const [leaving, setLeaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (document.documentElement.dataset.splash === 'done') return

    let finished = false
    const t0 = performance.now()

    const finish = () => {
      if (finished) return
      finished = true
      setLeaving(true)
      try {
        sessionStorage.setItem(KEY, 'done')
      } catch {}
      window.setTimeout(() => document.documentElement.setAttribute('data-splash', 'hidden'), FADE_MS)
    }

    let timer = 0
    const check = () => {
      if (finished) return
      const elapsed = performance.now() - t0
      if (elapsed >= MIN_MS || elapsed >= MAX_MS) finish()
      else timer = window.setTimeout(check, 60)
    }
    check()

    return () => window.clearTimeout(timer)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (document.documentElement.dataset.splash === 'done') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  return (
    <div
      aria-hidden
      className={`splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base-950
        transition-opacity duration-[450ms] ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.16) 0%, rgba(13,13,18,0) 70%)' }}
      />

      <div className={`relative flex flex-col items-center ${leaving ? 'scale-90' : 'scale-100'} transition-transform duration-500`}>
        <BrandLogo className="h-20 w-auto sm:h-24" sizes="180px" />

        <p
          className="mt-5 text-[13px] font-medium tracking-[0.28em] text-ink-faint animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          XEM PHIM MIỄN PHÍ
        </p>

        <div
          className="mt-6 h-[3px] w-40 overflow-hidden rounded-full bg-white/10 animate-fade-up"
          style={{ animationDelay: '260ms' }}
        >
          <div
            className="h-full w-0 rounded-full bg-accent"
            style={{ animation: `splash-fill ${MIN_MS}ms ease-out forwards` }}
          />
        </div>
      </div>
    </div>
  )
}