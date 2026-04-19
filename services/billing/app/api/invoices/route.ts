import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { payments: true },
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(invoices)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, clientName, amount, dueDate } = await req.json()
    if (!orderId || !clientName || !amount || !dueDate) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }
    const invoice = await prisma.invoice.create({
      data: { orderId, clientName, amount: parseFloat(amount), status: 'pending', dueDate: new Date(dueDate) }
    })
    return Response.json(invoice, { status: 201 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}