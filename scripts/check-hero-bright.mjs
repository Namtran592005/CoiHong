import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function brightness(full, x, y, w, h) {
  const { data, info } = await sharp(full)
    .extract({ left: x, top: y, width: w, height: h })
    .raw()
    .toBuffer({ resolveWithObject: true })

  let sum = 0
  for (let i = 0; i < data.length; i += info.channels) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  }
  return sum / (data.length / info.channels)
}

async function measure(label, viewport, path, box) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.goto(BASE + path, { waitUntil: 'networkidle2' })
  await wait(3000)

  const full = await page.screenshot({ type: 'png' })
  await page.close()

  const band = (frac, h) => ({
    x: box.x,
    y: box.y + Math.round(box.h * frac),
    w: box.w,
    h: Math.round(box.h * h),
  })
  return {
    label,
    vungTren: await brightness(full, ...Object.values(band(0, 0.35))),
    vungGiua: await brightness(full, ...Object.values(band(0.35, 0.3))),
    vungDuoi: await brightness(full, ...Object.values(band(0.65, 0.35))),
  }
}

const rows = []

rows.push(await measure('desktop  vung hero phai', { width: 1440, height: 900 }, '/', { x: 900, y: 120, w: 500, h: 320 }))

rows.push(await measure('mobile   nen hero tren', { width: 390, height: 844 }, '/', { x: 250, y: 170, w: 120, h: 380 }))

rows.push(await measure('mobile   nen hero duoi', { width: 390, height: 844 }, '/', { x: 250, y: 560, w: 120, h: 150 }))

rows.push(await measure('mobile   thumbnail', { width: 390, height: 844 }, '/', { x: 20, y: 755, w: 350, h: 80 }))

rows.push(await measure('desktop  trang phim', { width: 1440, height: 900 }, '/phim/dong-ho-cat', { x: 1000, y: 150, w: 400, h: 250 }))

console.log('Vung'.padEnd(26) + 'trên'.padStart(8) + 'giữa'.padStart(8) + 'dưới'.padStart(8))
for (const r of rows) {
  console.log(
    r.label.padEnd(26) +
      r.vungTren.toFixed(1).padStart(8) +
      r.vungGiua.toFixed(1).padStart(8) +
      r.vungDuoi.toFixed(1).padStart(8),
  )
}

await browser.close()