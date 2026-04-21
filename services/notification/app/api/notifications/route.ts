import { listNotifications } from '@/lib/notification-store'

export async function GET() {
  try {
    const notifications = await listNotifications()
    return Response.json(notifications)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}