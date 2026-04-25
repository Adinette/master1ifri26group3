export async function GET() {
  return Response.json({
    service: 'inventory-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}