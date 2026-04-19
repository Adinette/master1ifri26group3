import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(notifications)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}