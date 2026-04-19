import { prisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()
    const batch = await prisma.productionBatch.update({
      where: { id: parseInt(id) },
      data: { status, endDate: status === 'completed' ? new Date() : undefined }
    })

    if (status === 'completed') {
      await publishEvent('stock.updated', {
        productId: batch.productId,
        productName: batch.productName,
        quantity: batch.quantity,
        batchId: batch.id
      })
    }

    return Response.json(batch)
  } catch {
    return Response.json({ error: 'Lot non trouvé' }, { status: 404 })
  }
}