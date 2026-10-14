import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const SAMPLES = 140

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 300000,
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 3500))

const values = []
let mauLoi = 0
const chiTiet = []

for (let i = 0; i < SAMPLES; i++) {
  const state = await page.evaluate(() => {
    const wrap = document.querySelector('main section > div')
    const imgs = Array.from(wrap?.querySelectorAll('img') ?? [])
    const hien = imgs.filter((i) => getComputedStyle(i).opacity !== '0')
    return {
      soAnh: imgs.length,
      soAnhHien: hien.length,
      file: hien[0]?.currentSrc.split('/').pop().slice(0, 24) ?? '(khong co)',
      tatCa: imgs
        .map((i) => `${i.currentSrc.split('/').pop().slice(0, 20)}@${getComputedStyle(i).opacity.slice(0, 4)}`)
        .join(' | '),
    }
  })

  const buf = await page.screenshot({ clip: { x: 1000, y: 120, width: 400, height: 260 }, type: 'png' })
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
  let sum = 0
  for (let j = 0; j < data.length; j += info.channels) {
    sum += 0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]
  }
  values.push(sum / (data.length / info.channels))

  if (state.soAnhHien === 0) {
    mauLoi++
    chiTiet.push(`  mau ${i}: ${state.tatCa}`)
  }

  await new Promise((r) => setTimeout(r, 250))
}

const min = Math.min(...values)
const avg = values.reduce((a, b) => a + b, 0) / values.length
const duoi20 = values.filter((v) => v < 20).length

console.log(`Banner trong ${(SAMPLES * 250) / 1000}s`)
console.log(`  do sang thap nhat ${min.toFixed(1)} | trung binh ${avg.toFixed(1)} | duoi 20: ${duoi20}/${SAMPLES}`)
console.log(`  MAU KHONG CO ANH NAO HIEN (loi that): ${mauLoi}/${SAMPLES}`)
if (mauLoi) console.log(chiTiet.slice(0, 10).join('\n'))
console.log(
  `\nLuu y: mau duoi 20 co the do anh goc toi san, khong phai loi - xem scripts/check-banner-src.mjs`,
)

await browser.close()