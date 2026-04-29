import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/app/lib/require-admin-session'

import {
  findRootAuthUserByEmail,
} from '@/app/lib/root-auth-user-sync'

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requireAdminSession()

  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await params
    const res = await fetch(`${USER_SERVICE}/api/users/${id}`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requireAdminSession()

  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await params
    const body = await req.json()

    const currentUserRes = await fetch(`${USER_SERVICE}/api/users/${id}`, { cache: 'no-store' })
    const currentUserData = await currentUserRes.json()

    if (!currentUserRes.ok) {
      return Response.json(currentUserData, { status: currentUserRes.status })
    }

    const nextEmail = typeof body?.email === 'string' && body.email.trim() ? body.email : currentUserData.email

    if (nextEmail !== currentUserData.email) {
      const existingRootUser = await findRootAuthUserByEmail(nextEmail)

      if (existingRootUser) {
        return Response.json({ error: 'Email déjà utilisé dans l’authentification principale' }, { status: 409 })
      }
    }

    const res = await fetch(`${USER_SERVICE}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requireAdminSession()

  if (errorResponse) {
    return errorResponse
  }

  try {
    const { id } = await params

    const currentUserRes = await fetch(`${USER_SERVICE}/api/users/${id}`, { cache: 'no-store' })
    const currentUserData = await currentUserRes.json()

    if (!currentUserRes.ok) {
      return Response.json(currentUserData, { status: currentUserRes.status })
    }

    const res = await fetch(`${USER_SERVICE}/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()

    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}