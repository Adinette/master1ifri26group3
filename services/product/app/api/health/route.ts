export async function GET() {
  return Response.json({
    service: 'product-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}