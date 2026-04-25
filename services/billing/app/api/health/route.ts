export async function GET() {
  return Response.json({
    service: 'billing-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}