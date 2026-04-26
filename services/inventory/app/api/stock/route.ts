import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({ orderBy: { productName: 'asc' } })
    return Response.json(stocks)
  } catch (error) {
    console.error('[Inventory GET /api/stock] Error:', error)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, productName, warehouseId, warehouse, quantity, minThreshold } = body

    if (!productId || !productName || !warehouseId || !warehouse) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const stock = await prisma.stock.create({
      data: { productId, productName, warehouseId, warehouse, quantity: quantity || 0, minThreshold: minThreshold || 10 }
    })
    return Response.json(stock, { status: 201 })
  } catch (error) {
    console.error('[Inventory POST /api/stock] Error:', error)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}