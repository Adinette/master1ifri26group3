import { prisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(payments)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, amount, method } = await req.json()
    if (!invoiceId || !amount || !method) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: { invoiceId, amount: parseFloat(amount), method }
    })

    // Marquer la facture comme payée
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'paid', paidAt: new Date() }
    })

    // Publier PaymentConfirmed
    await publishEvent('payment.confirmed', {
      invoiceId: invoice.id,
      orderId: invoice.orderId,
      clientName: invoice.clientName,
      amount: invoice.amount
    })

    return Response.json(payment, { status: 201 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}