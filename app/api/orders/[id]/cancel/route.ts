import { NextRequest } from 'next/server'

const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3005'

/**
 * Proxy: POST /api/orders/:id/cancel  ->  Order Service.
 * Le service Order orchestre la saga (libération stock + annulation facture
 * + publication order.cancelled).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.text()
    const res = await fetch(`${ORDER_SERVICE}/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || '{}',
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service commandes indisponible' }, { status: 503 })
  }
}
