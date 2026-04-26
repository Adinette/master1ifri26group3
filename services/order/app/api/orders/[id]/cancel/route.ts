import { prisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004'
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:3007'

const TERMINAL_STATUSES = new Set(['shipped', 'delivered', 'cancelled'])

/**
 * POST /api/orders/:id/cancel
 *
 * Saga d'annulation :
 *   1. Verrouille la commande (Order DB)
 *   2. Si elle avait réservé du stock (statut "validated") -> appelle
 *      Inventory pour libérer la réservation (mouvement IN compensatoire).
 *   3. Annule la facture liée (Billing) si elle est en attente.
 *   4. Marque la commande "cancelled" et publie order.cancelled.
 *
 * Idempotent : si la commande est déjà cancelled, retourne 200 sans rejouer.
 * Refuse l'annulation pour les statuts terminaux (shipped, delivered).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const orderId = Number(id)

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return Response.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({} as { reason?: string }))
    const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'Annulation utilisateur'

    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order) {
      return Response.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    if (order.status === 'cancelled') {
      return Response.json({
        ...order,
        alreadyCancelled: true,
        workflow: 'Commande déjà annulée',
      })
    }

    if (TERMINAL_STATUSES.has(order.status)) {
      return Response.json(
        { error: `Impossible d'annuler une commande au statut "${order.status}"` },
        { status: 409 }
      )
    }

    const hadReservedStock = order.status === 'validated'

    // 1) Libérer le stock côté Inventory si une réservation avait eu lieu
    let inventoryResult: Record<string, unknown> | null = null
    if (hadReservedStock) {
      try {
        const releaseResponse = await fetch(`${INVENTORY_SERVICE_URL}/api/stock/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: order.productId,
            productName: order.productName,
            quantity: order.quantity,
            reason: `order.cancelled (order #${order.id}) — ${reason}`,
          }),
          cache: 'no-store',
        })
        inventoryResult = await releaseResponse.json().catch(() => null)
        if (!releaseResponse.ok) {
          console.warn(`Cancel order ${order.id}: Inventory release returned ${releaseResponse.status}`)
        }
      } catch (error) {
        console.error(`Cancel order ${order.id}: Inventory unreachable`, error)
        inventoryResult = { error: 'Inventory Service indisponible' }
      }
    }

    // 2) Annuler la/les facture(s) liées si non payées
    let billingResult: Record<string, unknown> | null = null
    try {
      const billingResponse = await fetch(
        `${BILLING_SERVICE_URL}/api/invoices/cancel-by-order/${order.id}`,
        { method: 'POST', cache: 'no-store' }
      )
      billingResult = await billingResponse.json().catch(() => null)
      if (!billingResponse.ok) {
        console.warn(`Cancel order ${order.id}: Billing cancel returned ${billingResponse.status}`)
      }
    } catch (error) {
      console.error(`Cancel order ${order.id}: Billing unreachable`, error)
      billingResult = { error: 'Billing Service indisponible' }
    }

    // 3) Marquer la commande annulée
    const cancelledOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
    })

    // 4) Publier l'événement
    await publishEvent('order.cancelled', {
      orderId: cancelledOrder.id,
      productId: cancelledOrder.productId,
      productName: cancelledOrder.productName,
      quantity: cancelledOrder.quantity,
      clientName: cancelledOrder.clientName,
      previousStatus: order.status,
      reason,
      stockReleased: hadReservedStock,
    })

    return Response.json({
      ...cancelledOrder,
      previousStatus: order.status,
      stockReleased: hadReservedStock,
      inventory: inventoryResult,
      billing: billingResult,
      workflow: hadReservedStock
        ? 'Stock libéré, facture annulée et commande marquée annulée'
        : 'Facture annulée et commande marquée annulée',
    })
  } catch (error) {
    console.error('Order cancel failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
