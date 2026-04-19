import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(params.id) },
      include: { payments: true }
    })
    if (!invoice) return Response.json({ error: 'Facture non trouvée' }, { status: 404 })
    return Response.json(invoice)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(params.id) },
      data: body
    })
    return Response.json(invoice)
  } catch {
    return Response.json({ error: 'Facture non trouvée' }, { status: 404 })
  }
}