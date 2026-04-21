const serviceChecks = [
  { name: 'Auth Service', url: 'http://localhost:3001/api/verify', validStatuses: [200, 401] },
  { name: 'User Service', url: 'http://localhost:3002/api/users', validStatuses: [200] },
  { name: 'Product Service', url: 'http://localhost:3003/api/products', validStatuses: [200] },
  { name: 'Inventory Service', url: 'http://localhost:3004/api/stock', validStatuses: [200] },
  { name: 'Order Service', url: 'http://localhost:3005/api/orders', validStatuses: [200] },
  { name: 'Production Service', url: 'http://localhost:3006/api/production', validStatuses: [200] },
  { name: 'Billing Service', url: 'http://localhost:3007/api/invoices', validStatuses: [200] },
  { name: 'Notification Service', url: 'http://localhost:3008/api/notifications', validStatuses: [200] },
  { name: 'Reporting Service', url: 'http://localhost:3009/api/dashboard', validStatuses: [200] },
] as const

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
    serviceChecks.map(async (service) => {
      const isOnline = await checkService(service.url, service.validStatuses)
      return [service.name, isOnline ? 'online' : 'offline']
    })
  )

  return Response.json({
    services: Object.fromEntries(statuses),
  })
}