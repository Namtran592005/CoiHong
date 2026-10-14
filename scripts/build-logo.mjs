import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'client/public')
const src = resolve(root, 'logo.png')

mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const px = data
const total = info.width * info.height

let minX = info.width
let maxX = -1
let minY = info.height
let maxY = -1

for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    const r = px[i]
    const g = px[i + 1]
    const b = px[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b

    let alpha = px[i + 3]

    if (lum > 242) alpha = 0
    // Làm mềm vùng biên để không viền trắng
    else if (lum > 225) alpha = Math.round(alpha * ((242 - lum) / 17))
    // Pixel đen tuyệt đối cũng là nền (logo nền đen)
    else if (lum < 12) alpha = 0

    px[i + 3] = alpha

    if (alpha > 24) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}

const pad = 8
const left = Math.max(0, minX - pad)
const top = Math.max(0, minY - pad)
const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2)
const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2)

const trimmed = await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract({ left, top, width, height })
  .png({ compressionLevel: 9 })
  .toBuffer()

const meta = await sharp(trimmed).metadata()
console.log(`Nội dung: ${maxX - minX + 1}x${maxY - minY + 1} / gốc ${info.width}x${info.height}`)
console.log(`Sau cắt: ${width}x${height}`)

const sizes = {
  'logo-192.png': 192,
  'logo-512.png': 512,
  'favicon-64.png': 64,
}

for (const [name, size] of Object.entries(sizes)) {
  const inner = Math.round(size * 0.82)
  const buf = await sharp(trimmed)
    .resize({ width: inner })
    .extend({
      top: Math.round((size - inner) * 0.62),
      bottom: Math.round((size - inner) * 0.38),
      left: Math.round((size - inner) / 2),
      right: Math.round((size - inner) / 2),
      background: '#14100a',
    })
    .resize({ width: size, height: size, fit: 'fill' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer()
  const { writeFileSync } = await import('node:fs')
  writeFileSync(resolve(outDir, name), buf)
  console.log(`${name}: ${size}x${size}, ${(buf.length / 1024).toFixed(1)} KB`)
}

const webp = await sharp(trimmed)
  .resize({ width: 420 })
  .webp({ quality: 88, alphaQuality: 100 })
  .toBuffer()
const { writeFileSync } = await import('node:fs')
writeFileSync(resolve(outDir, 'logo.webp'), webp)
const wm = await sharp(webp).metadata()
console.log(`logo.webp: ${wm.width}x${wm.height} (${(webp.length / 1024).toFixed(1)} KB)`)

const og = await sharp(trimmed)
  .resize({ width: 512, fit: 'inside' })
  .extend({
    top: 90, bottom: 90, left: 110, right: 110,
    background: '#0d0d12',
  })
  .webp({ quality: 82 })
  .toBuffer()
writeFileSync(resolve(outDir, 'og.webp'), og)
console.log(`og.webp: ${(og.length / 1024).toFixed(1)} KB`)
console.log(`Tổng pixel đã xử lý: ${total.toLocaleString()}`)