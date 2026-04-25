export async function GET() {
  return Response.json({
    service: 'reporting-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}