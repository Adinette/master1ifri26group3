import { NextRequest } from 'next/server'

const PRODUCTION_SERVICE = process.env.PRODUCTION_SERVICE_URL || 'http://localhost:3006'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const res = await fetch(`${PRODUCTION_SERVICE}/api/production/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service production indisponible' }, { status: 503 })
  }
}