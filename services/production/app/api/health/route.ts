export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    service: 'production-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}