const lum = (hex) => {
  const c = hex
    .replace('#', '')
    .match(/../g)
    .map((h) => {
      const v = parseInt(h, 16) / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const ACCENT = '#eab308'
const DEEP = '#ca8a04'

console.log('Nền vàng #eab308 (accent)')
console.log(`  chữ đen  : ${contrast(ACCENT, '#08080b').toFixed(2)}:1`)
console.log(`  chữ trắng: ${contrast(ACCENT, '#ffffff').toFixed(2)}:1`)
console.log(`\nNền vàng đậm #ca8a04 (accent-deep)`)
console.log(`  chữ đen  : ${contrast(DEEP, '#08080b').toFixed(2)}:1`)
console.log(`  chữ trắng: ${contrast(DEEP, '#ffffff').toFixed(2)}:1`)
console.log('\nWCAG AA cần 4.5:1 cho chữ thường, 3:1 cho chữ lớn (>=18.66px đậm).')