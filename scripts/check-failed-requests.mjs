

import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const ROUTE = process.argv[3] || '/'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 860 })

const bad = []
page.on('response', (r) => {
  if (r.status() >= 400) bad.push({ status: String(r.status()), url: r.url() })
})
page.on('requestfailed', (r) => {
  bad.push({ status: 'net', url: r.url(), lydo: r.failure()?.errorText ?? '' })
})

await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' })
await wait(2500)

await page.evaluate(async () => {
  const h = document.body.scrollHeight
  for (let y = 0; y < h; y += 800) {
    window.scrollTo({ top: y, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 400))
  }
})
await wait(2000)

await browser.close()

const huyn = bad.filter((b) => b.status === 'net' && /ABORTED/i.test(b.lydo))
const thatBai = bad.filter((b) => !huyn.includes(b))

if (!thatBai.length) {
  console.log(`${ROUTE} — sach (${huyn.length} prefetch bi huy khi dong trinh duyet)`)
} else {
  console.log(`${ROUTE} — ${thatBai.length} request that bai:`)

  const gom = new Map()
  for (const b of thatBai) {
    const key = `${b.status} ${b.url}`
    gom.set(key, (gom.get(key) ?? 0) + 1)
  }
  for (const [key, n] of gom) console.log(`  x${n}  ${key}`)
}