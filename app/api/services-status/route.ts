import { serviceDefinitions } from '@/app/lib/service-monitoring'

async function checkService(url: string, validStatuses: readonly number[]) {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    return validStatuses.includes(response.status)
  } catch {
    return false
  }
}

export async function GET() {
  const statuses = await Promise.all(
    serviceDefinitions.map(async (service) => {
      const isOnline = await checkService(`http://localhost:${service.port}${service.path}`, service.validStatuses)
      return [service.name, isOnline ? 'online' : 'offline']
    })
  )

  return Response.json({
    services: Object.fromEntries(statuses),
  })
}