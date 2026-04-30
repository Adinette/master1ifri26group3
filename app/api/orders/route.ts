import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth-options'
import { requireSession } from '@/app/lib/require-admin-session'

const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3005'

export async function GET() {
  try {
    const res = await fetch(`${ORDER_SERVICE}/api/orders`, { cache: 'no-store' })
    const data = await res.json()

    // RBAC: filtrer côté serveur si l'utilisateur est un client
    const session = await getServerSession(authOptions)
    const role = session?.user?.role
    if (role === 'client' || role === 'user') {
      const myName = (session?.user?.name ?? '').trim().toLowerCase()
      if (Array.isArray(data)) {
        return Response.json(
          data.filter((order: { clientName?: string }) =>
            order.clientName?.trim().toLowerCase() === myName
          ),
          { status: res.status }
        )
      }
    }

    return Response.json(data, { status: res.status })
  } catch (err) {
    console.error('[API Orders] GET error:', err)
    return Response.json({ error: 'Service commandes indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSession()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const res = await fetch(`${ORDER_SERVICE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service commandes indisponible' }, { status: 503 })
  }
}