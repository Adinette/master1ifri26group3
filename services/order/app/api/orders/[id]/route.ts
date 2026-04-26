import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } })
    if (!order) return Response.json({ error: 'Commande non trouvée' }, { status: 404 })
    return Response.json(order)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const validStatuses = ['pending', 'validated', 'shipped', 'delivered', 'cancelled', 'failed']
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    })
    return Response.json(order)
  } catch {
    return Response.json({ error: 'Commande non trouvée' }, { status: 404 })
  }
}