import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()
    if (!email || !password || !name) return Response.json({ error: 'Champs requis manquants' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return Response.json({ error: 'Email déjà utilisé' }, { status: 409 })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hash, name, role: role || 'user' }
    })

    return Response.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}