import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const TARGETS = [
  { url: 'http://localhost:4173', ten: 'production (next start)' },
  { url: 'http://localhost:3000', ten: 'dev (next dev)' },
]

const ROUTES = ['/', '/phim/so-ly', '/top-phim', '/danh-sach/phim-le', '/xem-phim/so-ly']

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const { url, ten } of TARGETS) {
  console.log(`\n########## ${ten} — ${url}`)

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860 })

  const nhan = []
  page.on('console', (m) => nhan.push({ loai: m.type(), text: m.text() }))
  page.on('pageerror', (e) => nhan.push({ loai: 'pageerror', text: e.message }))
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  for (const route of ROUTES) {
    nhan.length = 0
    await page.goto(url + route, { waitUntil: 'networkidle2' })
    await wait(1500)

    await page.evaluate(async () => {
      const h = document.body.scrollHeight
      for (let y = 0; y < h; y += 800) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 400))
      }
    })
    await wait(800)

    const canhBao = nhan.filter(
      (n) =>
        n.loai === 'error' ||
        n.loai === 'pageerror' ||
        n.loai === 'warning' ||
        n.text.includes('Intervention'),
    )
    const devTools = nhan.filter((n) => n.text.includes('react-devtools'))
    console.log(
      `  ${route.padEnd(20)} canh bao: ${canhBao.length}` +
        (devTools.length ? ' (+ react-devtools)' : ''),
    )
    for (const n of canhBao) console.log(`      [${n.loai}] ${n.text.slice(0, 150)}`)
  }
  await page.close()
}

await browser.close()