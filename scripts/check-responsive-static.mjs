import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const ROUTES = ['/top-phim', '/gioi-thieu', '/lien-he', '/chinh-sach-rieng-tu', '/dmca']
const VPS = [
  [360, 740],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1536, 864],
]

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setCacheEnabled(false)

let bad = 0
for (const route of ROUTES) {
  for (const [w, h] of VPS) {
    await page.setViewport({ width: w, height: h, isMobile: w < 768 })
    await page.goto(BASE + route, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 500))
    const over = await page.evaluate(() => {
      const de = document.documentElement
      const bad = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.right > de.clientWidth + 1) {
          bad.push(`${el.tagName}.${(el.className || '').toString().slice(0, 40)} right=${Math.round(r.right)}`)
        }
      }
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, bad: bad.slice(0, 4) }
    })
    const ok = over.scrollW <= over.clientW + 1 && !over.bad.length
    if (!ok) {
      bad++
      console.log(`${route} ${w}x${h}  scrollW=${over.scrollW}/${over.clientW}  ${over.bad.join(' | ')}`)
    }
  }
  console.log(`${route}: xong`)
}
console.log(bad ? `TRAN: ${bad}` : 'Sach: khong tran ngang o cac trang moi')
await browser.close()