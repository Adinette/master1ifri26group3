import { getServerSession } from 'next-auth/next'

import { authOptions } from '@/app/lib/auth-options'

export async function requireSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      session: null,
      errorResponse: Response.json({ error: 'Authentification requise' }, { status: 401 }),
    }
  }

  return {
    session,
    errorResponse: null,
  }
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      session: null,
      errorResponse: Response.json({ error: 'Authentification requise' }, { status: 401 }),
    }
  }

  if (session.user.role !== 'admin') {
    return {
      session: null,
      errorResponse: Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 }),
    }
  }

  return {
    session,
    errorResponse: null,
  }
}