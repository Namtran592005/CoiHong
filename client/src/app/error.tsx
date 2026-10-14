'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Có lỗi xảy ra</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Không tải được dữ liệu trang này. Thử lại sau vài giây.
      </p>
      <button type="button" onClick={reset} className="btn-ghost mt-6">
        Thử lại
      </button>
    </div>
  )
}
