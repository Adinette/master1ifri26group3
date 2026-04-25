import amqplib from 'amqplib'
import { getPrisma } from './prisma'

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

    // Listen to stock alerts and create production batches automatically.
    const q = await ch.assertQueue('production.stock-alert', { durable: true })
    await ch.bindQueue(q.queue, EXCHANGE, 'stock.alert')

    console.log('Production consumer started - waiting for stock.alert')

    ch.consume(q.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      console.log('Stock alert received:', data)
      const prisma = await getPrisma()

      // Create a production batch automatically.
      const batch = await prisma.productionBatch.create({
        data: {
          productId: data.productId,
          productName: data.productName,
          quantity: Number(data.recommendedProductionQuantity ?? data.shortage ?? data.quantity ?? 1),
          status: 'planned',
          startDate: new Date(),
        }
      })

      console.log(`Production batch planned: ${batch.productName} x${batch.quantity}`)
      ch.ack(msg)
    })
  } catch (error) {
    consumerStarted = false
    consumerPromise = null
    console.error('Production consumer error:', error)
    setTimeout(() => {
      void startConsumer()
    }, 5000)
  }
  })()

  return consumerPromise
}