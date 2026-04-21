'use client'

import { useEffect, useMemo, useState } from 'react'

type OrderStatus = 'pending' | 'validated' | 'shipped' | 'delivered'

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

const STATUSES: OrderStatus[] = ['pending', 'validated', 'shipped', 'delivered']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ clientName: '', productId: '', quantity: '1' })

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
      ])

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error('Erreur de chargement')
      }

      const [ordersData, productsData] = await Promise.all([ordersRes.json(), productsRes.json()])
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch {
      setError('Impossible de charger les commandes. Vérifie que les services order et product sont démarrés.')
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

  const filteredOrders = orders.filter((order) => {
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
      fetchData()
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

      fetchData()
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
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Commandes</h1>
          <p className="text-zinc-500 text-sm">Suivez le cycle de vie des commandes et créez de nouvelles demandes client.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle commande
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">
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
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Changer le statut</th>
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
                    <td className="px-5 py-4 text-right font-medium">{order.totalPrice.toFixed(2)} €</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={order.status}
                        onChange={(event) => updateStatus(order, event.target.value as OrderStatus)}
                        className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
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
                      {product.name} — {product.price.toFixed(2)} €
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
                <p className="text-xl font-bold">{estimatedTotal.toFixed(2)} €</p>
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