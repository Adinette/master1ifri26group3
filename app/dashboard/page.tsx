'use client'

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

type ServiceStatus = { available: boolean; error: string | null }

type Order = { id: number; status: string; quantity: number; createdAt: string; clientName?: string; totalPrice?: number }
type Stock = { id: number; productName: string; warehouse: string; quantity: number; minThreshold: number }
type Invoice = { id: number; clientName: string; amount: number; status: string }
type Notification = { id: number; type: string; message: string; recipient: string; createdAt?: string }
type Production = { id: number; productName: string; quantity: number; status: string }

type ReportingPayload = {
  partial: boolean
  services: Record<string, ServiceStatus>
  summary: {
    totalOrders: number
    pendingOrders: number
    validatedOrders: number
    shippedOrders: number
    totalStockItems: number
    lowStockItems: number
    totalInvoices: number
    paidInvoices: number
    totalRevenue: number
    pendingRevenue: number
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

type InfraStatus = 'checking' | 'online' | 'offline'

export default function DashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] ?? 'client'

  const [data, setData] = useState<ReportingPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [kongStatus, setKongStatus] = useState<InfraStatus>('checking')
  const [rabbitStatus, setRabbitStatus] = useState<InfraStatus>('checking')
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, InfraStatus>>({})

  useEffect(() => {
    fetch('/api/reporting/dashboard')
      .then(async (r) => {
        const payload = await r.json()
        if (!r.ok) throw new Error(payload?.error || 'Erreur')
        setData(payload)
      })
      .catch(() => setError('Impossible de charger les statistiques. Vérifie que le service reporting est démarré.'))
      .finally(() => setLoading(false))

    fetch('/api/kong-status')
      .then((r) => r.json())
      .then((d) => {
        setKongStatus(d.kong ? 'online' : 'offline')
        setRabbitStatus(d.rabbitmq ? 'online' : 'offline')
      })
      .catch(() => {
        setKongStatus('offline')
        setRabbitStatus('offline')
      })

    fetch('/api/services-status')
      .then((r) => r.json())
      .then((d) => { if (d?.services) setServiceStatuses(d.services) })
      .catch(() => setServiceStatuses({}))
  }, [])

  const orderStatusCounts = useMemo(() => {
    if (!data) return { pending: 0, validated: 0, shipped: 0, cancelled: 0 }
    return {
      pending: data.summary.pendingOrders,
      validated: data.summary.validatedOrders,
      shipped: data.summary.shippedOrders,
      cancelled: Math.max(0, data.summary.totalOrders - data.summary.pendingOrders - data.summary.validatedOrders - data.summary.shippedOrders),
    }
  }, [data])

  const lowStockItems = data?.stock.filter((item) => item.quantity <= item.minThreshold) ?? []
  const onlineServices = Object.values(serviceStatuses).filter((s) => s === 'online').length
  const totalServices = Object.keys(serviceStatuses).length

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Hero compact */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-blue-800 to-blue-900 px-6 py-7 text-white shadow-xl lg:px-9 lg:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wider text-blue-100 mb-2">
              🇧🇯 Tableau de bord
            </span>
            <h1 className="text-xl font-bold lg:text-2xl mb-1">
              Bonjour, {firstName} 👋
            </h1>
            <p className="text-blue-100 text-xs lg:text-sm">
              Vue d&apos;ensemble en temps réel de votre activité
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-blue-800 shadow-md hover:bg-blue-50 transition">
              📦 Nouvelle commande
            </Link>
            <Link href="/dashboard/reporting" className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-medium text-white hover:bg-white/20 transition">
              📊 Reporting détaillé
            </Link>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPI cards */}
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-base font-bold">Statistiques globales</h2>
                <p className="text-xs text-zinc-500">Données consolidées des microservices</p>
              </div>
              {data.partial && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-full px-2.5 py-1">
                  Données partielles
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              <KpiCard icon="📦" label="Commandes" value={data.summary.totalOrders} sub={`${data.summary.pendingOrders} en attente`} tone="blue" />
              <KpiCard icon="🏪" label="Stock" value={data.summary.totalStockItems} sub={`${lowStockItems.length} faibles`} tone={lowStockItems.length > 0 ? 'amber' : 'green'} />
              <KpiCard icon="🧾" label="Factures" value={data.summary.totalInvoices} sub={`${data.summary.paidInvoices} payées`} tone="cyan" />
              <KpiCard icon="🏭" label="Production" value={data.summary.totalBatches} sub={`${data.summary.completedBatches} terminés`} tone="violet" />
              <KpiCard icon="💰" label="Revenus" value={`${(data.summary.totalRevenue ?? 0).toLocaleString()}`} sub={`${(data.summary.pendingRevenue ?? 0).toLocaleString()} en attente`} tone="green" suffix=" FCFA" small />
            </div>
          </section>

          {/* Charts row */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Bar chart commandes par statut */}
            <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Commandes par statut</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Histogramme — répartition globale</p>
                </div>
                <span className="text-xs text-zinc-400">Total : {data.summary.totalOrders}</span>
              </div>
              <BarChart
                data={[
                  { label: 'En attente', value: orderStatusCounts.pending, color: '#F59E0B' },
                  { label: 'Validées', value: orderStatusCounts.validated, color: '#3B82F6' },
                  { label: 'Expédiées', value: orderStatusCounts.shipped, color: '#10B981' },
                  { label: 'Annulées', value: orderStatusCounts.cancelled, color: '#EF4444' },
                ]}
              />
            </div>

            {/* Donut chart factures */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="mb-4">
                <h3 className="font-semibold">Facturation</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Camembert — payées vs en attente</p>
              </div>
              <DonutChart
                segments={[
                  { label: 'Payées', value: data.summary.paidInvoices, color: '#10B981' },
                  { label: 'En attente', value: Math.max(0, data.summary.totalInvoices - data.summary.paidInvoices), color: '#F59E0B' },
                ]}
                centerLabel={`${data.summary.totalInvoices}`}
                centerSub="factures"
              />
            </div>
          </section>

          {/* Recents row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Commandes récentes */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Commandes récentes</h3>
                <Link href="/dashboard/orders" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tout voir →</Link>
              </div>
              <div className="space-y-2">
                {data.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Commande #{order.id}</p>
                      <p className="text-xs text-zinc-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : '—'}
                        {order.clientName ? ` · ${order.clientName}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${orderBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
                {data.orders.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">Aucune commande</p>}
              </div>
            </div>

            {/* Factures récentes */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Factures récentes</h3>
                <Link href="/dashboard/billing" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tout voir →</Link>
              </div>
              <div className="space-y-2">
                {data.invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.clientName}</p>
                      <p className="text-xs text-zinc-400">Facture #{inv.id}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{inv.amount.toFixed(2)} €</p>
                      <p className={`text-xs ${inv.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{inv.status}</p>
                    </div>
                  </div>
                ))}
                {data.invoices.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">Aucune facture</p>}
              </div>
            </div>

            {/* Notifications récentes */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Notifications récentes</h3>
                <Link href="/dashboard/notifications" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tout voir →</Link>
              </div>
              <div className="space-y-2">
                {data.notifications.slice(0, 4).map((n) => (
                  <div key={n.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 truncate">
                        {n.type}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">{n.recipient}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{n.message}</p>
                  </div>
                ))}
                {data.notifications.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">Aucune notification</p>}
              </div>
            </div>

            {/* Stock critique */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Stock critique</h3>
                <Link href="/dashboard/stock" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tout voir →</Link>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-zinc-400">{item.warehouse}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{item.quantity}</p>
                      <p className="text-xs text-zinc-400">seuil {item.minThreshold}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && <p className="text-sm text-green-600 dark:text-green-400 text-center py-4">✓ Tous les stocks sont à niveau</p>}
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">Infrastructure & microservices</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{onlineServices}/{totalServices} services en ligne</p>
              </div>
              <Link href="/dashboard/services" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Détail →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              <InfraDot label="Kong" status={kongStatus} />
              <InfraDot label="RabbitMQ" status={rabbitStatus} />
              {Object.entries(serviceStatuses).slice(0, 6).map(([name, status]) => (
                <InfraDot key={name} label={name.replace(/-service$/, '')} status={status} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function orderBadge(status: string) {
  const s = status.toLowerCase()
  if (s.includes('pend') || s.includes('attente')) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
  if (s.includes('valid')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  if (s.includes('ship') || s.includes('expéd')) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  if (s.includes('cancel') || s.includes('annul')) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
}

/* ── Components ──────────────────────────────────────────────────────── */

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
  suffix,
  small,
}: {
  icon: string
  label: string
  value: number | string
  sub?: string
  tone: 'blue' | 'green' | 'amber' | 'cyan' | 'violet'
  suffix?: string
  small?: boolean
}) {
  const toneMap = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
    cyan: 'from-cyan-500 to-sky-600',
    violet: 'from-violet-500 to-purple-600',
  }
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${toneMap[tone]} text-white text-base shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className={`font-bold ${small ? 'text-lg' : 'text-2xl'} text-zinc-900 dark:text-zinc-50`}>
        {value}{suffix}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

function BarChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const W = 480
  const H = 200
  const padding = { top: 10, right: 10, bottom: 30, left: 30 }
  const chartW = W - padding.left - padding.right
  const chartH = H - padding.top - padding.bottom
  const barW = chartW / data.length - 16

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={padding.left}
            x2={W - padding.right}
            y1={padding.top + chartH * p}
            y2={padding.top + chartH * p}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeWidth="1"
          />
        ))}
        {/* Y axis labels */}
        {[0, 0.5, 1].map((p) => (
          <text
            key={p}
            x={padding.left - 6}
            y={padding.top + chartH * (1 - p) + 4}
            textAnchor="end"
            className="fill-zinc-400 text-[10px]"
          >
            {Math.round(max * p)}
          </text>
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const h = (d.value / max) * chartH
          const x = padding.left + i * (chartW / data.length) + 8
          const y = padding.top + chartH - h
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={h} rx={6} fill={d.color}>
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-zinc-700 dark:fill-zinc-200 text-[11px] font-semibold"
              >
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={H - 10}
                textAnchor="middle"
                className="fill-zinc-500 text-[10px]"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DonutChart({
  segments,
  centerLabel,
  centerSub,
}: {
  segments: Array<{ label: string; value: number; color: string }>
  centerLabel: string
  centerSub?: string
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = 60
  const stroke = 22
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const arcs = segments.map((s) => {
    const length = total === 0 ? 0 : (s.value / total) * circumference
    const arc = {
      ...s,
      length,
      offset,
      pct: total === 0 ? 0 : (s.value / total) * 100,
    }
    offset += length
    return arc
  })

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0 -rotate-90">
        {/* Track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-zinc-100 dark:text-zinc-800"
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.length} ${circumference}`}
            strokeDashoffset={-a.offset}
            strokeLinecap="butt"
          >
            <title>{`${a.label}: ${a.value} (${a.pct.toFixed(0)}%)`}</title>
          </circle>
        ))}
        {/* Center text — rotate back so it's upright */}
        <g transform="rotate(90 80 80)">
          <text x="80" y="76" textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50 text-xl font-bold">
            {centerLabel}
          </text>
          {centerSub && (
            <text x="80" y="92" textAnchor="middle" className="fill-zinc-400 text-[10px] uppercase tracking-wider">
              {centerSub}
            </text>
          )}
        </g>
      </svg>
      <div className="flex-1 space-y-2">
        {arcs.map((a) => (
          <div key={a.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{a.label}</span>
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
              {a.value} <span className="text-zinc-400 font-normal">({a.pct.toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfraDot({ label, status }: { label: string; status: InfraStatus }) {
  const dot =
    status === 'online' ? 'bg-green-500'
    : status === 'offline' ? 'bg-red-500'
    : 'bg-zinc-400 animate-pulse'
  const textColor =
    status === 'online' ? 'text-green-700 dark:text-green-400'
    : status === 'offline' ? 'text-red-700 dark:text-red-400'
    : 'text-zinc-500'

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 px-2.5 py-2">
      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
      <span className="text-xs font-medium truncate flex-1">{label}</span>
      <span className={`text-[10px] uppercase font-semibold ${textColor}`}>
        {status === 'online' ? 'OK' : status === 'offline' ? 'KO' : '...'}
      </span>
    </div>
  )
}
