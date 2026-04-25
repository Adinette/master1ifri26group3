import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { resolveJwtSecret } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return Response.json({ error: 'Token manquant' }, { status: 401 })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, resolveJwtSecret(), { algorithms: ['HS256'] })
    return Response.json({ valid: true, user: decoded })
  } catch {
    return Response.json({ valid: false, error: 'Token invalide' }, { status: 401 })
  }
}