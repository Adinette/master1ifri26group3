import { prisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004'
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3007'

/**
 * POST /api/orders/fulfill-pending
 * Appelé par Inventory Service après un réapprovisionnement (stock.updated).
 * Tente de valider les commandes pending pour un produit donné.
 */
export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return Response.json({ error: 'productId requis' }, { status: 400 })
    }

    const pendingOrders = await prisma.order.findMany({
      where: { productId: Number(productId), status: 'pending' },
      orderBy: { createdAt: 'asc' },
    })

    if (pendingOrders.length === 0) {
      return Response.json({ fulfilled: 0, message: 'Aucune commande pending pour ce produit' })
    }

    let fulfilled = 0

    for (const order of pendingOrders) {
      const reserveResponse = await fetch(`${INVENTORY_SERVICE_URL}/api/stock/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: order.productId,
          productName: order.productName,
          quantity: order.quantity,
        }),
        cache: 'no-store',
      })

      if (!reserveResponse.ok) {
        // Stock insuffisant pour cette commande, on passe à la suivante
        continue
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'validated' },
      })

      // Créer la facture automatiquement
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      try {
        await fetch(`${BILLING_SERVICE_URL}/api/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            clientName: order.clientName,
            amount: order.totalPrice,
            dueDate: dueDate.toISOString(),
          }),
          cache: 'no-store',
        })
      } catch {
        console.warn('Billing indisponible pour order', order.id)
      }

      await publishEvent('order.created', {
        orderId: order.id,
        productId: order.productId,
        productName: order.productName,
        quantity: order.quantity,
        clientName: order.clientName,
        status: 'validated',
        source: 'fulfill-pending',
      })

      fulfilled++
      console.log(`Order ${order.id} (${order.productName} x${order.quantity}) → validated`)
    }

    return Response.json({
      fulfilled,
      total: pendingOrders.length,
      message: `${fulfilled}/${pendingOrders.length} commandes validées`,
    })
  } catch (error) {
    console.error('fulfill-pending error:', error)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
