import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const serviceRoot = resolve(scriptDir, '..')
const env = {
  ...process.env,
  SFMC_SKIP_CONSUMER_AUTOSTART: '1',
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: serviceRoot,
      env,
      stdio: 'inherit',
      shell: false,
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise(undefined)
        return
      }

      rejectPromise(new Error(`Command failed (${command} ${args.join(' ')}) with code ${code}`))
    })

    child.on('error', rejectPromise)
  })
}

await run(process.execPath, [resolve(serviceRoot, 'node_modules/prisma/build/index.js'), 'generate'])
await run(process.execPath, [resolve(serviceRoot, 'node_modules/next/dist/bin/next'), 'build', '--webpack'])