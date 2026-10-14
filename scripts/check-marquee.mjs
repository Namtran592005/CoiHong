import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, '.shots')
mkdirSync(outDir, { recursive: true })

const BASE = process.argv[2] || 'http://localhost:4173'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2500))

await page.evaluate(() => {
  document.querySelector('.animate-marquee')?.closest('section')?.scrollIntoView({ block: 'center' })
})
await new Promise((r) => setTimeout(r, 600))

const srcs = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('.animate-marquee img')].map((i) => i.getAttribute('src')))],
)

const anh = []
for (const src of srcs) {
  const res = await fetch(new URL(src, BASE))
  const body = res.ok ? await res.text() : ''
  anh.push({
    src,
    w: res.ok && body.includes('<svg') ? 24 : 0,
    bytes: body.length,
  })
}

const chay = await page.evaluate(async () => {
  const box = document.querySelector('.animate-marquee')
  const left = () => box.children[0].getBoundingClientRect().left
  const a = left()
  await new Promise((r) => setTimeout(r, 800))
  const b = left()
  return { a, b, dich: Math.round(a - b) }
})

const rong = await page.evaluate(() => {
  const box = document.querySelector('.animate-marquee')
  const row = box.children[0]
  return { row: Math.round(row.getBoundingClientRect().width), track: Math.round(box.getBoundingClientRect().width), win: window.innerWidth }
})

await page.screenshot({ path: resolve(outDir, 'marquee.png') })

await page.setViewport({ width: 2560, height: 900 })
await new Promise((r) => setTimeout(r, 900))
const rongLon = await page.evaluate(() => {
  const box = document.querySelector('.animate-marquee')
  return { row: Math.round(box.children[0].getBoundingClientRect().width), win: window.innerWidth }
})
await page.screenshot({ path: resolve(outDir, 'marquee-2560.png') })
await browser.close()

const hong = anh.filter((a) => a.w === 0)
console.log('Tong so anh:', anh.length)
console.log('Anh hong:', hong.length, hong.map((h) => h.src).join(', '))
console.log('Dich chuyen sau 800ms:', chay.dich, 'px')
console.log('Rong 1 day @1280:', JSON.stringify(rong), 'dayLonHonKhung =', rong.row > rong.win)
console.log('Rong 1 day @2560:', JSON.stringify(rongLon), 'dayLonHonKhung =', rongLon.row > rongLon.win)