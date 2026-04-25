import { NextRequest } from 'next/server'
import { requireSession } from '@/app/lib/require-admin-session'

const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3005'

export async function GET() {
  try {
    const res = await fetch(`${ORDER_SERVICE}/api/orders`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
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