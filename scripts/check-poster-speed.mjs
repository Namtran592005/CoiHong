import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 300000,
})
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function clean(page) {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister()))
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)))
  })
}

const HOOK = `
window.__anh = []
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    window.__anh.push({
      url: e.name.split('/').pop().slice(0, 34),
      kb: Math.round(e.transferSize / 1024),
      ms: Math.round(e.duration),
      start: Math.round(e.startTime),
    })
  }
}).observe({ type: 'resource', buffered: true })
`

async function doTrang(label, url, selector) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.setCacheEnabled(false)
  await clean(page)
  await page.evaluateOnNewDocument(HOOK)
  const t0 = Date.now()
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  let hienSau = null
  try {
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel)
        return el && getComputedStyle(el).opacity === '1' && el.naturalWidth > 0
      },
      { timeout: 20000 },
      selector,
    )
    hienSau = Date.now() - t0
  } catch {
    hienSau = -1
  }

  const thu = await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    const res = performance.getEntriesByType('resource').filter((r) => r.initiatorType === 'img')
    const cuaAnh = res.filter((r) => r.name.includes((el?.currentSrc || '').split('/').pop() || '~'))
    const r = cuaAnh[0]
    return {
      kichThuocThat: el ? `${el.naturalWidth}x${el.naturalHeight}` : '-',
      hienThi: el ? `${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}` : '-',
      taiSau: r ? Math.round(r.startTime) : null,
      taiXong: r ? Math.round(r.responseEnd) : null,
      kb: r ? Math.round(r.transferSize / 1024) : null,
      soAnhTai: res.length,
    }
  }, selector)

  console.log(`\n${label} (${url})`)
  console.log(`  hien sau ${hienSau} ms`)
  console.log(`  kich thuoc that ${thu.kichThuocThat}, hien thi ${thu.hienThi}`)
  console.log(`  anh bat dau tai ${thu.taiSau} ms, xong ${thu.taiXong} ms, ${thu.kb} KB`)
  console.log(`  so anh cung tai: ${thu.soAnhTai}`)
  await page.close()
}

await doTrang('Poster trang chi tiet', `${BASE}/phim/huan-luyen-vien-ted-lasso-phan-4`, '.shadow-lift img')

{
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.setCacheEnabled(false)
  await clean(page)
  await page.evaluateOnNewDocument(HOOK)
  const t0 = Date.now()
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
  await wait(4000)
  const r = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find((x) =>
      x.textContent.includes('Mới cập nhật'),
    )
    const card = h?.closest('section')?.querySelector('img')
    const res = performance
      .getEntriesByType('resource')
      .filter((r) => r.initiatorType === 'img')
    const cuaAnh = res.filter((r) => r.name.includes((card?.currentSrc || '').split('/').pop() || '~'))
    return {
      src: card?.currentSrc.split('/').pop().slice(0, 34),
      kichThuocThat: card ? `${card.naturalWidth}x${card.naturalHeight}` : '-',
      taiSau: cuaAnh[0] ? Math.round(cuaAnh[0].startTime) : null,
      taiXong: cuaAnh[0] ? Math.round(cuaAnh[0].responseEnd) : null,
      kb: cuaAnh[0] ? Math.round(cuaAnh[0].transferSize / 1024) : null,
      soAnhTai: res.length,
    }
  })
  console.log('\nCard trang chu (hang "Moi cap nhat")')
  console.log(`  ${r.src}`)
  console.log(`  kich thuoc that ${r.kichThuocThat}`)
  console.log(`  bat dau tai ${r.taiSau} ms, xong ${r.taiXong} ms, ${r.kb} KB`)
  console.log(`  so anh cung tai: ${r.soAnhTai}`)
  await page.close()
}

await browser.close()