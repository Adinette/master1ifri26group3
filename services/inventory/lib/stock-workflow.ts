import { prisma } from './prisma'
import { publishEvent } from './rabbitmq'

type StockRecord = {
  id: number
  productId: number
  productName: string
  warehouseId: number
  warehouse: string
  quantity: number
  minThreshold: number
  updatedAt: Date
}

type ReserveStockInput = {
  productId: number
  productName: string
  quantity: number
  reason?: string
}

type MovementInput = {
  productId: number
  productName: string
  warehouseId: number
  type: 'IN' | 'OUT'
  quantity: number
  reason?: string
  warehouse?: string
}

type LowStockTrigger = 'low-threshold' | 'insufficient-stock'

export type StockAlertPayload = {
  trigger: LowStockTrigger
  productId: number
  productName: string
  currentQuantity: number
  minThreshold: number
  requestedQuantity?: number
  availableQuantity?: number
  shortage?: number
  warehouseId?: number
  warehouse?: string
  recommendedProductionQuantity: number
}

export function chooseReservationCandidate(stocks: StockRecord[], requestedQuantity: number) {
  return [...stocks]
    .filter((stock) => stock.quantity >= requestedQuantity)
    .sort((left, right) => {
      if (right.quantity !== left.quantity) {
        return right.quantity - left.quantity
      }
      return left.warehouseId - right.warehouseId
    })[0] ?? null
}

export function buildStockAlertPayload(input: {
  trigger: LowStockTrigger
  productId: number
  productName: string
  currentQuantity: number
  minThreshold: number
  requestedQuantity?: number
  availableQuantity?: number
  warehouseId?: number
  warehouse?: string
}): StockAlertPayload {
  const shortage = input.requestedQuantity
    ? Math.max(input.requestedQuantity - (input.availableQuantity ?? input.currentQuantity), 0)
    : undefined

  return {
    ...input,
    shortage,
    recommendedProductionQuantity:
      shortage && shortage > 0
        ? Math.max(shortage, input.minThreshold * 2)
        : Math.max(input.minThreshold * 2, 1),
  }
}

async function emitLowStockAlert(payload: StockAlertPayload) {
  await publishEvent('stock.alert', payload)
}

export async function reserveStockForOrder(input: ReserveStockInput) {
  const availableStocks = await prisma.stock.findMany({
    where: { productId: input.productId },
    orderBy: [{ quantity: 'desc' }, { warehouseId: 'asc' }],
  })

  const typedStocks = availableStocks as StockRecord[]
  const totalAvailable = typedStocks.reduce((sum: number, stock: StockRecord) => sum + stock.quantity, 0)
  const candidate = chooseReservationCandidate(typedStocks, input.quantity)

  if (!candidate) {
    await emitLowStockAlert(
      buildStockAlertPayload({
        trigger: 'insufficient-stock',
        productId: input.productId,
        productName: input.productName,
        currentQuantity: totalAvailable,
        availableQuantity: totalAvailable,
        requestedQuantity: input.quantity,
        minThreshold: availableStocks[0]?.minThreshold ?? 10,
      })
    )

    return {
      available: false as const,
      totalAvailable,
      requestedQuantity: input.quantity,
      shortage: Math.max(input.quantity - totalAvailable, 0),
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedStock = await tx.stock.update({
      where: { id: candidate.id },
      data: { quantity: { decrement: input.quantity } },
    })

    const movement = await tx.movement.create({
      data: {
        productId: input.productId,
        productName: input.productName,
        warehouseId: candidate.warehouseId,
        type: 'OUT',
        quantity: input.quantity,
        reason: input.reason ?? 'Réservation automatique pour commande validée',
      },
    })

    return { updatedStock, movement }
  })

  if (result.updatedStock.quantity <= candidate.minThreshold) {
    await emitLowStockAlert(
      buildStockAlertPayload({
        trigger: 'low-threshold',
        productId: input.productId,
        productName: input.productName,
        currentQuantity: result.updatedStock.quantity,
        minThreshold: candidate.minThreshold,
        warehouseId: candidate.warehouseId,
        warehouse: candidate.warehouse,
      })
    )
  }

  return {
    available: true as const,
    movement: result.movement,
    stock: result.updatedStock,
    warehouseId: candidate.warehouseId,
    warehouse: candidate.warehouse,
    remainingQuantity: result.updatedStock.quantity,
  }
}

export async function applyStockMovement(input: MovementInput) {
  return prisma.$transaction(async (tx) => {
    const existingStock = await tx.stock.findFirst({
      where: { productId: input.productId, warehouseId: input.warehouseId },
    })

    if (input.type === 'OUT') {
      if (!existingStock || existingStock.quantity < input.quantity) {
        throw new Error('Stock insuffisant pour effectuer la sortie demandée')
      }

      const updatedStock = await tx.stock.update({
        where: { id: existingStock.id },
        data: { quantity: { decrement: input.quantity } },
      })

      const movement = await tx.movement.create({
        data: {
          productId: input.productId,
          productName: input.productName,
          warehouseId: input.warehouseId,
          type: input.type,
          quantity: input.quantity,
          reason: input.reason,
        },
      })

      return {
        movement,
        stock: {
          ...updatedStock,
          warehouse: existingStock.warehouse,
          minThreshold: existingStock.minThreshold,
        },
      }
    }

    const targetStock = existingStock
      ? await tx.stock.update({
          where: { id: existingStock.id },
          data: { quantity: { increment: input.quantity } },
        })
      : await tx.stock.create({
          data: {
            productId: input.productId,
            productName: input.productName,
            warehouseId: input.warehouseId,
            warehouse: input.warehouse ?? `Entrepôt ${input.warehouseId}`,
            quantity: input.quantity,
            minThreshold: 10,
          },
        })

    const movement = await tx.movement.create({
      data: {
        productId: input.productId,
        productName: input.productName,
        warehouseId: input.warehouseId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
      },
    })

    return {
      movement,
      stock: {
        ...targetStock,
        warehouse: existingStock?.warehouse ?? input.warehouse ?? `Entrepôt ${input.warehouseId}`,
        minThreshold: existingStock?.minThreshold ?? 10,
      },
    }
  })
}
