'use client'

import { useEffect, useMemo, useState } from 'react'

type Notification = {
  id: number
  type: string
  message: string
  recipient: string
  status: string
  createdAt?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/notifications')

      if (!res.ok) {
        throw new Error('Erreur de chargement')
      }

      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch {
      setError('Impossible de charger les notifications. Vérifie que le service notification est démarré et que son consumer a bien été initialisé.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return notifications.filter((notification) => (
      notification.type.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.recipient.toLowerCase().includes(query) ||
      notification.status.toLowerCase().includes(query)
    ))
  }, [notifications, searchQuery])

  const sentCount = notifications.filter((notification) => notification.status === 'sent').length
  const uniqueRecipients = new Set(notifications.map((notification) => notification.recipient)).size
  const uniqueTypes = new Set(notifications.map((notification) => notification.type)).size

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notifications</h1>
          <p className="text-zinc-500 text-sm">Consultez les messages générés par le Notification Service à partir des événements RabbitMQ.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Actualiser
        </button>
      </div>

      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Notifications</p>
            <p className="text-2xl font-bold">{notifications.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Envoyées</p>
            <p className="text-2xl font-bold text-green-600">{sentCount}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Destinataires</p>
            <p className="text-2xl font-bold text-blue-600">{uniqueRecipients}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Types</p>
            <p className="text-2xl font-bold text-violet-600">{uniqueTypes}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un type, un message, un destinataire ou un statut…"
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
          <p className="text-xs text-zinc-500">Pense aussi à appeler le endpoint d’initialisation du consumer sur le port 3008 si tu attends des événements.</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          {searchQuery ? 'Aucune notification correspond à votre recherche.' : 'Aucune notification disponible pour le moment.'}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Type</th>
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Message</th>
                  <th className="text-left px-5 py-3.5 font-medium text-zinc-500">Destinataire</th>
                  <th className="text-center px-5 py-3.5 font-medium text-zinc-500">Statut</th>
                  <th className="text-right px-5 py-3.5 font-medium text-zinc-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors align-top">
                    <td className="px-5 py-4">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {notification.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300 max-w-xl">
                      {notification.message}
                    </td>
                    <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">{notification.recipient}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        notification.status === 'sent'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-zinc-400 text-xs whitespace-nowrap">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
            {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}