import sharp from 'sharp'

const BASE = 'https://phimapi.com'
const FRAME = { w: 1440, h: 612 }
const VUNG = { x: 1000, y: 120, w: 400, h: 260 }

const slugs = [
  'manh-moi-cuoi-cung-phan-1',
  'huan-luyen-vien-ted-lasso-phan-4',
  'tro-choi-bat-coc-phan-1',
  'nhung-diep-vien-het-thoi-phan-6',
  'dau-tay-ngot-ngao-phan-1',
]

for (const slug of slugs) {
  const url = `${BASE}/v1/api/phim/${slug}`
  const res = await fetch(url)
  if (!res.ok) {
    console.log(slug.padEnd(34), `HTTP ${res.status}`)
    continue
  }
  const item = (await res.json()).data?.item ?? {}
  if (!item.thumb_url) {
    console.log(slug.padEnd(34), 'khong co thumb_url')
    continue
  }
  const img = item.thumb_url.startsWith('http')
    ? item.thumb_url
    : `https://phimimg.com/${item.thumb_url}`

  const buf = Buffer.from(await (await fetch(img)).arrayBuffer())
  const meta = await sharp(buf).metadata()

  const scale = Math.max(FRAME.w / meta.width, FRAME.h / meta.height)
  const w = Math.round(meta.width * scale)
  const h = Math.round(meta.height * scale)

  const vx = Math.round((w - FRAME.w) / 2)
  const k = VUNG.w / FRAME.w
  const vy = Math.round(VUNG.y * (h / FRAME.h))

  const rw = Math.round(Math.min(VUNG.w * (w / FRAME.w), w))
  const rh = Math.round(Math.min(VUNG.h * (h / FRAME.h), h))
  const rx = Math.round((w - FRAME.w) / 2) + Math.round(((VUNG.x / FRAME.w) * w - (w - FRAME.w) / 2))
  const ry = Math.round(VUNG.y * (h / FRAME.h))

  const { data, info } = await sharp(buf)
    .resize(w, h, { fit: 'fill' })
    .extract({
      left: Math.max(0, Math.min(rx, w - rw)),
      top: Math.max(0, Math.min(ry, h - rh)),
      width: rw,
      height: rh,
    })
    .raw()
    .toBuffer({ resolveWithObject: true })

  let sum = 0
  for (let i = 0; i < data.length; i += info.channels) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  }
  const vung = sum / (data.length / info.channels)

  const { data: d2, info: i2 } = await sharp(buf)
    .resize(w, h, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  let all = 0
  for (let i = 0; i < d2.length; i += i2.channels) {
    all += 0.2126 * d2[i] + 0.7152 * d2[i + 1] + 0.0722 * d2[i + 2]
  }

  console.log(
    `${slug.slice(0, 33).padEnd(34)} ${meta.width}x${meta.height}  ` +
      `vung do: ${vung.toFixed(1).padStart(6)}  ca chung: ${(all / (d2.length / i2.channels)).toFixed(1).padStart(6)}`,
  )
}