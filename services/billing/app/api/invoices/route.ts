import { createInvoice, listInvoices } from '@/lib/billing-store'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const invoices = await listInvoices()
    return Response.json(invoices)
  } catch (error) {
    console.error('Billing GET /api/invoices failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, clientName, amount, dueDate } = await req.json()
    if (!orderId || !clientName || !amount || !dueDate) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const invoice = await createInvoice({
      orderId: Number(orderId),
      clientName,
      amount: Number(amount),
      dueDate: new Date(dueDate),
    })
    return Response.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Billing POST /api/invoices failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}