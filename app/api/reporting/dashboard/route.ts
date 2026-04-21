const REPORTING_SERVICE = process.env.REPORTING_SERVICE_URL || 'http://localhost:3009'

export async function GET() {
  try {
    const response = await fetch(`${REPORTING_SERVICE}/api/dashboard`, { cache: 'no-store' })
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch {
    return Response.json({ error: 'Service reporting indisponible' }, { status: 503 })
  }
}