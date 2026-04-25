import amqplib from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
const EXCHANGE = 'sfmc.events'

export type InventoryEventPayload = Record<string, unknown>

export async function publishEvent(routingKey: string, data: InventoryEventPayload) {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL)
    const ch = await conn.createChannel()
    await ch.assertExchange(EXCHANGE, 'topic', { durable: true })
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(data)), {
      persistent: true,
      contentType: 'application/json',
    })
    await ch.close()
    await conn.close()
  } catch (error) {
    console.error('❌ Erreur RabbitMQ inventory :', error)
  }
}
