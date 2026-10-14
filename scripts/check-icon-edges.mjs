import sharp from 'sharp'
import { readdirSync } from 'node:fs'

const files = readdirSync('.').filter((f) => /^(icon-|og\.)/.test(f))

for (const f of files) {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const px = (x, y) => {
    const i = (info.width * y + x) * info.channels
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] }
  }
  const goc = [
    ['tren-trai', px(0, 0)],
    ['tren-phai', px(info.width - 1, 0)],
    ['duoi-trai', px(0, info.height - 1)],
    ['duoi-phai', px(info.width - 1, info.height - 1)],
    ['giua', px(Math.floor(info.width / 2), Math.floor(info.height / 2))],
  ]
  console.log(`\n${f}  ${info.width}x${info.height}`)
  for (const [ten, p] of goc) {
    const mo = p.a < 20
    console.log(
      `  ${ten.padEnd(10)} rgba(${p.r},${p.g},${p.b},${p.a})` +
        (mo ? '  (trong suot)' : p.r < 60 && p.g < 60 && p.b < 60 ? '  <-- DEN' : ''),
    )
  }
}