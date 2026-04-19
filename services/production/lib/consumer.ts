import amqplib from 'amqplib'
import { prisma } from './prisma'
import { publishEvent } from './rabbitmq'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
const EXCHANGE = 'sfmc.events'

export async function startConsumer() {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL)
    const ch = await conn.createChannel()
    await ch.assertExchange(EXCHANGE, 'topic', { durable: true })

    // Écoute StockAlert → planifier automatiquement un lot de production
    const q = await ch.assertQueue('production.stock-alert', { durable: true })
    await ch.bindQueue(q.queue, EXCHANGE, 'stock.alert')

    console.log('🐇 Production Consumer démarré — en attente stock.alert')

    ch.consume(q.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      console.log('⚠️ StockAlert reçu :', data)

      // Créer automatiquement un lot de production
      const batch = await prisma.productionBatch.create({
        data: {
          productId: data.productId,
          productName: data.productName,
          quantity: data.quantity * 2,
          status: 'planned',
          startDate: new Date(),
        }
      })

      console.log(`🏭 Lot de production planifié : ${batch.productName} x${batch.quantity}`)
      ch.ack(msg)
    })
  } catch (error) {
    console.error('❌ Erreur consumer Production :', error)
    setTimeout(startConsumer, 5000)
  }
}