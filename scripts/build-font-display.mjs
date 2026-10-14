import { writeFileSync } from 'node:fs'

const PKG = '@fontsource/shrikhand@5'
const BASE = `https://cdn.jsdelivr.net/npm/${PKG}/files`
const CSS_URL = `https://cdn.jsdelivr.net/npm/${PKG}/index.css`

const css = await (await fetch(CSS_URL)).text()

const WANTED = ['latin', 'latin-ext']
const blocks = []

for (const subset of WANTED) {
  const marker = `/* shrikhand-${subset}-400-normal */`
  const start = css.indexOf(marker)
  if (start < 0) {
    console.error(`thiếu subset ${subset} trong ${CSS_URL}`)
    process.exit(1)
  }
  const open = css.indexOf('@font-face', start)
  const close = css.indexOf('}', open)
  const block = css
    .slice(open, close + 1)
    // Đường dẫn tương đối của CDN -> URL tuyệt đối
    .replace(/url\(\.\/files\//g, `url(${BASE}/`)
    // Bỏ nguồn .woff dự phòng: mọi trình duyệt đang dùng đều hiểu woff2,
    // giữ lại chỉ làm dài CSS mà không bao giờ tới được.
    .replace(/,\s*url\([^)]+\.woff\)\s*format\('woff'\)/g, '')
  blocks.push(block.trim())
}

const header = `/*
 * Font Shrikhand — dùng cho SỐ THỨ HẠNG (Top 10 trang chủ, trang /top-phim).
 *
 * Chữ viết tay phong cách script Ấn Độ, thiết kế bởi Jonny Pinhorn. Chọn vì
 * số xếp hạng đứng cạnh tên phim là nơi nét chữ cá tính khác biệt giúp
 * nhìn ra "bảng xếp hạng" chứ không phải danh sách phim thường.
 *
 * Một weight (400). Bề rộng mỗi chữ số bằng nhau nên "10" và "30" cùng
 * bề ngang — cột số luôn thẳng hàng.
 *
 * Khai báo tại đây thay vì nhúng CSS của CDN: không có request chéo origin
 * (tránh cảnh báo Tracking Prevention của Edge) và chỉ tải subset cần dùng.
 */

`

const out = 'E:/coihong/client/src/fonts-display.css'
writeFileSync(out, `${header}\n${blocks.join('\n\n')}\n`, 'utf8')

console.log(`đã tạo ${out} với ${blocks.length} subset: ${WANTED.join(', ')}`)
for (const b of blocks) {
  const file = b.match(/url\((.+?)\)/)[1].split('/').pop()
  console.log(`  ${file}`)
}