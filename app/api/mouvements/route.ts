import { NextRequest } from 'next/server'

const INVENTORY_SERVICE = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004'

export async function GET() {
  try {
    const res = await fetch(`${INVENTORY_SERVICE}/api/mouvements`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service inventaire indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${INVENTORY_SERVICE}/api/mouvements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service inventaire indisponible' }, { status: 503 })
  }
}
