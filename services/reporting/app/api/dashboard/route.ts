export async function GET() {
  try {
    const [orders, stock, invoices, notifications, production] = await Promise.all([
      fetch('http://localhost:3005/api/orders').then(r => r.json()),
      fetch('http://localhost:3004/api/stock').then(r => r.json()),
      fetch('http://localhost:3007/api/invoices').then(r => r.json()),
      fetch('http://localhost:3008/api/notifications').then(r => r.json()),
      fetch('http://localhost:3006/api/production').then(r => r.json()),
    ])

    return Response.json({
      summary: {
        totalOrders: orders.length,
        totalStockItems: stock.length,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i: any) => i.status === 'paid').length,
        totalNotifications: notifications.length,
        totalBatches: production.length,
        completedBatches: production.filter((p: any) => p.status === 'completed').length,
      },
      orders,
      stock,
      invoices,
      notifications,
      production
    })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}