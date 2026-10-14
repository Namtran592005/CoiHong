import { writeFileSync } from 'node:fs'

const BASE = 'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/files'
const CSS_URL = 'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5/index.css'

const css = await (await fetch(CSS_URL)).text()

const SUBSETS = ['latin', 'latin-ext', 'vietnamese']
const blocks = []

for (const subset of SUBSETS) {
  const marker = `/* inter-${subset}-wght-normal */`
  const start = css.indexOf(marker)
  if (start < 0) {
    console.error(`thiếu subset ${subset}`)
    process.exit(1)
  }
  const open = css.indexOf('@font-face', start)
  const close = css.indexOf('}', open)
  let block = css.slice(open, close + 1)

  block = block.replace(/url\(\.\/files\//g, `url(${BASE}/`)
  blocks.push(block.trim())
}

const header = `/*
 * Font Inter Variable tải từ jsDelivr.
 *
 * Khai báo @font-face trực tiếp ở đây thay vì nhúng file CSS của CDN, để:
 *  - không phát sinh request stylesheet chéo origin (Edge hay cảnh báo
 *    "Tracking Prevention blocked access to storage");
 *  - chỉ tải đúng subset chứa ký tự thực sự xuất hiện trên trang.
 *
 * unicode-range lấy nguyên văn từ @fontsource-variable/inter@5.
 */
`

writeFileSync(
  'E:/coihong/client/src/fonts.css',
  `${header}\n${blocks.join('\n\n')}\n`,
  'utf8',
)

console.log(`đã tạo client/src/fonts.css với ${blocks.length} subset: ${SUBSETS.join(', ')}`)
for (const b of blocks) {
  const file = b.match(/url\((.+?)\)/)[1].split('/').pop()
  const range = b.match(/unicode-range: ([^;]+);/)[1]
  console.log(`  ${file}\n    ${range}`)
}