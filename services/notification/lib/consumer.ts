import amqplib from 'amqplib'
import { createNotification } from './notification-store'

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

    // Écoute OrderCreated
    const q1 = await ch.assertQueue('notification.order-created', { durable: true })
    await ch.bindQueue(q1.queue, EXCHANGE, 'order.created')

    // Écoute PaymentConfirmed
    const q2 = await ch.assertQueue('notification.payment-confirmed', { durable: true })
    await ch.bindQueue(q2.queue, EXCHANGE, 'payment.confirmed')

    // Écoute StockAlert
    const q3 = await ch.assertQueue('notification.stock-alert', { durable: true })
    await ch.bindQueue(q3.queue, EXCHANGE, 'stock.alert')

    console.log('🐇 Notification Consumer démarré — écoute 3 queues')

    ch.consume(q1.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      await createNotification({
        type: 'order.created',
        message: `Nouvelle commande #${data.orderId} : ${data.quantity}x ${data.productName}`,
        recipient: data.clientName,
        status: 'sent'
      })
      console.log(`📧 Notification OrderCreated → ${data.clientName}`)
      ch.ack(msg)
    })

    ch.consume(q2.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      await createNotification({
        type: 'payment.confirmed',
        message: `Paiement confirmé pour la commande #${data.orderId} — ${data.amount} FCFA`,
        recipient: data.clientName,
        status: 'sent'
      })
      console.log(`📧 Notification PaymentConfirmed → ${data.clientName}`)
      ch.ack(msg)
    })

    ch.consume(q3.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      await createNotification({
        type: 'stock.alert',
        message:
          data.trigger === 'insufficient-stock'
            ? `⚠️ Stock insuffisant : ${data.productName} — demandé ${data.requestedQuantity}, disponible ${data.availableQuantity ?? data.currentQuantity}`
            : `⚠️ Stock critique : ${data.productName} — ${data.currentQuantity} unités restantes`,
        recipient: 'gestionnaire@sfmc.bj',
        status: 'sent'
      })
      console.log(`📧 Notification StockAlert → gestionnaire@sfmc.bj`)
      ch.ack(msg)
    })

  } catch (error) {
    consumerStarted = false
    consumerPromise = null
    console.error('❌ Erreur consumer Notification :', error)
    setTimeout(() => {
      void startConsumer()
    }, 5000)
  }
  })()

  return consumerPromise
}