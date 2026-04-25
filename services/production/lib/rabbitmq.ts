import amqplib from 'amqplib'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
const EXCHANGE = 'sfmc.events'

export async function publishEvent(routingKey: string, data: object) {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL)
    const ch = await conn.createChannel()
    await ch.assertExchange(EXCHANGE, 'topic', { durable: true })
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(data)))
    await ch.close()
    await conn.close()
    console.log(`Event published: ${routingKey}`)
  } catch (error) {
    console.error('RabbitMQ error:', error)
  }
}