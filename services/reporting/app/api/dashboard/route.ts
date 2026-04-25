type ServiceResult<T> = {
  available: boolean
  data: T[]
  error: string | null
}

type StatusEntity = {
  status?: string
}

type CollectionEntity = Record<string, unknown> & StatusEntity

async function fetchCollection<T>(url: string): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()

    return {
      available: true,
      data: Array.isArray(payload) ? payload : [],
      error: null,
    }
  } catch (error) {
    return {
      available: false,
      data: [],
      error: error instanceof Error ? error.message : 'Service indisponible',
    }
  }
}

function countByStatus<T extends StatusEntity>(items: T[], status: string) {
  return items.filter((item) => item.status === status).length
}

export async function GET() {
  const [ordersResult, stockResult, invoicesResult, notificationsResult, productionResult] = await Promise.all([
    fetchCollection<CollectionEntity>('http://localhost:3005/api/orders'),
    fetchCollection<CollectionEntity>('http://localhost:3004/api/stock'),
    fetchCollection<CollectionEntity>('http://localhost:3007/api/invoices'),
    fetchCollection<CollectionEntity>('http://localhost:3008/api/notifications'),
    fetchCollection<CollectionEntity>('http://localhost:3006/api/production'),
  ])

  const orders = ordersResult.data
  const stock = stockResult.data
  const invoices = invoicesResult.data
  const notifications = notificationsResult.data
  const production = productionResult.data

  const services = {
    orders: { available: ordersResult.available, error: ordersResult.error },
    stock: { available: stockResult.available, error: stockResult.error },
    invoices: { available: invoicesResult.available, error: invoicesResult.error },
    notifications: { available: notificationsResult.available, error: notificationsResult.error },
    production: { available: productionResult.available, error: productionResult.error },
  }

  return Response.json({
    partial: Object.values(services).some((service) => !service.available),
    services,
    summary: {
      totalOrders: orders.length,
      totalStockItems: stock.length,
      totalInvoices: invoices.length,
      paidInvoices: countByStatus(invoices, 'paid'),
      totalNotifications: notifications.length,
      totalBatches: production.length,
      completedBatches: countByStatus(production, 'completed'),
    },
    orders,
    stock,
    invoices,
    notifications,
    production,
  })
}