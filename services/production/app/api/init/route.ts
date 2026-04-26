import { startConsumer } from '@/lib/consumer'

export const dynamic = 'force-dynamic'

export async function GET() {
  void startConsumer()
  return Response.json({ status: 'Consumer démarré' })
}