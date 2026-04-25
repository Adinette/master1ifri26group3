import amqplib from 'amqplib'
import { applyStockMovement } from './stock-workflow'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
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

      ch.ack(msg)
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