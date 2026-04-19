import { startConsumer } from '@/lib/consumer'

let started = false

export async function GET() {
  if (!started) {
    started = true
    await startConsumer()
  }
  return Response.json({ status: 'Production consumer démarré' })
}