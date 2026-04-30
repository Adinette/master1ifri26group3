#!/usr/bin/env node
/**
 * Build séquentiel de tous les microservices.
 * Le build Next.js est gourmand — on évite les conflits de ressources
 * en ne lançant qu’un service à la fois.
 */

import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const services = [
  'auth',
  'user',
  'product',
  'inventory',
  'order',
  'production',
  'billing',
  'notification',
  'reporting',
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function buildService(name) {
  const prefix = join(root, 'services', name)
  console.log(`\n[build-services] === ${name.toUpperCase()} ===`)

  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: prefix,
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Build ${name} failed with code ${code}`))
      }
    })

    child.on('error', reject)
  })
}

async function main() {
  const start = Date.now()
  console.log('[build-services] Démarrage du build des 9 microservices...')

  for (const svc of services) {
    try {
      await buildService(svc)
      await delay(500)
    } catch (err) {
      console.error(`\n[build-services] ERREUR: ${err.message}`)
      process.exit(1)
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n[build-services] ✅ Tous les services buildés en ${duration}s`)
}

main()
