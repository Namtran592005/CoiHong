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
await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })
await page.goto(`${BASE}/danh-sach`, { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 2500))

await page.evaluate(() => {
  document.querySelector('button[aria-label="Mở danh mục"]')?.click()
})
await new Promise((r) => setTimeout(r, 700))
await page.evaluate(() => {
  document.querySelector('aside nav').scrollTop = 520
})
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: resolve(outDir, 'sidebar-glass.png') })

const info = await page.evaluate(() => {
  const aside = document.querySelector('aside')
  const cs = getComputedStyle(aside)
  return {
    backdrop: cs.backdropFilter,
    bg: cs.backgroundImage.slice(0, 60),
    border: cs.borderRightColor,
    rong: Math.round(aside.getBoundingClientRect().width),
  }
})

console.log(JSON.stringify(info))
await browser.close()