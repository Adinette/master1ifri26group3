type PrismaClient = import('@prisma/client').PrismaClient

const globalForPrisma = global as unknown as { prisma?: PrismaClient }
let prismaPromise: Promise<PrismaClient> | null = null

export async function getPrisma(): Promise<PrismaClient> {
	if (globalForPrisma.prisma) return globalForPrisma.prisma

	if (!prismaPromise) {
		prismaPromise = (async () => {
			const [{ PrismaClient }, { PrismaPg }, { Pool }] = await Promise.all([
				import('@prisma/client'),
				import('@prisma/adapter-pg'),
				import('pg'),
			])

			const pool = new Pool({ connectionString: process.env.DATABASE_URL })
			const adapter = new PrismaPg(pool)
			const client = new PrismaClient({ adapter })

			if (process.env.NODE_ENV !== 'production') {
				globalForPrisma.prisma = client
			}

			return client
		})()
	}

	return prismaPromise
}