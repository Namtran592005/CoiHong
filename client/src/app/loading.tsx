'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BrandLogo } from '@/components/Icons'

export default function Loading() {
  return (
    <div className="container-app pb-20 pt-10">
      <div className="mb-6 flex items-center gap-3 animate-fade-up">
        <Image src="/logo-96.webp" alt="" width={36} height={36} className="opacity-70" />
        <span className="text-sm text-ink-faint">Đang tải…</span>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[2/3]" />
            <div className="skeleton mt-2.5 h-3.5 w-4/5" />
            <div className="skeleton mt-2 h-2.5 w-1/2" />
          </div>
        ))}
      </div>

      <Link href="/" className="btn-subtle mt-8 inline-flex">
        <BrandLogo className="h-6" sizes="40px" />
        Về trang chủ
      </Link>
    </div>
  )
}
