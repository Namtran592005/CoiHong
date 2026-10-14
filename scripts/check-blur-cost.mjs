import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'
const SLUG = '/phim/huan-luyen-vien-ted-lasso-phan-4'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 300000,
})

const RUNS = 3
const ketQua = { 'hien tai': [], 'tat blur': [] }

for (let run = 0; run < RUNS; run++)
for (const variant of ['hien tai', 'tat blur']) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.setCacheEnabled(false)
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister()))
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
  })
  if (variant === 'tat blur') {
    await page.evaluateOnNewDocument(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const s = document.createElement('style')
        s.textContent = '.absolute.inset-0.h-full.w-full.object-cover { filter: none !important; }'
        document.head.appendChild(s)
      })
    })
  }

  const t0 = Date.now()
  await page.goto(BASE + SLUG, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.shadow-lift img')
      return el && el.complete && el.naturalWidth > 0
    },
    { timeout: 20000 },
  )
  const taiXong = Date.now() - t0

  await page.waitForFunction(
    () => {
      const el = document.querySelector('.shadow-lift img')
      return el && getComputedStyle(el).opacity === '1'
    },
    { timeout: 20000 },
  )
  const hien = Date.now() - t0

  ketQua[variant].push({ taiXong, hien })
  console.log(
    `${variant.padEnd(10)} lan ${run + 1}: tai xong ${taiXong} ms | anh hien ${hien} ms | chenh ${hien - taiXong} ms`,
  )
  await page.close()
}

const tb = (a, k) => (a.reduce((x, y) => x + y[k], 0) / a.length).toFixed(0)
console.log(
  `\nTB 3 lan:` +
    `\n  co blur:  tai xong ${tb(ketQua['hien tai'], 'taiXong')} ms | hien ${tb(ketQua['hien tai'], 'hien')} ms | chenh ${tb(ketQua['hien tai'], 'hien') - tb(ketQua['hien tai'], 'taiXong')} ms` +
    `\n  tat blur: tai xong ${tb(ketQua['tat blur'], 'taiXong')} ms | hien ${tb(ketQua['tat blur'], 'hien')} ms | chenh ${tb(ketQua['tat blur'], 'hien') - tb(ketQua['tat blur'], 'taiXong')} ms`,
)

await browser.close()