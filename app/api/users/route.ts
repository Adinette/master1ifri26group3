import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/app/lib/require-admin-session'

import {
  createRootAuthUser,
  findRootAuthUserByEmail,
} from '@/app/lib/root-auth-user-sync'

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002'

export async function GET() {
  const { errorResponse } = await requireAdminSession()

  if (errorResponse) {
    return errorResponse
  }

  try {
    const res = await fetch(`${USER_SERVICE}/api/users`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession()

  if (errorResponse) {
    return errorResponse
  }

  try {
    const body = await req.json()

    if (typeof body?.email === 'string') {
      const existingRootUser = await findRootAuthUserByEmail(body.email)

      if (existingRootUser) {
        return Response.json({ error: 'Email déjà utilisé dans l’authentification principale' }, { status: 409 })
      }
    }

    const res = await fetch(`${USER_SERVICE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      return Response.json(data, { status: res.status })
    }

    try {
      await createRootAuthUser({
        name: body.name,
        email: body.email,
        password: body.password,
      })
    } catch {
      if (typeof data?.id === 'number') {
        await fetch(`${USER_SERVICE}/api/users/${data.id}`, { method: 'DELETE' })
      }

      return Response.json(
        { error: 'Création annulée: synchronisation impossible avec l’authentification principale' },
        { status: 500 }
      )
    }

    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}