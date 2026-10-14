import puppeteer from 'puppeteer-core'
import { mkdirSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'docs', 'screenshots')
mkdirSync(OUT, { recursive: true })

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 }
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],

  protocolTimeout: 180000,
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function openPage(viewport) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.setCacheEnabled(false)
  return page
}

async function settleHome(page) {
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
  await wait(2500)

  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await wait(700)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await wait(1500)
}

async function waitImages(page, timeout = 8000) {
  await page.evaluate(async (limit) => {
    const deadline = Date.now() + limit
    const imgs = Array.from(document.images).filter((i) => !i.complete)
    await Promise.all(
      imgs.map(
        (i) =>
          new Promise((res) => {
            const done = () => res()
            i.addEventListener('load', done, { once: true })
            i.addEventListener('error', done, { once: true })
            setTimeout(done, Math.max(0, deadline - Date.now()))
          }),
      ),
    )
  }, timeout)
  await wait(600)
}

const shots = []

async function shoot(name, viewport, path, { full = false, prepare } = {}) {
  const page = await openPage(viewport)
  if (prepare) await prepare(page)
  else {
    await page.goto(BASE + path, { waitUntil: 'networkidle2' })
    await wait(2000)
  }
  await waitImages(page)

  const file = `${OUT}/${name}.jpeg`
  await page.screenshot({ path: file, type: 'jpeg', quality: 82, fullPage: full })

  const broken = await page.evaluate(
    () =>
      Array.from(document.images).filter((i) => i.currentSrc && i.naturalWidth === 0).length,
  )
  shots.push(file)
  await page.close()
  const size = (statSync(file).size / 1024).toFixed(0)
  console.log(`  ${name}.jpeg  ${size} KB${broken ? `  [${broken} anh loi]` : ''}`)
}

await shoot('home', DESKTOP, '/', { full: true, prepare: (p) => settleHome(p) })
await shoot('home-mobile', MOBILE, '/', { prepare: (p) => settleHome(p) })

await shoot('top-phim', DESKTOP, '/top-phim')
await shoot('hot', DESKTOP, '/hot')

await shoot('danh-sach', DESKTOP, '/danh-sach')
await shoot('tim-kiem', DESKTOP, '/tim-kiem?q=viking')

await shoot('sidebar', MOBILE, '/danh-sach', {
  prepare: async (p) => {
    await p.goto(BASE + '/danh-sach', { waitUntil: 'networkidle2' })
    await wait(2000)
    await p.evaluate(() => document.querySelector('button[aria-label="Mở danh mục"]')?.click())
    await wait(900)
  },
})

{
  const page = await openPage(DESKTOP)
  await settleHome(page)
  const href = await page.evaluate(
    () => document.querySelector('a[href^="/phim/"]')?.getAttribute('href') ?? '',
  )
  await page.close()
  const slug = href.replace('/phim/', '')
  if (!slug) throw new Error('Không lấy được slug phim từ trang chủ')

  await shoot('phim', DESKTOP, `/phim/${slug}`, {
    prepare: async (p) => {
      await p.goto(BASE + `/phim/${slug}`, { waitUntil: 'networkidle2' })
      await wait(2500)
    },
  })
  await shoot('phim-mobile', MOBILE, `/phim/${slug}`)
  await shoot('xem-phim', DESKTOP, `/xem-phim/${slug}`, {
    prepare: async (p) => {
      await p.goto(BASE + `/xem-phim/${slug}`, { waitUntil: 'networkidle2' })
      await wait(3500)
    },
  })
  console.log(`Slug dùng để chụp: ${slug}`)
}

await shoot('quan-tainh', DESKTOP, '/quan-tainh', {
  prepare: async (p) => {
    await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
    const items = await p.evaluate(async () => {
      const res = await fetch('https://phimapi.com/v1/api/danh-sach/phim-moi?limit=6')
      const j = await res.json()
      return j.data.items.map((m) => ({
        slug: m.slug,
        name: m.name,
        poster: m.poster_url,
        at: Date.now() - 86400000 * 3,
      }))
    })
    await p.evaluate((list) => {
      localStorage.setItem('coihong.watchlist.v1', JSON.stringify(list))
    }, items)
    await p.goto(BASE + '/quan-tainh', { waitUntil: 'networkidle2' })
    await wait(2500)
  },
})

console.log(`\nXong ${shots.length} anh:`)
for (const f of shots) console.log(' ', f)
await browser.close()