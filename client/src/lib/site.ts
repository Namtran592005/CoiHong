import 'server-only'

import { headers } from 'next/headers'

function chuanHoa(u: string): string {
  return u.replace(/\/+$/, '')
}

export function siteUrlFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return null
  try {
    return chuanHoa(new URL(raw).origin + new URL(raw).pathname)
  } catch {
    return null
  }
}

export async function siteUrlFromRequest(): Promise<string> {
  const h = await headers()

  const host =
    h.get('x-forwarded-host')?.split(',')[0].trim() || h.get('host')?.trim()

  if (!host) return 'http://localhost:3000'

  const proto =
    h.get('x-forwarded-proto')?.split(',')[0].trim() ||
    (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https')

  return `${proto}://${host}`
}

export async function resolveSiteUrl(): Promise<string> {
  return siteUrlFromEnv() ?? (await siteUrlFromRequest())
}

export function siteUrlForMetadata(): string | null {
  return siteUrlFromEnv()
}