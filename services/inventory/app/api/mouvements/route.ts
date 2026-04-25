import { prisma } from '@/lib/prisma'
import { applyStockMovement, buildStockAlertPayload } from '@/lib/stock-workflow'
import { publishEvent } from '@/lib/rabbitmq'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const movements = await prisma.movement.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(movements)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, productName, warehouseId, type, quantity, reason } = body

    if (!productId || !productName || !warehouseId || !type || !quantity) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    if (!['IN', 'OUT'].includes(type)) {
      return Response.json({ error: 'Type doit être IN ou OUT' }, { status: 400 })
    }

    const result = await applyStockMovement({
      productId: Number(productId),
      productName: String(productName),
      warehouseId: Number(warehouseId),
      type,
      quantity: Number(quantity),
      reason,
    })

    if (type === 'OUT' && result.stock.quantity <= result.stock.minThreshold) {
      await publishEvent(
        'stock.alert',
        buildStockAlertPayload({
          trigger: 'low-threshold',
          productId: Number(productId),
          productName: String(productName),
          currentQuantity: result.stock.quantity,
          minThreshold: result.stock.minThreshold,
          warehouseId: result.stock.warehouseId,
          warehouse: result.stock.warehouse,
        })
      )
    }

    return Response.json(result.movement, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: error instanceof Error && error.message.includes('insuffisant') ? 409 : 500 }
    )
  }
}