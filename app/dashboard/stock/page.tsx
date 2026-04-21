'use client'

import { useEffect, useState } from 'react'

type StockItem = {
  id: number
  productId: number
  productName: string
  warehouseId: number
  warehouse: string
  quantity: number
  minThreshold: number
  updatedAt: string
}

type Movement = {
  id: number
  productId: number
  productName: string
  warehouseId: number
  type: 'IN' | 'OUT'
  quantity: number
  reason?: string
  createdAt: string
}

type MvtForm = {
  productId: string
  productName: string
  warehouseId: string
  type: 'IN' | 'OUT'
  quantity: string
  reason: string
}

const EMPTY_MVT: MvtForm = {
  productId: '', productName: '', warehouseId: '', type: 'IN', quantity: '', reason: ''
}

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'stock' | 'movements'>('stock')
  const [showMvtModal, setShowMvtModal] = useState(false)
  const [mvtForm, setMvtForm] = useState<MvtForm>(EMPTY_MVT)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [stockRes, mvtRes] = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/mouvements'),
      ])
      if (!stockRes.ok || !mvtRes.ok) throw new Error()
      const [stockData, mvtData] = await Promise.all([stockRes.json(), mvtRes.json()])
      setStocks(Array.isArray(stockData) ? stockData : [])
      setMovements(Array.isArray(mvtData) ? mvtData : [])
    } catch {
      setError('Impossible de charger les données. Le service inventaire est peut-être hors ligne.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleMvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/mouvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(mvtForm.productId),
          productName: mvtForm.productName,
          warehouseId: parseInt(mvtForm.warehouseId),
          type: mvtForm.type,
          quantity: parseInt(mvtForm.quantity),
          reason: mvtForm.reason || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'enregistrement')
      }
      setShowMvtModal(false)
      setMvtForm(EMPTY_MVT)
      fetchData()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const openMvtFromStock = (item: StockItem) => {
    setMvtForm({
      productId: String(item.productId),
      productName: item.productName,
      warehouseId: String(item.warehouseId),
      type: 'IN',
      quantity: '',
      reason: '',
    })
    setShowMvtModal(true)
  }

  const lowStockCount = stocks.filter(s => s.quantity <= s.minThreshold).length

  const filteredStocks = stocks.filter(s =>
    s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.warehouse.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMovements = movements.filter(m =>
    m.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Stock & Inventaire</h1>
          <p className="text-zinc-500 text-sm">Gérez les niveaux de stock et les mouvements.</p>
        </div>
        <button
          onClick={() => { setMvtForm(EMPTY_MVT); setShowMvtModal(true) }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Nouveau mouvement
        </button>
      </div>

      {/* Alerte stock faible */}
      {!loading && lowStockCount > 0 && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{lowStockCount} article{lowStockCount > 1 ? 's' : ''}</span> en stock faible (sous le seuil minimum)
          </p>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Articles en stock</p>
            <p className="text-2xl font-bold">{stocks.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Stock faible</p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {lowStockCount}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Mouvements</p>
            <p className="text-2xl font-bold">{movements.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Entrées / Sorties</p>
            <p className="text-2xl font-bold">
              {movements.filter(m => m.type === 'IN').length} / {movements.filter(m => m.type === 'OUT').length}
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {(['stock', 'movements'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearchQuery('') }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {t === 'stock' ? 'Stock actuel' : 'Historique des mouvements'}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={tab === 'stock' ? 'Rechercher un produit ou entrepôt…' : 'Rechercher un produit…'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full max-w-md border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
          <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Réessayer</button>
        </div>
      ) : tab === 'stock' ? (
        filteredStocks.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-sm">
            {searchQuery ? 'Aucun résultat.' : 'Aucun stock enregistré.'}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Produit</th>
                    <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Entrepôt</th>
                    <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Quantité</th>
                    <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Seuil min.</th>
                    <th className="text-center px-5 py-3.5 font-medium text-zinc-500">Statut</th>
                    <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredStocks.map(item => {
                    const isLow = item.quantity <= item.minThreshold
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-5 py-4 font-medium">{item.productName}</td>
                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{item.warehouse}</td>
                        <td className="px-5 py-4 text-right font-bold">
                          <span className={isLow ? 'text-amber-600' : ''}>{item.quantity}</span>
                        </td>
                        <td className="px-5 py-4 text-right text-zinc-500">{item.minThreshold}</td>
                        <td className="px-5 py-4 text-center">
                          {isLow ? (
                            <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-2.5 py-1 rounded-full">
                              Stock faible
                            </span>
                          ) : (
                            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openMvtFromStock(item)}
                            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Mouvement
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
              {filteredStocks.length} article{filteredStocks.length > 1 ? 's' : ''}
            </div>
          </div>
        )
      ) : (
        filteredMovements.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-sm">
            {searchQuery ? 'Aucun résultat.' : 'Aucun mouvement enregistré.'}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Produit</th>
                    <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Type</th>
                    <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Quantité</th>
                    <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Motif</th>
                    <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredMovements.map(mvt => (
                    <tr key={mvt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-4 font-medium">{mvt.productName}</td>
                      <td className="px-5 py-4">
                        {mvt.type === 'IN' ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Entrée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Sortie
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-medium">{mvt.quantity}</td>
                      <td className="px-5 py-4 text-zinc-500">{mvt.reason || '—'}</td>
                      <td className="px-5 py-4 text-right text-zinc-400 text-xs">
                        {new Date(mvt.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
              {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''}
            </div>
          </div>
        )
      )}

      {/* Modal mouvement */}
      {showMvtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Enregistrer un mouvement</h2>
              <button
                onClick={() => setShowMvtModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleMvtSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ID Produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mvtForm.productId}
                    onChange={e => setMvtForm(f => ({ ...f, productId: e.target.value }))}
                    required
                    placeholder="1"
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ID Entrepôt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mvtForm.warehouseId}
                    onChange={e => setMvtForm(f => ({ ...f, warehouseId: e.target.value }))}
                    required
                    placeholder="1"
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mvtForm.productName}
                  onChange={e => setMvtForm(f => ({ ...f, productName: e.target.value }))}
                  required
                  placeholder="Ex : Farine de blé"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(['IN', 'OUT'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMvtForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                          mvtForm.type === t
                            ? t === 'IN'
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-red-600 text-white border-red-600'
                            : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {t === 'IN' ? '▲ Entrée' : '▼ Sortie'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Quantité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={mvtForm.quantity}
                    onChange={e => setMvtForm(f => ({ ...f, quantity: e.target.value }))}
                    required
                    placeholder="0"
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Motif
                </label>
                <input
                  type="text"
                  value={mvtForm.reason}
                  onChange={e => setMvtForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Ex : Réception commande, Production…"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMvtModal(false)}
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
