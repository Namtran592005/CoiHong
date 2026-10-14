import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })

await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 4000))

const sw = await page.evaluate(async () => {
  const regs = await navigator.serviceWorker.getRegistrations()
  const keys = await caches.keys()
  return { registrations: regs.length, caches: keys }
})

await page.goto(BASE + '/xem-phim/so-ly?tap=1', { waitUntil: 'networkidle2' })
await page.waitForSelector('video', { timeout: 20000 })
await new Promise((r) => setTimeout(r, 2500))

await page.evaluate(() => {
  const v = document.querySelector('video')
  v.currentTime = 200
  v.play()
})
await new Promise((r) => setTimeout(r, 7000))

const cookie = await page.evaluate(() => document.cookie)

await page.goto(BASE + '/xem-phim/so-ly?tap=1', { waitUntil: 'networkidle2' })
await page.waitForSelector('video', { timeout: 20000 })
await new Promise((r) => setTimeout(r, 1500))

const notice = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('div')).find((d) =>
    /Bạn đã xem đến/.test(d.textContent || ''),
  )
  const card = el && el.closest('.card-surface')
  return {
    shown: !!card,
    text: card ? card.innerText.replace(/\n/g, ' | ') : null,
    buttons: card ? Array.from(card.querySelectorAll('button')).map((b) => b.textContent.trim()) : [],
  }
})

const seeked = await page.evaluate(async () => {
  const btn = Array.from(document.querySelectorAll('button')).find((b) =>
    /Xem tiếp/.test(b.textContent || ''),
  )
  if (!btn) return 'không có nút'
  btn.click()
  await new Promise((r) => setTimeout(r, 3000))
  const v = document.querySelector('video')
  return { time: Math.round(v.currentTime), noticeGone: !document.body.innerText.includes('Bạn đã xem đến') }
})

await page.evaluate(() => {
  const v = document.querySelector('video')
  v.currentTime = 240
  v.play()
})
await new Promise((r) => setTimeout(r, 7000))
await page.goto(BASE + '/xem-phim/so-ly?tap=1', { waitUntil: 'networkidle2' })
await page.waitForSelector('video', { timeout: 20000 })
await new Promise((r) => setTimeout(r, 1200))
const fromStart = await page.evaluate(async () => {
  const btn = Array.from(document.querySelectorAll('button')).find((b) =>
    /Từ đầu/.test(b.textContent || ''),
  )
  if (!btn) return 'không có nút'
  btn.click()
  await new Promise((r) => setTimeout(r, 3000))
  const v = document.querySelector('video')
  return { time: Math.round(v.currentTime), cookieCleared: !document.cookie.includes('ch_progress') }
})

console.log(JSON.stringify({ serviceWorker: sw, cookie: cookie.slice(0, 180), thongBao: notice, bamXemTiep: seeked, bamTuDau: fromStart }, null, 1))
await browser.close()