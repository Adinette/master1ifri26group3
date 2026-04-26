import { NextRequest } from 'next/server'
import { releaseStockForOrder } from '@/lib/stock-workflow'

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, quantity, warehouseId, reason } = await req.json()

    if (!productId || !productName || !quantity) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const release = await releaseStockForOrder({
      productId: Number(productId),
      productName: String(productName),
      quantity: Number(quantity),
      warehouseId: warehouseId !== undefined ? Number(warehouseId) : undefined,
      reason: typeof reason === 'string' ? reason : 'Annulation de commande',
    })

    return Response.json({
      message: 'Stock libéré et mouvement IN enregistré',
      ...release,
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
