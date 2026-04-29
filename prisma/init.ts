/**
 * SFMC Bénin — Création des tables (DDL)
 *
 * Lit `prisma/init.sql` et l'exécute sur la base définie par `DATABASE_URL`.
 * Multi-plateforme (Windows / Linux / macOS).
 *
 * Usage : `npm run db:init`
 *
 * IMPORTANT : ne JAMAIS utiliser `prisma db push` schéma par schéma sur la
 * base partagée — Prisma droppe les tables qui ne figurent pas dans le
 * schéma courant. Utiliser ce script à la place.
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { Client } from "pg"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("[db:init] DATABASE_URL manquant. Vérifie ton .env.")
    process.exit(1)
  }

  const sqlPath = resolve(process.cwd(), "prisma", "init.sql")
  const sql = readFileSync(sqlPath, "utf-8")

  const client = new Client({ connectionString: url })
  await client.connect()
  console.log(`[db:init] Connecté à PostgreSQL (${sqlPath})`)

  try {
    await client.query(sql)
    console.log("[db:init] ✅ Tables créées (ou déjà existantes).")
  } catch (err) {
    console.error("[db:init] ❌ Erreur SQL :", err)
    throw err
  } finally {
    await client.end()
  }
}

main().catch(() => process.exit(1))
