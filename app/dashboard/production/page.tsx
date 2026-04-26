'use client'

import { useEffect, useMemo, useState } from 'react'
import { translateStatus } from '../../lib/format'
import { cachedJson, invalidate } from '../../lib/client-cache'

type ProductionStatus = 'planned' | 'in_progress' | 'completed'

type Product = {
  id: number
  name: string
}

type ProductionBatch = {
  id: number
  productId: number
  productName: string
  quantity: number
  status: ProductionStatus
  startDate: string
  endDate?: string | null
  createdAt?: string
}

const STATUSES: ProductionStatus[] = ['planned', 'in_progress', 'completed']

export default function ProductionPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ productId: '', quantity: '1', startDate: '' })

  const fetchData = async (opts?: { force?: boolean }) => {
    setLoading(true)
    setError('')

    if (opts?.force) {
      invalidate('/api/products')
      invalidate('/api/production')
    }

    try {
      const [productsData, batchesData] = await Promise.all([
        cachedJson<Product[]>('/api/products'),
        cachedJson<ProductionBatch[]>('/api/production'),
      ])
      setProducts(Array.isArray(productsData) ? productsData : [])
      setBatches(Array.isArray(batchesData) ? batchesData : [])
    } catch {
      setError('Impossible de charger la production. Vérifie que les services product et production sont démarrés.')
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

  const filteredBatches = batches.filter((batch) => {
    const query = searchQuery.toLowerCase()
    return (
      batch.productName.toLowerCase().includes(query) ||
      batch.status.toLowerCase().includes(query) ||
      String(batch.id).includes(query)
    )
  })

  const createBatch = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedProduct) {
      alert('Sélectionne un produit valide.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: Number(form.quantity),
          startDate: form.startDate,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de la création du lot')
      }

      setShowModal(false)
      setForm({ productId: '', quantity: '1', startDate: '' })
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (batch: ProductionBatch, status: ProductionStatus) => {
    if (batch.status === status) {
      return
    }

    try {
      const res = await fetch(`/api/production/${batch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de la mise à jour')
      }

      // Le passage en 'completed' génère du stock IN — invalider /api/stock
      if (status === 'completed') invalidate('/api/stock')
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const badgeClass = (status: ProductionStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Production</h1>
          <p className="text-zinc-500 text-sm">Planifiez les lots de fabrication et suivez leur progression jusqu’à la remise en stock.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          Nouveau lot
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Lots</p>
            <p className="text-2xl font-bold">{batches.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Planifiés</p>
            <p className="text-2xl font-bold text-amber-600">{batches.filter((batch) => batch.status === 'planned').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">En cours</p>
            <p className="text-2xl font-bold text-blue-600">{batches.filter((batch) => batch.status === 'in_progress').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Terminés</p>
            <p className="text-2xl font-bold text-green-600">{batches.filter((batch) => batch.status === 'completed').length}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un lot, un produit ou un statut…"
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
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          {searchQuery ? 'Aucun lot correspond à votre recherche.' : 'Aucun lot de production disponible pour le moment.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Lot</th>
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Produit</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Quantité</th>
                  <th className="text-center px-5 py-3.5 font-medium text-zinc-500">Statut</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Début</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Changer le statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">Lot #{batch.id}</p>
                      <p className="text-xs text-zinc-400">Créé pour le produit #{batch.productId}</p>
                    </td>
                    <td className="px-5 py-4 font-medium">{batch.productName}</td>
                    <td className="px-5 py-4 text-right font-medium">{batch.quantity}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass(batch.status)}`}>
                        {translateStatus(batch.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-500">{new Date(batch.startDate).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={batch.status}
                        onChange={(event) => updateStatus(batch, event.target.value as ProductionStatus)}
                        className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {translateStatus(status)}
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
            {filteredBatches.length} lot{filteredBatches.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Nouveau lot de production</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Produit <span className="text-red-500">*</span></label>
                <select
                  value={form.productId}
                  onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Quantité <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                    required
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Date de début <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                    required
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm">
                <p className="text-zinc-500 mb-1">Produit sélectionné</p>
                <p className="text-base font-semibold">{selectedProduct?.name || 'Aucun produit sélectionné'}</p>
                <p className="text-xs text-zinc-400 mt-1">Le lot sera créé avec le statut planned.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
                  {saving ? 'Création…' : 'Créer le lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}