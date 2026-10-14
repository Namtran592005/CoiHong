const res = await fetch('https://phimapi.com/v1/api/home')
const j = await res.json()
const d = j.data ?? {}
const items = d.items ?? j.items ?? []

console.log('status:', j.status)
console.log('so phim trong home:', items.length)
console.log('co thumb_url:', items.filter((m) => m.thumb_url).length)
for (const m of items.slice(0, 5)) {
  console.log(`  ${m.name} | thumb=${m.thumb_url || 'KHONG CO'}`)
}
console.log('khoa cua item dau:', Object.keys(items[0] ?? {}).join(', '))