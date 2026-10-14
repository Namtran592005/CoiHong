import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, '.shots')
mkdirSync(outDir, { recursive: true })

const BASE = process.argv[2] || 'http://localhost:4173'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 740, isMobile: true, deviceScaleFactor: 2 },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: false, deviceScaleFactor: 2 },
  { name: 'laptop-1280', width: 1280, height: 800, isMobile: false, deviceScaleFactor: 1 },
  { name: 'desktop-1600', width: 1600, height: 900, isMobile: false, deviceScaleFactor: 1 },
]

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'movie', path: '/phim/so-ly' },
  { name: 'watch', path: '/xem-phim/so-ly' },
  { name: 'browse', path: '/danh-sach/phim-le' },
  { name: 'hot', path: '/hot' },
]

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
})

const rows = []

for (const vp of VIEWPORTS) {
  const page = await browser.newPage()
  await page.setViewport(vp)

  for (const p of PAGES) {
    await page.goto(BASE + p.path, { waitUntil: 'networkidle2', timeout: 45000 })
    await new Promise((r) => setTimeout(r, 1200))

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement
      const bottomNav = document.querySelector('nav[aria-label="Điều hướng chính"]')
      const headerNav = document.querySelector('header nav')
      const logo = document.querySelector('header img[alt="CoiHong"]')

      const clipped = (el) => {
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const s = getComputedStyle(n)
          if (
            s.position === 'fixed' ||
            s.overflowX !== 'visible' ||
            s.overflowY !== 'visible'
          ) {
            return true
          }
        }
        return false
      }
      const overflowers = []
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.right > window.innerWidth + 2 && !clipped(el)) {
          overflowers.push(
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} [${Math.round(r.left)}..${Math.round(r.right)}]`,
          )
        }
        if (overflowers.length > 4) break
      }

      window.scrollTo(9999, 0)
      const canScrollX = window.scrollX > 0
      window.scrollTo(0, 0)
      return {
        vw: window.innerWidth,
        scrollW: doc.scrollWidth,
        hOverflow: doc.scrollWidth > window.innerWidth + 1,
        canScrollX,
        bottomNav: bottomNav ? getComputedStyle(bottomNav).display : 'none',
        headerNav: headerNav ? getComputedStyle(headerNav).display : 'none',
        mainPadBottom: getComputedStyle(document.querySelector('main')).paddingBottom,
        logoCenterDelta: logo
          ? Math.round(
              Math.abs(
                logo.getBoundingClientRect().left +
                  logo.getBoundingClientRect().width / 2 -
                  window.innerWidth / 2,
              ),
            )
          : null,
        fontFamily: getComputedStyle(document.body).fontFamily.split(',')[0],
        overflowers,
      }
    })

    rows.push({ viewport: vp.name, page: p.name, ...metrics })

    await page.screenshot({ path: resolve(outDir, `${vp.name}-${p.name}.png`) })
  }
  await page.close()
}

await browser.close()

let bad = 0
console.log(
  'viewport'.padEnd(14) + 'page'.padEnd(9) + 'scrollW/vw'.padEnd(13) + 'cuộnX'.padEnd(8) + 'bottomNav'.padEnd(11) + 'headerNav'.padEnd(11) + 'logoΔ  font',
)
for (const r of rows) {
  const issue = r.canScrollX || r.overflowers.length
  if (issue) bad++
  console.log(
    r.viewport.padEnd(14) +
      r.page.padEnd(9) +
      `${r.scrollW}/${r.vw}`.padEnd(13) +
      (r.canScrollX ? 'CÓ ' : 'không').padEnd(8) +
      r.bottomNav.padEnd(11) +
      String(r.headerNav).padEnd(11) +
      String(r.logoCenterDelta).padEnd(7) +
      r.fontFamily,
  )
  if (r.overflowers.length) console.log('    tràn ngang: ' + r.overflowers.join(' | '))
}
console.log(
  bad
    ? `\n${bad}/${rows.length} tổ hợp có vấn đề`
    : `\nSạch: không tràn ngang ở ${rows.length} tổ hợp viewport × trang`,
)
console.log('Ảnh: ' + outDir)