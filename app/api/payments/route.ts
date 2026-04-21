import { NextRequest } from 'next/server'

const BILLING_SERVICE = process.env.BILLING_SERVICE_URL || 'http://localhost:3007'

export async function GET() {
  try {
    const res = await fetch(`${BILLING_SERVICE}/api/payments`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service paiements indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${BILLING_SERVICE}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service paiements indisponible' }, { status: 503 })
  }
}