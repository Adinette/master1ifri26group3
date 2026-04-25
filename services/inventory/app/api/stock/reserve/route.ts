import { NextRequest } from 'next/server'
import { reserveStockForOrder } from '@/lib/stock-workflow'

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, quantity } = await req.json()

    if (!productId || !productName || !quantity) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const reservation = await reserveStockForOrder({
      productId: Number(productId),
      productName: String(productName),
      quantity: Number(quantity),
      reason: 'Réservation automatique depuis Order Service',
    })

    if (!reservation.available) {
      return Response.json(
        {
          message: 'Stock insuffisant — déclenchement de production demandé',
          ...reservation,
        },
        { status: 409 }
      )
    }

    return Response.json({
      message: 'Stock réservé et commande validable',
      ...reservation,
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
