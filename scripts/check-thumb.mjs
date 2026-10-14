import sharp from 'sharp'

const res = await fetch('https://phimapi.com/v1/api/danh-sach?limit=24')
const items = (await res.json()).data?.items ?? []

let coThumb = 0
let khongThumb = 0
const thieu = []

for (const m of items) {
  if (m.thumb_url) coThumb++
  else {
    khongThumb++
    thieu.push(m.name)
  }
}
console.log(`Tong ${items.length} phim: co thumb_url ${coThumb}, thieu ${khongThumb}`)
if (thieu.length) console.log('Thieu:\n  ' + thieu.join('\n  '))

const first = items.find((m) => !m.thumb_url)
if (first) {
  const r = await fetch(`https://phimimg.com/${first.poster_url}`)
  const m = await sharp(Buffer.from(await r.arrayBuffer())).metadata()
  console.log(`\nVi du poster: ${first.name} -> ${m.width}x${m.height}`)
}