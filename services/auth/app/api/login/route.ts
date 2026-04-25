import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { resolveJwtSecret } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return Response.json({ error: 'Mot de passe incorrect' }, { status: 401 })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      resolveJwtSecret(),
      { expiresIn: '24h', algorithm: 'HS256' }
    )

    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}