import puppeteer from 'puppeteer-core'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.argv[2] || 'http://localhost:4173'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox'],
  protocolTimeout: 180000,
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(BASE + '/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 3000))

const css = await page.evaluate(() => {
  const g = document.querySelector('.grain')
  if (!g) return { found: false }
  const s = getComputedStyle(g, '::after')
  return {
    found: true,
    width: Math.round(g.getBoundingClientRect().width),
    height: Math.round(g.getBoundingClientRect().height),
    opacity: s.opacity,
    blend: s.mixBlendMode,
    laGradient: /repeating-linear-gradient/.test(s.backgroundImage || ''),
    soLop: (s.backgroundImage || '').match(/repeating-linear-gradient/g)?.length ?? 0,
  }
})
console.log('Lop luoi:', JSON.stringify(css, null, 1))

const CLIP = { x: 900, y: 250, width: 220, height: 40 }
const buf = await page.screenshot({ clip: CLIP, encoding: 'base64' })

const doDoc = await page.evaluate(
  (b64) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, c.width, c.height)
        const ch = data.length / (c.width * c.height)

        const rowMean = (y) => {
          let sum = 0
          for (let x = 0; x < c.width; x++) sum += data[(c.width * y + x) * ch]
          return sum / c.width
        }
        const means = Array.from({ length: c.height }, (_, y) => rowMean(y))
        const meanDiff = (step) => {
          let d = 0
          let n = 0
          for (let y = 0; y + step < c.height; y++) {
            d += Math.abs(means[y] - means[y + step])
            n++
          }
          return n ? d / n : 0
        }
        resolve({ d1: meanDiff(1), d4: meanDiff(4), d8: meanDiff(8) })
      }
      img.src = 'data:image/png;base64,' + b64
    }),
  buf,
)

console.log(`Chenh lech trung binh giua cac hang cach nhau 1px : ${doDoc.d1.toFixed(2)}`)
console.log(`Chenh lech trung binh giua cac hang cach nhau 4px : ${doDoc.d4.toFixed(2)}`)
console.log(`Chenh lech trung binh giua cac hang cach nhau 8px : ${doDoc.d8.toFixed(2)}`)

const laLinh =
  doDoc.d1 > 0.6 && doDoc.d4 < doDoc.d1 * 0.5 && doDoc.d8 < doDoc.d1 * 0.5
const dungCSS = css.found && css.laGradient && css.soLop === 2

console.log(
  dungCSS && laLinh
    ? '-> LUOI 4px dung va deu'
    : `-> KHONG khop (css=${dungCSS ? 'ok' : 'sai'}, hinh anh=${laLinh ? 'ok' : 'sai'})`,
)

await browser.close()
