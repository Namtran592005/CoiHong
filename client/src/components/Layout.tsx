'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import SplashScreen from './SplashScreen'
import type { Category, Country } from '@/types'

interface Props {
  children: React.ReactNode
  categories: Category[]
  countries: Country[]
  years: number[]
  currentYear: number
}

export default function Layout({ children, categories, countries, years, currentYear }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-base-950">
      <SplashScreen />
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        countries={countries}
        years={years}
        currentYear={currentYear}
      />

      <main className="flex-1 pb-24 sm:pb-0">{children}</main>

      <Footer categories={categories} countries={countries} year={currentYear} />
      <ScrollToTop />
    </div>
  )
}
