'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Client = {
  id: number
  email: string
  name: string
  role: string
  phone?: string | null
  createdAt?: string
}

type FormData = {
  name: string
  email: string
  password: string
  phone: string
}

const EMPTY_FORM: FormData = { name: '', email: '', password: '', phone: '' }

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)

  const fetchClients = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Erreur de chargement')
      const data: Client[] = await res.json()
      setClients(Array.isArray(data) ? data.filter((u) => u.role === 'client') : [])
    } catch {
      setError('Impossible de charger les clients. Vérifie que le service user est démarré.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.replace('/front/auth/login'); return }
    if (session.user.role !== 'admin') {
      setLoading(false)
      setError('Accès réservé aux administrateurs.')
      return
    }
    fetchClients()
  }, [router, session, status])

  const openCreate = () => { setEditingClient(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (c: Client) => {
    setEditingClient(c)
    setForm({ name: c.name, email: c.email, password: '', phone: c.phone || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = editingClient
        ? { name: form.name, email: form.email, role: 'client', phone: form.phone || undefined }
        : { name: form.name, email: form.email, password: form.password, role: 'client', phone: form.phone || undefined }
      const url = editingClient ? `/api/users/${editingClient.id}` : '/api/users'
      const res = await fetch(url, {
        method: editingClient ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d?.error || 'Erreur') }
      setShowModal(false)
      fetchClients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: Client) => {
    if (!confirm(`Supprimer le client ${c.name} ?`)) return
    try {
      const res = await fetch(`/api/users/${c.id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); throw new Error(d?.error || 'Erreur') }
      fetchClients()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q)
  })

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error === 'Accès réservé aux administrateurs.') {
    return (
      <div className="p-6 lg:p-10">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 max-w-3xl">
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">La gestion des clients est réservée aux administrateurs.</p>
          <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors">
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clients</h1>
          <p className="text-zinc-500 text-sm">Entreprises et particuliers acheteurs de matériaux SFMC.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Voir les commandes
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau client
          </button>
        </div>
      </div>

      {/* KPIs */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Total clients</p>
            <p className="text-2xl font-bold text-teal-600">{clients.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Avec téléphone</p>
            <p className="text-2xl font-bold">{clients.filter((c) => c.phone).length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-zinc-500 mb-1">Résultat recherche</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm mb-3">{error}</p>
          <button onClick={fetchClients} className="text-sm text-teal-600 hover:underline">Réessayer</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <p className="text-5xl mb-4">🤝</p>
          <p className="text-sm">{search ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client enregistré pour le moment.'}</p>
          {!search && (
            <button onClick={openCreate} className="mt-4 text-sm text-teal-600 hover:underline">Créer le premier client</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm font-bold">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{c.email}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  client
                </span>
              </div>

              {c.phone && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {c.phone}
                </div>
              )}

              <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => router.push(`/dashboard/orders?client=${encodeURIComponent(c.name)}`)}
                  className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Commandes
                </button>
                <button
                  onClick={() => openEdit(c)}
                  className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-100 dark:border-red-900 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer count */}
      {!loading && !error && filtered.length > 0 && (
        <p className="mt-6 text-xs text-zinc-400">{filtered.length} client{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}</p>
      )}

      {/* Modal créer / modifier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold">{editingClient ? 'Modifier le client' : 'Nouveau client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nom <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {!editingClient && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Mot de passe <span className="text-red-500">*</span></label>
                  <input type="password" required value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Téléphone</label>
                <input type="text" value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+229 97 00 00 00"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
                  {saving ? 'Enregistrement…' : editingClient ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
