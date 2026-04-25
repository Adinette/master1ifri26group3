import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, name: true, role: true, phone: true },
    })

    if (!user) {
      return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return Response.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}