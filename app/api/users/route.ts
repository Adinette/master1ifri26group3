import { NextRequest } from 'next/server'

const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002'

export async function GET() {
  try {
    const res = await fetch(`${USER_SERVICE}/api/users`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${USER_SERVICE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service utilisateurs indisponible' }, { status: 503 })
  }
}