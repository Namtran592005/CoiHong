import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const client = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = resolve(client, '.next', 'standalone', 'client', 'server.js')

if (!existsSync(server)) {
  console.error('Chua co ban build. Chay `npm run build` truoc.')
  process.exit(1)
}

const child = spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT ?? '4173',
    HOSTNAME: process.env.HOSTNAME ?? '127.0.0.1',
  },
})

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig))
}
child.on('exit', (code, signal) => {
  process.exit(signal ? 1 : (code ?? 0))
})