import amqplib from 'amqplib'
import { prisma } from './prisma'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
const EXCHANGE = 'sfmc.events'

export async function startConsumer() {
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
      await prisma.notification.create({
        data: {
          type: 'order.created',
          message: `Nouvelle commande #${data.orderId} : ${data.quantity}x ${data.productName}`,
          recipient: data.clientName,
          status: 'sent'
        }
      })
      console.log(`📧 Notification OrderCreated → ${data.clientName}`)
      ch.ack(msg)
    })

    ch.consume(q2.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      await prisma.notification.create({
        data: {
          type: 'payment.confirmed',
          message: `Paiement confirmé pour la commande #${data.orderId} — ${data.amount} FCFA`,
          recipient: data.clientName,
          status: 'sent'
        }
      })
      console.log(`📧 Notification PaymentConfirmed → ${data.clientName}`)
      ch.ack(msg)
    })

    ch.consume(q3.queue, async (msg) => {
      if (!msg) return
      const data = JSON.parse(msg.content.toString())
      await prisma.notification.create({
        data: {
          type: 'stock.alert',
          message: `⚠️ Stock critique : ${data.productName} — ${data.quantity} unités restantes`,
          recipient: 'gestionnaire@sfmc.bj',
          status: 'sent'
        }
      })
      console.log(`📧 Notification StockAlert → gestionnaire@sfmc.bj`)
      ch.ack(msg)
    })

  } catch (error) {
    console.error('❌ Erreur consumer Notification :', error)
    setTimeout(startConsumer, 5000)
  }
}