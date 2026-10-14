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

for (const [w, h, tag] of [
  [390, 844, '390'],
  [360, 740, '360'],
]) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, isMobile: true, deviceScaleFactor: 2 })

  await page.goto(`${BASE}/hot`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 2500))
  await page.evaluate(() => {
    const el = document.querySelector('main section')
    el?.scrollIntoView({ block: 'start' })
    window.scrollBy(0, 260)
  })
  await new Promise((r) => setTimeout(r, 500))

  await page.screenshot({ path: resolve(outDir, `bottomnav-${tag}.png`) })

  const info = await page.evaluate(() => {
    const nav = document.querySelector('nav.glass-bar')
    if (!nav) return { loi: 'khong thay thanh duoi' }
    const r = nav.getBoundingClientRect()
    const links = [...nav.querySelectorAll('a')].map((a) => ({
      nhan: a.textContent.trim(),
      cao: Math.round(a.getBoundingClientRect().height),
      rong: Math.round(a.getBoundingClientRect().width),
      dang: a.getAttribute('aria-current') === 'page',
    }))
    return {
      cao: Math.round(r.height),
      blur: getComputedStyle(nav).backdropFilter,
      duoi: Math.round(r.bottom),
      links,
    }
  })
  console.log(tag, JSON.stringify(info))

  await page.close()
}

await browser.close()