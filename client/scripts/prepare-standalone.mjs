import { cp, mkdir, rm, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const client = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const next = resolve(client, '.next')
const dest = resolve(next, 'standalone', 'client')

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

if (!(await exists(resolve(next, 'standalone', 'client', 'server.js')))) {
  console.error('Khong tim thay ban build standalone. Hay chay `next build` truoc.')
  process.exit(1)
}

await mkdir(resolve(dest, '.next'), { recursive: true })

await rm(resolve(dest, '.next', 'static'), { recursive: true, force: true })
await rm(resolve(dest, 'public'), { recursive: true, force: true })

await cp(resolve(next, 'static'), resolve(dest, '.next', 'static'), { recursive: true })
await cp(resolve(client, 'public'), resolve(dest, 'public'), { recursive: true })
await cp(resolve(next, 'BUILD_ID'), resolve(dest, '.next', 'BUILD_ID'))

console.log('Da chuan bi ban standalone: .next/static + public + BUILD_ID')