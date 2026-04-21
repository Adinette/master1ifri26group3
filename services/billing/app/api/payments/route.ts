import { createPaymentAndMarkInvoicePaid, listPayments } from '@/lib/billing-store'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const payments = await listPayments()
    return Response.json(payments)
  } catch (error) {
    console.error('Billing GET /api/payments failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, method } = await req.json()
    if (!invoiceId || !amount || !method) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const { payment, invoice } = await createPaymentAndMarkInvoicePaid({
      invoiceId: Number(invoiceId),
      amount: Number(amount),
      method,
    })

    // Publier PaymentConfirmed
    await publishEvent('payment.confirmed', {
      invoiceId: invoice.id,
      orderId: invoice.orderId,
      clientName: invoice.clientName,
      amount: invoice.amount
    })

    return Response.json(payment, { status: 201 })
  } catch (error) {
    console.error('Billing POST /api/payments failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}