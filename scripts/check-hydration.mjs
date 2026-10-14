import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const ROUTES = ['/', '/danh-sach', '/quan-tainh', '/phim/so-ly', '/tim-kiem?q=viking']

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 860 })

const problems = []
page.on('console', (m) => {
  const t = m.text()
  if (m.type() === 'error' || /hydrat|did not match|Minified React error #(418|419|423|425)/i.test(t)) {
    problems.push({ route: page.url(), text: t })
  }
})
page.on('pageerror', (e) => problems.push({ route: page.url(), text: 'pageerror: ' + e.message }))

let first = true
for (let vong = 1; vong <= 2; vong++) {
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
    await wait(2600)
    if (vong === 1) first = false
  }
}

const trangthai = await page.evaluate(() => ({
  splashFlag: document.documentElement.dataset.splash,
  splashHien: !!document.querySelector('.splash') && getComputedStyle(document.querySelector('.splash')).display !== 'none',
  session: sessionStorage.getItem('coihong.splash.v2'),
}))

await browser.close()

console.log('Vong 1 (tab moi, sessionStorage rong)')
console.log('Vong 2 (cung tab, da co sessionStorage)')
console.log('Trang thai cuoi:', JSON.stringify(trangthai))
console.log('')

if (!problems.length) {
  console.log('Khong co loi console. Splash an dung sau lan xem dau.')
} else {
  const gom = new Map()
  for (const p of problems) {
    const key = p.text.slice(0, 160)
    gom.set(key, (gom.get(key) ?? 0) + 1)
  }
  console.log(`${problems.length} loi:`)
  for (const [k, n] of gom) console.log(`  x${n}  ${k}`)
  process.exit(1)
}