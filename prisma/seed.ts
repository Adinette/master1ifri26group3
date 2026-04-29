/**
 * SFMC Bénin — Seed de données de démonstration
 *
 * Peuple la base avec un jeu de données cohérent pour tester l'ensemble
 * des fonctionnalités du frontend et des microservices :
 *   - 5 utilisateurs (Freddy, Adinette, Silas, admin, demo)
 *   - 8 produits SFMC (ciment, fer, briques, granulats)
 *   - 1 entrepôt principal + stocks initiaux
 *   - 5 commandes (statuts variés)
 *   - 3 factures (1 payée, 1 en attente, 1 en retard)
 *   - 5 notifications de démo
 *   - 2 lots de production
 *
 * Idempotent : utilise ON CONFLICT pour ne pas dupliquer les données si
 * relancé. Le mot de passe par défaut pour tous les comptes credentials
 * est `password123` (haché avec bcrypt).
 *
 * Usage : `npm run db:seed`
 */

import "dotenv/config"
import { Client } from "pg"
import bcrypt from "bcrypt"

const DEFAULT_PASSWORD = "password123"
const BCRYPT_ROUNDS = 10

interface SeedUser {
  name: string
  email: string
  role: string
  provider: string | null
  phone: string | null
}

interface SeedProduct {
  name: string
  category: string
  unit: string
  price: number
  description: string
  initialStock: number
  minThreshold: number
}

const USERS: SeedUser[] = [
  { name: "Freddy ANATO",         email: "freddy@sfmc.bj",   role: "admin",    provider: "credentials", phone: "+229 90 00 00 01" },
  { name: "Adinette DOUGLOUI",    email: "adinette@sfmc.bj", role: "admin",    provider: "credentials", phone: "+229 90 00 00 02" },
  { name: "Silas AGBOGBA ZOUNON", email: "silas@sfmc.bj",    role: "admin",    provider: "credentials", phone: "+229 90 00 00 03" },
  { name: "Admin SFMC",           email: "admin@sfmc.bj",    role: "admin",    provider: "credentials", phone: "+229 21 30 00 00" },
  { name: "Client Demo",          email: "demo@sfmc.bj",     role: "user",     provider: "credentials", phone: "+229 97 00 00 00" },
]

const PRODUCTS: SeedProduct[] = [
  { name: "Ciment CPJ 32.5R - sac 50kg",   category: "Ciment",    unit: "sac",    price:  4500, description: "Ciment Portland Composé classe 32.5R, sac de 50kg, usage général", initialStock: 1200, minThreshold: 200 },
  { name: "Ciment CPJ 42.5R - sac 50kg",   category: "Ciment",    unit: "sac",    price:  5200, description: "Ciment Portland Composé classe 42.5R haute résistance, sac de 50kg", initialStock:  800, minThreshold: 150 },
  { name: "Fer à béton TOR 6mm",           category: "Fer",       unit: "barre",  price:  2800, description: "Barre HA 6mm, longueur 12m, acier haute adhérence",                  initialStock:  500, minThreshold: 100 },
  { name: "Fer à béton TOR 8mm",           category: "Fer",       unit: "barre",  price:  4500, description: "Barre HA 8mm, longueur 12m, acier haute adhérence",                  initialStock:  450, minThreshold: 100 },
  { name: "Fer à béton TOR 10mm",          category: "Fer",       unit: "barre",  price:  7000, description: "Barre HA 10mm, longueur 12m, acier haute adhérence",                 initialStock:  300, minThreshold:  50 },
  { name: "Brique creuse 15x20x40",        category: "Briques",   unit: "unité",  price:   350, description: "Brique creuse standard pour cloison, dimensions 15x20x40 cm",       initialStock: 5000, minThreshold: 500 },
  { name: "Brique pleine 11x22",           category: "Briques",   unit: "unité",  price:   250, description: "Brique pleine cuite pour mur porteur, format 11x22 cm",            initialStock: 3000, minThreshold: 300 },
  { name: "Granulats 5/15 - tonne",        category: "Granulats", unit: "tonne",  price: 12000, description: "Gravier concassé calibre 5/15mm pour béton structurel",            initialStock:  150, minThreshold:  20 },
]

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("[seed] DATABASE_URL manquant. Vérifie ton .env.")
    process.exit(1)
  }

  const client = new Client({ connectionString: url })
  await client.connect()
  console.log("[seed] Connecté à PostgreSQL.")

  try {
    await client.query("BEGIN")

    // -----------------------------------------------------------------
    // 1. Utilisateurs (table partagée `users`)
    // -----------------------------------------------------------------
    console.log("[seed] (1/7) Utilisateurs...")
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS)
    for (const u of USERS) {
      await client.query(
        `INSERT INTO users (name, email, password, role, provider, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           phone = EXCLUDED.phone,
           updated_at = NOW()`,
        [u.name, u.email, passwordHash, u.role, u.provider, u.phone]
      )
    }
    console.log(`[seed]    -> ${USERS.length} utilisateurs (mot de passe par défaut : "${DEFAULT_PASSWORD}")`)

    // -----------------------------------------------------------------
    // 2. Entrepôt principal
    // -----------------------------------------------------------------
    console.log("[seed] (2/7) Entrepôt...")
    // Note : pas de contrainte UNIQUE sur warehouses.name, donc on vérifie manuellement
    const existingWarehouse = await client.query(
      `SELECT id FROM warehouses WHERE name = $1 LIMIT 1`,
      ["Entrepôt Cotonou"]
    )
    const warehouseRes = existingWarehouse.rows.length > 0
      ? existingWarehouse
      : await client.query(
          `INSERT INTO warehouses (name, location) VALUES ($1, $2) RETURNING id`,
          ["Entrepôt Cotonou", "Zone Industrielle d'Akpakpa, Cotonou"]
        )
    let warehouseId: number
    if (warehouseRes.rows.length > 0) {
      warehouseId = warehouseRes.rows[0].id
    } else {
      const existing = await client.query(`SELECT id FROM warehouses ORDER BY id ASC LIMIT 1`)
      warehouseId = existing.rows[0]?.id ?? 1
    }
    console.log(`[seed]    -> entrepôt id=${warehouseId}`)

    // -----------------------------------------------------------------
    // 3. Produits + stocks initiaux
    // -----------------------------------------------------------------
    console.log("[seed] (3/7) Produits + stocks...")
    const productIds: { id: number; name: string; price: number }[] = []
    for (const p of PRODUCTS) {
      // Pas de contrainte UNIQUE sur products.name : on vérifie manuellement
      const existing = await client.query(`SELECT id FROM products WHERE name = $1 LIMIT 1`, [p.name])
      let productId: number
      if (existing.rows.length > 0) {
        productId = existing.rows[0].id
      } else {
        const created = await client.query(
          `INSERT INTO products (name, category, unit, price, description)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [p.name, p.category, p.unit, p.price, p.description]
        )
        productId = created.rows[0].id
      }
      productIds.push({ id: productId, name: p.name, price: p.price })

      // Stock initial dans l'entrepôt principal
      await client.query(
        `INSERT INTO stocks (product_id, product_name, warehouse_id, quantity, min_threshold)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (product_id, warehouse_id) DO UPDATE SET
           quantity = EXCLUDED.quantity,
           min_threshold = EXCLUDED.min_threshold,
           updated_at = NOW()`,
        [productId, p.name, warehouseId, p.initialStock, p.minThreshold]
      )

      // Mouvement d'entrée initial pour traçabilité
      await client.query(
        `INSERT INTO movements (product_id, product_name, warehouse_id, type, quantity, reason)
         SELECT $1::int, $2::varchar, $3::int, 'in', $4::int, 'Stock initial (seed)'
         WHERE NOT EXISTS (
           SELECT 1 FROM movements
           WHERE product_id = $1::int AND warehouse_id = $3::int AND reason = 'Stock initial (seed)'
         )`,
        [productId, p.name, warehouseId, p.initialStock]
      )
    }
    console.log(`[seed]    -> ${PRODUCTS.length} produits + stocks initiaux`)

    // -----------------------------------------------------------------
    // 4. Commandes (statuts variés)
    // -----------------------------------------------------------------
    console.log("[seed] (4/7) Commandes...")
    const ordersData = [
      { client: "BTP Bénin SARL",       productIdx: 0, qty:  50, status: "validated" },
      { client: "Cabinet Lawson",       productIdx: 5, qty: 200, status: "shipped"   },
      { client: "Construction Kpèhounto",productIdx: 2, qty:  80, status: "pending"   },
      { client: "Atelier Houndo",       productIdx: 7, qty:  10, status: "validated" },
      { client: "Particulier Akpakpa",  productIdx: 1, qty:  20, status: "cancelled" },
    ]
    const insertedOrders: { id: number; client: string; total: number; status: string }[] = []
    for (const o of ordersData) {
      const product = productIds[o.productIdx]
      const total = product.price * o.qty
      const res = await client.query(
        `INSERT INTO orders (client_name, product_id, product_name, quantity, total_price, status)
         SELECT $1::varchar, $2::int, $3::varchar, $4::int, $5::float, $6::varchar
         WHERE NOT EXISTS (
           SELECT 1 FROM orders WHERE client_name = $1::varchar AND product_id = $2::int AND quantity = $4::int
         )
         RETURNING id`,
        [o.client, product.id, product.name, o.qty, total, o.status]
      )
      if (res.rows.length > 0) {
        insertedOrders.push({ id: res.rows[0].id, client: o.client, total, status: o.status })
      }
    }
    console.log(`[seed]    -> ${insertedOrders.length} commandes (les autres existaient déjà)`)

    // -----------------------------------------------------------------
    // 5. Factures
    // -----------------------------------------------------------------
    console.log("[seed] (5/7) Factures...")
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000)

    const validatedOrShipped = insertedOrders.filter(o => o.status === "validated" || o.status === "shipped")
    const invoicesCreated: { id: number; status: string; amount: number }[] = []
    for (const [i, order] of validatedOrShipped.entries()) {
      const status = i === 0 ? "paid" : (i === 1 ? "pending" : "overdue")
      const dueDate = i === 0 ? yesterday : (i === 1 ? tomorrow : lastWeek)
      const paidAt = status === "paid" ? yesterday : null
      const res = await client.query(
        `INSERT INTO invoices (order_id, client_name, amount, status, due_date, paid_at)
         SELECT $1::int, $2::varchar, $3::float, $4::varchar, $5::timestamp, $6::timestamp
         WHERE NOT EXISTS (SELECT 1 FROM invoices WHERE order_id = $1::int)
         RETURNING id`,
        [order.id, order.client, order.total, status, dueDate, paidAt]
      )
      if (res.rows.length > 0) {
        invoicesCreated.push({ id: res.rows[0].id, status, amount: order.total })
      }
    }
    console.log(`[seed]    -> ${invoicesCreated.length} factures (paid/pending/overdue)`)

    // -----------------------------------------------------------------
    // 6. Paiements (pour les factures payées)
    // -----------------------------------------------------------------
    console.log("[seed] (6/7) Paiements...")
    let paymentsCount = 0
    for (const inv of invoicesCreated.filter(i => i.status === "paid")) {
      const res = await client.query(
        `INSERT INTO payments (invoice_id, amount, method)
         SELECT $1::int, $2::float, $3::varchar
         WHERE NOT EXISTS (SELECT 1 FROM payments WHERE invoice_id = $1::int)
         RETURNING id`,
        [inv.id, inv.amount, "Mobile Money"]
      )
      if (res.rows.length > 0) paymentsCount++
    }
    console.log(`[seed]    -> ${paymentsCount} paiements`)

    // -----------------------------------------------------------------
    // 7. Notifications + lots de production
    // -----------------------------------------------------------------
    console.log("[seed] (7/7) Notifications + production...")
    const notifications = [
      { type: "order.created",    message: "Nouvelle commande reçue : BTP Bénin SARL",            recipient: "admin@sfmc.bj" },
      { type: "payment.confirmed",message: "Paiement Mobile Money confirmé pour facture #1",      recipient: "admin@sfmc.bj" },
      { type: "stock.alert",      message: "Stock faible : Granulats 5/15 (15 tonnes restantes)", recipient: "admin@sfmc.bj" },
      { type: "order.shipped",    message: "Commande expédiée : Cabinet Lawson (200 briques)",    recipient: "admin@sfmc.bj" },
      { type: "production.completed", message: "Lot de production terminé : Ciment CPJ 32.5R",    recipient: "admin@sfmc.bj" },
    ]
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (type, message, recipient)
         SELECT $1::varchar, $2::text, $3::varchar
         WHERE NOT EXISTS (
           SELECT 1 FROM notifications WHERE type = $1::varchar AND message = $2::text
         )`,
        [n.type, n.message, n.recipient]
      )
    }

    const inOneWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000)
    const productionBatches = [
      { productIdx: 0, qty: 500, status: "completed", start: lastWeek,  end: yesterday },
      { productIdx: 1, qty: 300, status: "planned",   start: tomorrow,  end: null      },
    ]
    for (const b of productionBatches) {
      const product = productIds[b.productIdx]
      await client.query(
        `INSERT INTO production_batches (product_id, product_name, quantity, status, start_date, end_date)
         SELECT $1::int, $2::varchar, $3::int, $4::varchar, $5::timestamp, $6::timestamp
         WHERE NOT EXISTS (
           SELECT 1 FROM production_batches WHERE product_id = $1::int AND start_date = $5::timestamp
         )`,
        [product.id, product.name, b.qty, b.status, b.start, b.end]
      )
    }
    console.log(`[seed]    -> ${notifications.length} notifications, ${productionBatches.length} lots de production`)

    await client.query("COMMIT")
    console.log("\n[seed] ✅ Seed terminé avec succès.")
    console.log(`[seed] 🔑 Mot de passe par défaut pour tous les comptes : "${DEFAULT_PASSWORD}"`)
    console.log(`[seed] 👤 Comptes admin : freddy@sfmc.bj, adinette@sfmc.bj, silas@sfmc.bj, admin@sfmc.bj`)
    console.log(`[seed] 👤 Compte user  : demo@sfmc.bj`)
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("[seed] ❌ Erreur, rollback effectué :", err)
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
