import { prisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(orders)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientName, productId, productName, quantity, totalPrice } = body

    if (!clientName || !productId || !productName || !quantity || !totalPrice) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const reserveResponse = await fetch(`${INVENTORY_SERVICE_URL}/api/stock/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(productId),
        productName: String(productName),
        quantity: Number(quantity),
      }),
      cache: 'no-store',
    })

    let inventoryResult: Record<string, unknown> | null = null
    try {
      inventoryResult = await reserveResponse.json()
    } catch {
      inventoryResult = null
    }

    if (!reserveResponse.ok && reserveResponse.status !== 409) {
      return Response.json(
        { error: 'Inventory Service indisponible ou erreur de réservation de stock' },
        { status: 503 }
      )
    }

    const orderStatus = reserveResponse.ok ? 'validated' : 'pending'

    const order = await prisma.order.create({
      data: {
        clientName,
        productId,
        quantity,
        productName,
        totalPrice: parseFloat(totalPrice),
        status: orderStatus,
      }
    })

    // Publier l'événement OrderCreated vers RabbitMQ pour notification/reporting.
    await publishEvent('order.created', {
      orderId: order.id,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      clientName: order.clientName,
      status: order.status,
    })

    return Response.json(
      {
        ...order,
        workflow: reserveResponse.ok
          ? 'Stock réservé, commande validée'
          : 'Stock insuffisant, commande en attente et production déclenchée',
        inventory: inventoryResult,
      },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}