import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true }
    })
    if (!user) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    return Response.json(user)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: body,
      select: { id: true, email: true, name: true, role: true, phone: true }
    })
    return Response.json(user)
  } catch {
    return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.user.delete({ where: { id: parseInt(params.id) } })
    return Response.json({ message: 'Utilisateur supprimé' })
  } catch {
    return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
  }
}