'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { formatFCFA, translateStatus } from '../../lib/format'
import { cachedJson, invalidate } from '../../lib/client-cache'

type OrderStatus = 'pending' | 'validated' | 'shipped' | 'delivered' | 'cancelled' | 'failed'

type Order = {
  id: number
  clientName: string
  productId: number
  productName: string
  quantity: number
  totalPrice: number
  status: OrderStatus
  createdAt?: string
}

type Product = {
  id: number
  name: string
  price: number
}

// Statuts proposables via le menu déroulant. L'annulation passe par un
// bouton dédié qui déclenche la saga (libération stock + facture).
const STATUSES: OrderStatus[] = ['pending', 'validated', 'shipped', 'delivered']
const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set(['shipped', 'delivered', 'cancelled'])

export default function OrdersPage() {
  const { data: session } = useSession()
  const role = session?.user?.role ?? 'user'
  const isClient = role === 'client' || role === 'user'
  const canManage = role === 'admin' || role === 'operator'

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ clientName: session?.user?.name ?? '', productId: '', quantity: '1' })

  const fetchData = async (opts?: { force?: boolean }) => {
    setLoading(true)
    setError('')

    if (opts?.force) {
      invalidate('/api/orders')
      invalidate('/api/products')
    }

    try {
      const [ordersData, productsData] = await Promise.all([
        cachedJson<Order[]>('/api/orders'),
        cachedJson<Product[]>('/api/products'),
      ])
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch {
      // En cas d'erreur service, on affiche simplement un tableau vide
      // (pas d'erreur visible pour l'utilisateur)
      setOrders([])
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(form.productId)) ?? null,
    [form.productId, products]
  )

  const estimatedTotal = selectedProduct ? selectedProduct.price * Math.max(Number(form.quantity) || 0, 0) : 0

  // RBAC : un client ne voit que ses propres commandes (matchées par nom).
  const visibleOrders = useMemo(() => {
    if (!isClient) return orders
    const myName = (session?.user?.name ?? '').trim().toLowerCase()
    if (!myName) return []
    return orders.filter((o) => o.clientName.trim().toLowerCase() === myName)
  }, [orders, isClient, session?.user?.name])

  const filteredOrders = visibleOrders.filter((order) => {
    const query = searchQuery.toLowerCase()
    return (
      order.clientName.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    )
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedProduct) {
      alert('Sélectionne un produit valide.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: Number(form.quantity),
          totalPrice: estimatedTotal,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de la création')
      }

      setShowModal(false)
      setForm({ clientName: '', productId: '', quantity: '1' })
      // La création impacte stock et factures (saga complet) — on invalide.
      invalidate('/api/stock')
      invalidate('/api/invoices')
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (order: Order, status: OrderStatus) => {
    if (order.status === status) {
      return
    }

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de la mise à jour')
      }

      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const cancelOrder = async (order: Order) => {
    if (TERMINAL_STATUSES.has(order.status)) {
      return
    }

    const confirmation = window.confirm(
      `Annuler la commande #${order.id} de ${order.clientName} ?\n\nLe stock réservé sera libéré et la facture associée (si non payée) sera annulée.`
    )
    if (!confirmation) return

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Annulation depuis le tableau de bord' }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l'annulation")
      }

      // L'annulation impacte stock + factures — on invalide aussi pour que
      // les autres pages voient la mise à jour au prochain affichage.
      invalidate('/api/stock')
      invalidate('/api/invoices')
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const badgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
      case 'validated':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'shipped':
        return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'failed':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">{isClient ? 'Mes commandes' : 'Commandes'}</h1>
          <p className="text-zinc-500 text-sm">
            {isClient
              ? 'Suivez le statut de vos commandes en temps réel.'
              : 'Suivez le cycle de vie des commandes et créez de nouvelles demandes client.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle commande
          </button>
        )}
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Total commandes</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">En attente</p>
            <p className="text-2xl font-bold text-amber-600">{orders.filter((order) => order.status === 'pending').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">En expédition</p>
            <p className="text-2xl font-bold text-violet-600">{orders.filter((order) => order.status === 'shipped').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Livrées</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter((order) => order.status === 'delivered').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Annulées</p>
            <p className="text-2xl font-bold text-red-600">{orders.filter((order) => order.status === 'cancelled').length}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une commande, un client, un produit ou un statut…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full max-w-md border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
          <button onClick={() => fetchData({ force: true })} className="text-sm text-blue-600 hover:underline">
            Réessayer
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          {searchQuery ? 'Aucune commande correspond à votre recherche.' : 'Aucune commande enregistrée pour le moment.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Client</th>
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Produit</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Quantité</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Montant</th>
                  <th className="text-center px-5 py-3.5 font-medium text-zinc-500">Statut</th>
                  {canManage && <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Changer le statut</th>}
                  {canManage && <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">{order.clientName}</p>
                      <p className="text-xs text-zinc-400">Commande #{order.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{order.productName}</p>
                      <p className="text-xs text-zinc-400">Produit #{order.productId}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">{order.quantity}</td>
                    <td className="px-5 py-4 text-right font-medium">{formatFCFA(order.totalPrice)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        <select
                          value={STATUSES.includes(order.status as OrderStatus) ? order.status : ''}
                          disabled={TERMINAL_STATUSES.has(order.status)}
                          onChange={(event) => updateStatus(order, event.target.value as OrderStatus)}
                          className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {translateStatus(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => cancelOrder(order)}
                          disabled={TERMINAL_STATUSES.has(order.status)}
                          title={
                            TERMINAL_STATUSES.has(order.status)
                              ? 'Cette commande ne peut plus être annulée'
                              : 'Annule la commande, libère le stock et annule la facture associée'
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-zinc-900"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Annuler
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Nouvelle commande</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nom du client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                  required
                  placeholder="Ex : Entreprise BTP Ahouansou"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Produit <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.productId}
                  onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatFCFA(product.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Quantité <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm">
                <p className="text-zinc-500 mb-1">Montant estimé</p>
                <p className="text-xl font-bold">{formatFCFA(estimatedTotal)}</p>
                <p className="text-xs text-zinc-400 mt-1">Calculé à partir du produit sélectionné et de la quantité.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Création…' : 'Créer la commande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}