import amqplib from 'amqplib'
import { applyStockMovement } from './stock-workflow'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3005'
const EXCHANGE = 'sfmc.events'
let consumerStarted = false
let consumerPromise: Promise<void> | null = null

export async function startConsumer() {
  if (consumerStarted && consumerPromise) {
    return consumerPromise
  }

  consumerStarted = true
  consumerPromise = (async () => {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL)
    const ch = await conn.createChannel()

    await ch.assertExchange(EXCHANGE, 'topic', { durable: true })
    const q = await ch.assertQueue('inventory.stock-updated', { durable: true })
    await ch.bindQueue(q.queue, EXCHANGE, 'stock.updated')
    const qFailed = await ch.assertQueue('inventory.order-failed', { durable: true })
    await ch.bindQueue(qFailed.queue, EXCHANGE, 'order.failed')

    console.log('🐇 Consumer RabbitMQ inventory démarré — en attente de stock.updated')

    ch.consume(q.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      console.log('📦 StockUpdated reçu :', data)

      await applyStockMovement({
        productId: Number(data.productId),
        productName: String(data.productName),
        warehouseId: Number(data.warehouseId ?? 1),
        warehouse: typeof data.warehouse === 'string' ? data.warehouse : 'Usine principale',
        type: 'IN',
        quantity: Number(data.quantity),
        reason: `Réapprovisionnement automatique depuis lot ${data.batchId ?? 'production'}`,
      })
      console.log(`✅ Stock réapprovisionné : ${data.productName} → +${data.quantity} unités`)

      // Tenter de valider les commandes pending pour ce produit
      try {
        const resp = await fetch(`${ORDER_SERVICE_URL}/api/orders/fulfill-pending`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: data.productId }),
          cache: 'no-store',
        })
        if (resp.ok) {
          const result = await resp.json() as { fulfilled?: number; total?: number }
          if (result.fulfilled && result.fulfilled > 0) {
            console.log(`🔄 ${result.fulfilled}/${result.total} commandes pending validées pour produit ${data.productId}`)
          }
        }
      } catch {
        console.warn('Order Service indisponible pour fulfill-pending, commandes pending non relancées')
      }

      ch.ack(msg)
    })

    ch.consume(qFailed.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())

      try {
        if (data?.reservedStock) {
          await applyStockMovement({
            productId: Number(data.productId),
            productName: String(data.productName),
            warehouseId: Number(data.warehouseId ?? 1),
            warehouse: typeof data.warehouse === 'string' ? data.warehouse : 'Usine principale',
            type: 'IN',
            quantity: Number(data.quantity),
            reason: `Compensation saga order.failed #${data.orderId ?? 'n/a'}`,
          })
          console.log(`♻️ Compensation stock appliquée pour order.failed #${data.orderId}`)
        }
      } catch (error) {
        console.error('❌ Erreur compensation order.failed:', error)
      } finally {
        ch.ack(msg)
      }
    })
  } catch (error) {
    consumerStarted = false
    consumerPromise = null
    console.error('❌ Erreur consumer RabbitMQ :', error)
    setTimeout(() => {
      void startConsumer()
    }, 5000)
  }
  })()

  return consumerPromise
}