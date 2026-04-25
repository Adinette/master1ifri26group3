import { getPrisma } from '@/lib/prisma'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const prisma = await getPrisma()
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
        batchId: batch.id,
        warehouseId: 1,
        warehouse: 'Usine principale',
      })
    }

    return Response.json(batch)
  } catch {
    return Response.json({ error: 'Batch not found' }, { status: 404 })
  }
}