import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const globalForPrisma = global as unknown as { inventoryPrisma?: PrismaClient }

export const prisma =
  globalForPrisma.inventoryPrisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.inventoryPrisma = prisma