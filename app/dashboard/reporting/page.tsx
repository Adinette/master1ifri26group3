'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: number
  status: string
  quantity: number
  createdAt: string
}

type Stock = {
  id: number
  productName: string
  warehouse: string
  quantity: number
  minThreshold: number
}

type Invoice = {
  id: number
  clientName: string
  amount: number
  status: string
}

type Notification = {
  id: number
  type: string
  message: string
  recipient: string
}

type Production = {
  id: number
  productName: string
  quantity: number
  status: string
}

type ServiceStatus = {
  available: boolean
  error: string | null
}

const serviceLabels = {
  orders: 'Order Service',
  stock: 'Inventory Service',
  invoices: 'Billing Service',
  notifications: 'Notification Service',
  production: 'Production Service',
} as const

type ReportingPayload = {
  partial: boolean
  services: {
    orders: ServiceStatus
    stock: ServiceStatus
    invoices: ServiceStatus
    notifications: ServiceStatus
    production: ServiceStatus
  }
  summary: {
    totalOrders: number
    totalStockItems: number
    totalInvoices: number
    paidInvoices: number
    totalNotifications: number
    totalBatches: number
    completedBatches: number
  }
  orders: Order[]
  stock: Stock[]
  invoices: Invoice[]
  notifications: Notification[]
  production: Production[]
}

export default function ReportingPage() {
  const [data, setData] = useState<ReportingPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/reporting/dashboard')
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.error || 'Erreur de chargement')
        }

        setData(payload)
      } catch {
        setError('Impossible de charger le reporting. Vérifie que le service reporting est démarré sur le port 3009.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const lowStockItems = data?.stock.filter((item) => item.quantity <= item.minThreshold) ?? []
  const unavailableServices = data
    ? Object.entries(data.services).filter(([, service]) => !service.available)
    : []

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Reporting global</h1>
        <p className="text-zinc-500">
          Vue d&apos;agrégation Phase 7 : commandes, stock, facturation, notifications et production.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
        </div>
      ) : data ? (
        <>
          {data.partial && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
              <p className="text-sm font-semibold">Affichage partiel du reporting</p>
              <p className="text-sm mt-1">
                Certains services ne répondent pas actuellement :{' '}
                {unavailableServices
                  .map(([serviceName]) => serviceLabels[serviceName as keyof typeof serviceLabels])
                  .join(', ')}.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-zinc-500 mb-1">Commandes</p>
              <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
              <p className="text-xs text-zinc-400 mt-1">Cycle order service</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-zinc-500 mb-1">Stock</p>
              <p className="text-2xl font-bold">{data.summary.totalStockItems}</p>
              <p className="text-xs text-amber-600 mt-1">{lowStockItems.length} stock faible</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-zinc-500 mb-1">Factures</p>
              <p className="text-2xl font-bold">{data.summary.totalInvoices}</p>
              <p className="text-xs text-green-600 mt-1">{data.summary.paidInvoices} payée(s)</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-zinc-500 mb-1">Production</p>
              <p className="text-2xl font-bold">{data.summary.totalBatches}</p>
              <p className="text-xs text-blue-600 mt-1">{data.summary.completedBatches} lot(s) terminés</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Facturation récente</h2>
                <span className="text-xs text-zinc-400">Billing Service</span>
              </div>
              <div className="space-y-3">
                {data.invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{invoice.clientName}</p>
                      <p className="text-xs text-zinc-400">Facture #{invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{invoice.amount.toFixed(2)} €</p>
                      <p className={`text-xs ${invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
                {data.invoices.length === 0 && <p className="text-sm text-zinc-400">Aucune facture disponible.</p>}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <span className="text-xs text-zinc-400">Notification Service</span>
              </div>
              <div className="space-y-3">
                {data.notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="font-medium text-sm">{notification.type}</p>
                      <span className="text-xs text-zinc-400 truncate">{notification.recipient}</span>
                    </div>
                    <p className="text-sm text-zinc-500">{notification.message}</p>
                  </div>
                ))}
                {data.notifications.length === 0 && <p className="text-sm text-zinc-400">Aucune notification disponible.</p>}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Production</h2>
                <span className="text-xs text-zinc-400">Production Service</span>
              </div>
              <div className="space-y-3">
                {data.production.slice(0, 5).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{batch.productName}</p>
                      <p className="text-xs text-zinc-400">Lot #{batch.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{batch.quantity} u.</p>
                      <p className={`text-xs ${batch.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                        {batch.status}
                      </p>
                    </div>
                  </div>
                ))}
                {data.production.length === 0 && <p className="text-sm text-zinc-400">Aucun lot de production disponible.</p>}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stock critique</h2>
                <span className="text-xs text-zinc-400">Inventory Service</span>
              </div>
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900/50 px-4 py-3 bg-amber-50/60 dark:bg-amber-900/10">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-zinc-400">{item.warehouse}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">{item.quantity}</p>
                      <p className="text-xs text-zinc-400">Seuil {item.minThreshold}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && <p className="text-sm text-zinc-400">Aucun stock critique détecté.</p>}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  )
}