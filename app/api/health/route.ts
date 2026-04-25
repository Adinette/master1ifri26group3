export async function GET() {
  return Response.json({
    service: 'gateway-web',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}