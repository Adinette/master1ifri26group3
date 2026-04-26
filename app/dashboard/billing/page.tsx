'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatFCFA, translateStatus } from '../../lib/format'
import { cachedJson, invalidate } from '../../lib/client-cache'

type Order = {
  id: number
  clientName: string
  productName: string
  totalPrice: number
  status: string
}

type Payment = {
  id: number
  invoiceId: number
  amount: number
  method: string
  createdAt?: string
}

type Invoice = {
  id: number
  orderId: number
  clientName: string
  amount: number
  status: string
  dueDate: string
  paidAt?: string | null
  createdAt?: string
  payments?: Payment[]
}

export default function BillingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ orderId: '', dueDate: '' })
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', amount: '', method: 'cash' })

  const fetchData = async (opts?: { force?: boolean }) => {
    setLoading(true)
    setError('')

    if (opts?.force) {
      invalidate('/api/orders')
      invalidate('/api/invoices')
      invalidate('/api/payments')
    }

    try {
      const [ordersData, invoicesData, paymentsData] = await Promise.all([
        cachedJson<Order[]>('/api/orders'),
        cachedJson<Invoice[]>('/api/invoices'),
        cachedJson<Payment[]>('/api/payments'),
      ])

      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
    } catch {
      setError('Impossible de charger la facturation. Vérifie que les services order et billing sont démarrés.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === Number(invoiceForm.orderId)) ?? null,
    [invoiceForm.orderId, orders]
  )

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === Number(paymentForm.invoiceId)) ?? null,
    [invoices, paymentForm.invoiceId]
  )

  const invoiceableOrders = useMemo(() => {
    const invoicedOrderIds = new Set(invoices.map((invoice) => invoice.orderId))
    return orders.filter((order) => !invoicedOrderIds.has(order.id))
  }, [invoices, orders])

  const filteredInvoices = invoices.filter((invoice) => {
    const query = searchQuery.toLowerCase()
    return (
      invoice.clientName.toLowerCase().includes(query) ||
      invoice.status.toLowerCase().includes(query) ||
      String(invoice.orderId).includes(query)
    )
  })

  const createInvoice = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedOrder) {
      alert('Sélectionne une commande valide.')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          clientName: selectedOrder.clientName,
          amount: selectedOrder.totalPrice,
          dueDate: invoiceForm.dueDate,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de la création de la facture')
      }

      setShowInvoiceModal(false)
      setInvoiceForm({ orderId: '', dueDate: '' })
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const createPayment = async (event: React.FormEvent) => {
    event.preventDefault()

    setSaving(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: Number(paymentForm.invoiceId),
          amount: Number(paymentForm.amount),
          method: paymentForm.method,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || 'Erreur lors de l’enregistrement du paiement')
      }

      setShowPaymentModal(false)
      setPaymentForm({ invoiceId: '', amount: '', method: 'cash' })
      fetchData({ force: true })
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Facturation</h1>
          <p className="text-zinc-500 text-sm">Générez des factures à partir des commandes et enregistrez les paiements clients.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Nouvelle facture
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Enregistrer paiement
          </button>
        </div>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Factures</p>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">En attente</p>
            <p className="text-2xl font-bold text-amber-600">{invoices.filter((invoice) => invoice.status === 'pending').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Payées</p>
            <p className="text-2xl font-bold text-green-600">{invoices.filter((invoice) => invoice.status === 'paid').length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Paiements</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une facture, un client, un statut ou un numéro de commande…"
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
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          {searchQuery ? 'Aucune facture correspond à votre recherche.' : 'Aucune facture disponible pour le moment.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Client</th>
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Commande</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Montant</th>
                  <th className="text-center px-5 py-3.5 font-medium text-zinc-500">Statut</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Échéance</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Paiements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-xs text-zinc-400">Facture #{invoice.id}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">Commande #{invoice.orderId}</td>
                    <td className="px-5 py-4 text-right font-medium">{formatFCFA(invoice.amount)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {translateStatus(invoice.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-500">
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-500">{invoice.payments?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
            {filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Nouvelle facture</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Commande <span className="text-red-500">*</span></label>
                <select
                  value={invoiceForm.orderId}
                  onChange={(event) => setInvoiceForm((current) => ({ ...current, orderId: event.target.value }))}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner…</option>
                  {invoiceableOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      Commande #{order.id} — {order.clientName} — {formatFCFA(order.totalPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Date d’échéance <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(event) => setInvoiceForm((current) => ({ ...current, dueDate: event.target.value }))}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm">
                <p className="text-zinc-500 mb-1">Montant de la facture</p>
                <p className="text-xl font-bold">{selectedOrder ? formatFCFA(selectedOrder.totalPrice) : formatFCFA(0)}</p>
                <p className="text-xs text-zinc-400 mt-1">Le montant est repris depuis la commande sélectionnée.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
                  {saving ? 'Création…' : 'Créer la facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">Enregistrer un paiement</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Facture <span className="text-red-500">*</span></label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(event) => {
                    const invoiceId = event.target.value
                    const invoice = invoices.find((current) => current.id === Number(invoiceId))
                    setPaymentForm((current) => ({
                      ...current,
                      invoiceId,
                      amount: invoice ? String(invoice.amount) : current.amount,
                    }))
                  }}
                  required
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner…</option>
                  {invoices.filter((invoice) => invoice.status !== 'paid').map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      Facture #{invoice.id} — {invoice.clientName} — {formatFCFA(invoice.amount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Montant <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
                    required
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Méthode <span className="text-red-500">*</span></label>
                  <select
                    value={paymentForm.method}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}
                    required
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">cash</option>
                    <option value="mobile_money">mobile_money</option>
                    <option value="bank_transfer">bank_transfer</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm">
                <p className="text-zinc-500 mb-1">Facture sélectionnée</p>
                <p className="text-base font-semibold">{selectedInvoice ? `${selectedInvoice.clientName} — ${formatFCFA(selectedInvoice.amount)}` : 'Aucune facture sélectionnée'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
                  {saving ? 'Enregistrement…' : 'Enregistrer le paiement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}