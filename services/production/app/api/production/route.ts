import { getPrisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prisma = await getPrisma()
    const batches = await prisma.productionBatch.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(batches)
  } catch (error) {
    console.error('[Production Service GET /api/production] Error:', error)
    return Response.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()
    const { productId, productName, quantity, startDate } = await req.json()
    if (!productId || !productName || !quantity || !startDate) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const batch = await prisma.productionBatch.create({
      data: { productId, productName, quantity, status: 'planned', startDate: new Date(startDate) }
    })
    return Response.json(batch, { status: 201 })
  } catch (error) {
    console.error('[Production Service POST /api/production] Error:', error)
    return Response.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 })
  }
}