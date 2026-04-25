export async function GET() {
  return Response.json({
    service: 'order-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}