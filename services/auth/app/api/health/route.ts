export async function GET() {
  return Response.json({
    service: 'auth-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}