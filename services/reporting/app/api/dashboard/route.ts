type ServiceResult<T> = {
  available: boolean
  data: T[]
  error: string | null
}

type StatusEntity = {
  status?: string
  createdAt?: string
  created_at?: string
}

type OrderEntity = StatusEntity & {
  totalPrice?: number
}

type StockEntity = StatusEntity & {
  quantity?: number
  minThreshold?: number
  productName?: string
}

type InvoiceEntity = StatusEntity & {
  amount?: number
  paidAt?: string
  paid_at?: string
}

type CollectionEntity = Record<string, unknown> & StatusEntity

// Budget de temps par micro-service : si un service traîne, on n'attend pas
// indéfiniment, on retombe en mode dégradé (available:false) pour ne pas
// bloquer l'ensemble du dashboard. Cible NFR §6 : page < 2s.
const PER_SERVICE_TIMEOUT_MS = 800

async function fetchCollection<T>(url: string): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(PER_SERVICE_TIMEOUT_MS),
    })

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

function getItemDate<T extends StatusEntity>(item: T): Date | null {
  const raw = item.createdAt ?? item.created_at
  return raw ? new Date(raw) : null
}

function filterByPeriod<T extends StatusEntity>(items: T[], from: Date | null, to: Date | null): T[] {
  if (!from && !to) return items
  return items.filter((item) => {
    const d = getItemDate(item)
    if (!d) return true
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const fromParam = url.searchParams.get('from')
  const toParam = url.searchParams.get('to')
  const from = fromParam ? new Date(fromParam) : null
  const to = toParam ? new Date(toParam) : null
  const [ordersResult, stockResult, invoicesResult, notificationsResult, productionResult] = await Promise.all([
    fetchCollection<OrderEntity>('http://localhost:3005/api/orders'),
    fetchCollection<StockEntity>('http://localhost:3004/api/stock'),
    fetchCollection<InvoiceEntity>('http://localhost:3007/api/invoices'),
    fetchCollection<CollectionEntity>('http://localhost:3008/api/notifications'),
    fetchCollection<CollectionEntity>('http://localhost:3006/api/production'),
  ])

  // Appliquer les filtres temporels (from/to)
  const orders = filterByPeriod(ordersResult.data, from, to)
  const stock = stockResult.data // instantané — pas filtré par date
  const invoices = filterByPeriod(invoicesResult.data, from, to)
  const notifications = filterByPeriod(notificationsResult.data, from, to)
  const production = filterByPeriod(productionResult.data, from, to)

  const services = {
    orders: { available: ordersResult.available, error: ordersResult.error },
    stock: { available: stockResult.available, error: stockResult.error },
    invoices: { available: invoicesResult.available, error: invoicesResult.error },
    notifications: { available: notificationsResult.available, error: notificationsResult.error },
    production: { available: productionResult.available, error: productionResult.error },
  }

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)

  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.amount ?? 0), 0)

  const lowStockItems = stock.filter(
    (s) => typeof s.quantity === 'number' && typeof s.minThreshold === 'number' && s.quantity <= s.minThreshold
  )

  return Response.json({
    partial: Object.values(services).some((service) => !service.available),
    services,
        period: {
          from: from?.toISOString() ?? null,
          to: to?.toISOString() ?? null,
          filtered: !!(from || to),
        },
    summary: {
      totalOrders: orders.length,
      pendingOrders: countByStatus(orders, 'pending'),
      validatedOrders: countByStatus(orders, 'validated'),
      shippedOrders: countByStatus(orders, 'shipped'),
      deliveredOrders: countByStatus(orders, 'delivered'),
      cancelledOrders: countByStatus(orders, 'cancelled'),
      totalStockItems: stock.length,
      lowStockItems: lowStockItems.length,
      totalInvoices: invoices.length,
      paidInvoices: countByStatus(invoices, 'paid'),
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingRevenue: Math.round(pendingRevenue * 100) / 100,
      totalNotifications: notifications.length,
      totalBatches: production.length,
      completedBatches: countByStatus(production, 'completed'),
    },
    alerts: {
      lowStock: lowStockItems.map((s) => ({
        productName: s.productName,
        quantity: s.quantity,
        minThreshold: s.minThreshold,
      })),
    },
    orders,
    stock,
    invoices,
    notifications,
    production,
  })
}
