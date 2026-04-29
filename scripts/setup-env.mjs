/**
 * SFMC Bénin — Distribution du fichier .env vers les microservices
 *
 * Chaque microservice est un projet Next.js indépendant qui charge son
 * propre `.env` depuis son dossier. Ce script copie le `.env` racine
 * dans chaque dossier `services/<svc>/` pour que tous les services
 * partagent la même configuration (DATABASE_URL, RABBITMQ_URL, ...).
 *
 * Usage : `npm run setup:env`
 *
 * Idempotent : copie systématique en force, écrase les `.env` existants
 * dans les services.
 */

import { copyFileSync, existsSync } from "node:fs"
import { resolve, join } from "node:path"

const SERVICES = [
  "auth",
  "user",
  "product",
  "inventory",
  "order",
  "production",
  "billing",
  "notification",
  "reporting",
]

const root = process.cwd()
const rootEnv = resolve(root, ".env")

if (!existsSync(rootEnv)) {
  console.error(`[setup:env] ❌ ${rootEnv} introuvable. Copie .env.example -> .env d'abord.`)
  process.exit(1)
}

let count = 0
for (const svc of SERVICES) {
  const target = join(root, "services", svc, ".env")
  copyFileSync(rootEnv, target)
  console.log(`[setup:env] OK ${svc}`)
  count += 1
}

console.log(`\n[setup:env] ✅ ${count} services configurés.`)
