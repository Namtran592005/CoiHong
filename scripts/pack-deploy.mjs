import { cp, mkdir, rm, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const client = resolve(root, 'client')
const next = resolve(client, '.next')
const out = resolve(root, 'dist', 'coihong')

const srcStandalone = process.argv[2]
const srcStatic = process.argv[3]
const srcPublic = process.argv[4]

if (!srcStandalone || !existsSync(srcStandalone)) {
  console.error('Can duong dan thu muc standalone. Vi du: node scripts/pack-deploy.mjs <standalone> <static> <public>')
  process.exit(1)
}

console.log('Dung goi tai:')
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })

await cp(srcStandalone, out, { recursive: true })
await cp(srcStatic, join(out, 'client', '.next', 'static'), { recursive: true })
await cp(srcPublic, join(out, 'client', 'public'), { recursive: true })
await cp(join(srcStandalone, 'client', '.next', 'BUILD_ID'), join(out, 'client', '.next', 'BUILD_ID'))
await cp(resolve(client, 'deploy'), join(out, 'deploy'), { recursive: true })
await cp(resolve(dirname(fileURLToPath(import.meta.url)), 'deploy-readme.md'), resolve(out, 'README-deploy.md'))

async function size(dir) {
  let total = 0
  let n = 0
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      const s = await size(p)
      total += s.total
      n += s.files
    } else {
      total += (await stat(p)).size
      n += 1
    }
  }
  return { total, files: n }
}

const { total, files } = await size(out)
console.log(`  ${files} file, ${(total / 1024 / 1024).toFixed(1)} MB`)
console.log(`  -> ${out}`)