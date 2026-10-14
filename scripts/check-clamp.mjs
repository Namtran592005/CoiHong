import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 860 })
await page.setCacheEnabled(false)

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await page.evaluate(async () => {
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(regs.map((r) => r.unregister()))
  const keys = await caches.keys()
  await Promise.all(keys.map((k) => caches.delete(k)))
})
await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1500))

const result = await page.evaluate(() => {
  const els = Array.from(
    document.querySelectorAll('.line-clamp-1-safe, .line-clamp-2-safe, .line-clamp-3-safe, .line-clamp-5-safe'),
  )
  const heights = els.map((e) => Math.round(e.getBoundingClientRect().height))

  const thieuLineClamp = els.filter((e) => {
    const cs = getComputedStyle(e)
    return !cs.getPropertyValue('-webkit-line-clamp') && !cs.getPropertyValue('line-clamp')
  })
  const khongCat = els.filter((e) => {
    const cs = getComputedStyle(e)
    return cs.overflow === 'visible' && !cs.getPropertyValue('-webkit-line-clamp')
  })

  return {
    classNames: els[0] ? els[0].className : null,
    display: els[0] ? getComputedStyle(els[0]).display : null,
    soThe: heights.length,
    maxCao: heights.length ? Math.max(...heights) : 0,
    thieuLineClamp: thieuLineClamp.length,
    khongCat: khongCat.length,
  }
})

console.log(JSON.stringify(result, null, 1))
await browser.close()