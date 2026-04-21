import { NextRequest } from 'next/server'

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003'

export async function GET() {
  try {
    const res = await fetch(`${PRODUCT_SERVICE}/api/products`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${PRODUCT_SERVICE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}
