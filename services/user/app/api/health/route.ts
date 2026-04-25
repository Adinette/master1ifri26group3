export async function GET() {
  return Response.json({
    service: 'user-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}