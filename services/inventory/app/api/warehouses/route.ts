import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { stocks: true } },
      },
    })
    return Response.json(warehouses)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, location } = await req.json()
    if (!name) {
      return Response.json({ error: 'Le nom de l\'entrepôt est requis' }, { status: 400 })
    }
    const warehouse = await prisma.warehouse.create({
      data: { name, location },
    })
    return Response.json(warehouse, { status: 201 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
