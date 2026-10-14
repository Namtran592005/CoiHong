import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.evaluate(async () => {
  await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister()))
  await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
})

async function warmup() {
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await wait(600)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await wait(1200)
}

async function probe(label, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2' })
  await warmup()

  const data = await page.evaluate(() => {
    const broken = []
    const placeholder = []
    for (const i of document.images) {
      const r = i.getBoundingClientRect()
      if (r.width < 2) continue
      const src = i.currentSrc || ''
      if (!src) continue
      if (i.naturalWidth === 0) {
        if (/\/logo-\d+\.webp$/.test(src)) placeholder.push(src)
        else broken.push(src)
      }
    }
    return { broken: [...new Set(broken)], placeholderCount: placeholder.length }
  })

  console.log(`\n=== ${label} (${path}) ===`)
  console.log(`  anh hong that su: ${data.broken.length}`)
  for (const s of data.broken.slice(0, 10)) console.log(`    ${s}`)
  console.log(`  placeholder logo chua tai: ${data.placeholderCount}`)
  return data.broken.length
}

let total = 0
total += await probe('Trang chu', '/')
total += await probe('Top phim', '/top-phim')

const slug = await page.evaluate(
  () => document.querySelector('a[href^="/phim/"]')?.getAttribute('href')?.replace('/phim/', '') ?? '',
)
total += await probe('Trang phim', `/phim/${slug}`)
total += await probe('Danh sach', '/danh-sach')
total += await probe('The loai', '/the-loai/co-trang')
total += await probe('Quoc gia', '/quoc-gia/han-quoc')

console.log(`\nTong anh hong that su tren cac trang: ${total}`)
await browser.close()