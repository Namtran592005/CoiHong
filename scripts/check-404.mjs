import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const route of ['/', '/phim/so-ly', '/xem-phim/so-ly']) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860 })
  const loi = []
  page.on('response', (r) => {
    if (r.status() >= 400) loi.push(`${r.status()}  ${r.url().slice(0, 110)}`)
  })
  await page.goto(BASE + route, { waitUntil: 'networkidle2' })
  await wait(1500)
  await page.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 800) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 400))
    }
  })
  await wait(1000)
  console.log(`\n${route}: ${loi.length} loi`)
  for (const l of [...new Set(loi)]) console.log('  ' + l)
  await page.close()
}

await browser.close()