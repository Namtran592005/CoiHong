import sharp from 'sharp'
import { mkdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'client/public')
mkdirSync(outDir, { recursive: true })

const CANDIDATES = [resolve(root, 'logo.webp'), resolve(outDir, 'logo.webp')]
const SRC = CANDIDATES.find((p) => {
  try {
    return statSync(p).size > 0
  } catch {
    return false
  }
})
if (!SRC) throw new Error('Không tìm thấy logo.webp ở thư mục gốc hoặc client/public')

const srcMeta = await sharp(SRC).metadata()
console.log(`Nguồn: ${SRC.replace(root + '\\', '')} ${srcMeta.width}x${srcMeta.height}`)

async function trimmedLogo() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width
  let maxX = -1
  let minY = info.height
  let maxY = -1
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 16) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) throw new Error('logo.webp trong suốt hoàn toàn, không có nội dung')
  const pad = 4
  const left = Math.max(0, minX - pad)
  const top = Math.max(0, minY - pad)
  const width = Math.min(info.width - left, maxX - minX + 1 + pad * 2)
  const height = Math.min(info.height - top, maxY - minY + 1 + pad * 2)
  const buf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left, top, width, height })
    .webp({ quality: 100, alphaQuality: 100 })
    .toBuffer()
  console.log(`  nội dung ${maxX - minX + 1}x${maxY - minY + 1} -> sau cắt ${width}x${height}`)
  return buf
}

const LOGO = await trimmedLogo()
writeFileSync(resolve(outDir, 'logo.webp'), LOGO)

const WIDTHS = [64, 96, 128, 180, 240, 320, 420, 560]

for (const w of WIDTHS) {
  const buf = await sharp(LOGO)
    .resize({ width: w })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer()
  writeFileSync(resolve(outDir, `logo-${w}.webp`), buf)
  console.log(`  logo-${w}.webp  ${(buf.length / 1024).toFixed(1)} KB`)
}

const SQ = [64, 180, 192, 512]
for (const size of SQ) {
  const buf = await sharp(LOGO)
    // contain: giữ nguyên tỉ lệ logo, thừa chỗ thành trong suốt, không méo.
    // withoutEnlargement tránh phóng logo 420px lên 512px làm vỡ nét.
    .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
  writeFileSync(resolve(outDir, `icon-${size}.png`), buf)
  console.log(`  icon-${size}.png   ${(buf.length / 1024).toFixed(1)} KB`)
}

for (const size of [64, 180, 512]) {
  const buf = await sharp(LOGO)
    .resize({ width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toBuffer()
  writeFileSync(resolve(outDir, `icon-${size}.webp`), buf)
  console.log(`  icon-${size}.webp  ${(buf.length / 1024).toFixed(1)} KB`)
}

const og = await sharp(LOGO)
  .resize({ width: 1200, height: 630, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 90, alphaQuality: 100, effort: 6 })
  .toBuffer()
writeFileSync(resolve(outDir, 'og.webp'), og)
console.log(`  og.webp          ${(og.length / 1024).toFixed(1)} KB`)

console.log('xong')