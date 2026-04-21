import { NextRequest } from 'next/server'

const PRODUCTION_SERVICE = process.env.PRODUCTION_SERVICE_URL || 'http://localhost:3006'

export async function GET() {
  try {
    const res = await fetch(`${PRODUCTION_SERVICE}/api/production`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service production indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${PRODUCTION_SERVICE}/api/production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service production indisponible' }, { status: 503 })
  }
}