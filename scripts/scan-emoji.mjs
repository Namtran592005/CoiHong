import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = 'E:/coihong/client/src'
const emojiRe =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F900}-\u{1F9FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{2700}-\u{27BF}]/u

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.tsx?$/.test(e)) check(p)
  }
}

function check(p) {
  const text = readFileSync(p, 'utf8')
  text.split('\n').forEach((line, i) => {
    const m = line.match(emojiRe)
    if (m) console.log(`${p.replace(/.*client.src./, '')}:${i + 1}  [${m[0]}]  ${line.trim().slice(0, 90)}`)
  })
}

walk(root)
console.log('xong')