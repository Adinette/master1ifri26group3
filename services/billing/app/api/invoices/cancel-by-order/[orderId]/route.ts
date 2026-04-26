import { cancelInvoicesByOrder } from '@/lib/billing-store'
import { NextRequest } from 'next/server'

/**
 * POST /api/invoices/cancel-by-order/:orderId
 * Annule toutes les factures non payées liées à une commande.
 * Idempotent : retourne 200 même si aucune facture n'était à annuler.
 */
export async function POST(_: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const id = Number(orderId)

    if (!Number.isFinite(id) || id <= 0) {
      return Response.json({ error: 'orderId invalide' }, { status: 400 })
    }

    const cancelled = await cancelInvoicesByOrder(id)

    return Response.json({
      orderId: id,
      cancelledCount: cancelled.length,
      invoices: cancelled,
    })
  } catch (error) {
    console.error('Billing POST /api/invoices/cancel-by-order failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
