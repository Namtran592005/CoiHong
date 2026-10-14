import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const ROUTES = ['/', '/danh-sach', '/quan-tainh', '/phim/so-ly']

const PHAN_LOI = [
  ['preload khong dung', /preloaded using link preload but not used/i],
  ['aria-hidden chan focus', /Blocked aria-hidden on an element/i],
  ['hydration', /hydrat|did not match|Minified React error #(418|419|423|425)/i],
  ['favicon 404', /favicon\.ico.*404|404.*favicon\.ico/i],
  ['Permissions-Policy', /Permissions-Policy header/i],
]

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 860 })

const nhan = []
let routeHienTai = ''
page.on('console', (m) => nhan.push({ route: routeHienTai, text: m.text() }))
page.on('pageerror', (e) => nhan.push({ route: routeHienTai, text: 'pageerror: ' + e.message }))
page.on('requestfailed', (r) => nhan.push({ route: routeHienTai, text: 'requestfailed: ' + r.url() }))
page.on('response', (r) => {
  if (r.status() >= 400) nhan.push({ route: routeHienTai, text: `HTTP ${r.status()}: ${r.url()}` })
})

let lan = 1
for (const route of ROUTES) {
  routeHienTai = route
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
  await wait(3000)
  lan++
}
// Lan 2: cung tab, sessionStorage da co -> day la truong hop gay loi cu
for (const route of ROUTES) {
  routeHienTai = route + ' (vong 2)'
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
  await wait(3000)
}

await browser.close()

const dem = new Map()
const khac = []
for (const n of nhan) {
  const tim = PHAN_LOI.find(([, re]) => re.test(n.text))
  if (tim) {
    const k = `${tim[0]} | ${n.route}`
    dem.set(k, (dem.get(k) ?? 0) + 1)
  } else if (!/prefetch|_rsc=/i.test(n.text)) {
    khac.push(`${n.route}  ${n.text.slice(0, 90)}`)
  }
}

console.log(`8 lan tai trang x ${ROUTES.length} route`)
console.log('')
for (const [ten] of PHAN_LOI) {
  const tong = [...dem.entries()].filter(([k]) => k.startsWith(ten + ' |'))
  const n = tong.reduce((s, [, v]) => s + v, 0)
  console.log(`  ${n === 0 ? 'sach' : 'CO  '} ${String(n).padStart(3)}  ${ten}`)
  for (const [k, v] of tong) if (v > 0) console.log(`          ${v} tai ${k.split(' | ')[1]}`)
}
if (khac.length) {
  console.log('')
  console.log('Thong bao khac:')
  const gom = new Map()
  for (const t of khac) gom.set(t, (gom.get(t) ?? 0) + 1)
  for (const [k, n] of gom) console.log(`  x${n}  ${k}`)
}