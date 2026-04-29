import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/app/lib/require-admin-session'

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003'

export async function GET() {
  try {
    const res = await fetch(`${PRODUCT_SERVICE}/api/products`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (err) {
    console.error('[BFF Products GET]', err)
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminSession()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const res = await fetch(`${PRODUCT_SERVICE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (err) {
    console.error('[BFF Products POST]', err)
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}
