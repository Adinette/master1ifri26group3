import { NextRequest } from 'next/server'

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const res = await fetch(`${PRODUCT_SERVICE}/api/products/${id}`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const res = await fetch(`${PRODUCT_SERVICE}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const res = await fetch(`${PRODUCT_SERVICE}/api/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service produits indisponible' }, { status: 503 })
  }
}
