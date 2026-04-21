const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008'

export async function GET() {
  try {
    const res = await fetch(`${NOTIFICATION_SERVICE}/api/notifications`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Service notifications indisponible' }, { status: 503 })
  }
}