'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme, type Theme } from '../../lib/theme'

type Status = 'checking' | 'online' | 'offline'

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: string; desc: string }> = [
  { value: 'light', label: 'Clair', icon: '☀️', desc: 'Interface lumineuse' },
  { value: 'dark', label: 'Sombre', icon: '🌙', desc: 'Confortable de nuit' },
  { value: 'system', label: 'Système', icon: '🖥️', desc: 'Suit votre appareil' },
]

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const [kongStatus, setKongStatus] = useState<Status>('checking')
  const [rabbitStatus, setRabbitStatus] = useState<Status>('checking')
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, Status>>({})
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  const fetchInfra = () => {
    setKongStatus('checking')
    setRabbitStatus('checking')
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
      .then((d) => {
        if (d?.services) setServiceStatuses(d.services)
        if (d?.checkedAt) setCheckedAt(d.checkedAt)
      })
      .catch(() => setServiceStatuses({}))
  }

  useEffect(() => {
    fetchInfra()
  }, [])

  const onlineCount = Object.values(serviceStatuses).filter((s) => s === 'online').length
  const totalCount = Object.keys(serviceStatuses).length
  const allHealthy = kongStatus === 'online' && rabbitStatus === 'online' && totalCount > 0 && onlineCount === totalCount

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
        <p className="text-zinc-500">Personnalisez votre expérience et consultez l&apos;état du système.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Apparence / Thème */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold mb-1">Apparence</h3>
              <p className="text-xs text-zinc-500">
                Mode actuellement appliqué : <span className="font-medium text-zinc-700 dark:text-zinc-300">{resolvedTheme === 'dark' ? '🌙 Sombre' : '☀️ Clair'}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {opt.label}
                      {active && <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Préférences générales */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold mb-4">Général</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Langue</p>
                <p className="text-xs text-zinc-500">Langue de l&apos;interface</p>
              </div>
              <span className="text-sm text-zinc-400">Français</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Devise</p>
                <p className="text-xs text-zinc-500">Devise utilisée pour les montants</p>
              </div>
              <span className="text-sm text-zinc-400">FCFA / EUR</span>
            </div>
          </div>
        </div>

        {/* État des microservices */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold mb-1">État du système</h3>
              <p className="text-xs text-zinc-500">
                {checkedAt
                  ? `Dernière vérification : ${new Date(checkedAt).toLocaleTimeString('fr-FR')}`
                  : 'Vérification en cours…'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  allHealthy
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${allHealthy ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                {allHealthy ? 'Tous opérationnels' : 'Surveillance'}
              </span>
              <button
                type="button"
                onClick={fetchInfra}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                Actualiser
              </button>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatusRow label="Kong Gateway" sub="API gateway" status={kongStatus} icon="🦍" />
            <StatusRow label="RabbitMQ" sub="Message broker" status={rabbitStatus} icon="🐰" />
          </div>

          {/* Microservices */}
          {totalCount > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Microservices</p>
                <p className="text-xs text-zinc-500">
                  {onlineCount}/{totalCount} en ligne
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(serviceStatuses).map(([name, status]) => (
                  <StatusRow key={name} label={name} sub="Service" status={status} icon="⚙️" compact />
                ))}
              </div>
            </>
          )}

          <Link
            href="/dashboard/services"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Voir le détail complet →
          </Link>
        </div>

        {/* Info technique */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold mb-4">Informations techniques</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <TechRow label="Next.js" value="16.2.2" />
            <TechRow label="React" value="19.2.4" />
            <TechRow label="Prisma" value="7.7.0" />
            <TechRow label="NextAuth" value="4.24.13" />
            <TechRow label="PostgreSQL" value="18" />
            <TechRow label="Tailwind CSS" value="4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusRow({
  label,
  sub,
  status,
  icon,
  compact = false,
}: {
  label: string
  sub: string
  status: Status
  icon: string
  compact?: boolean
}) {
  const dot =
    status === 'online'
      ? 'bg-green-500'
      : status === 'offline'
      ? 'bg-red-500'
      : 'bg-zinc-400 animate-pulse'
  const text =
    status === 'online'
      ? 'text-green-700 dark:text-green-400'
      : status === 'offline'
      ? 'text-red-700 dark:text-red-400'
      : 'text-zinc-500'
  const labelText = status === 'online' ? 'En ligne' : status === 'offline' ? 'Hors ligne' : 'Vérification'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50">
      {!compact && <span className="text-lg">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {!compact && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className={`text-xs font-medium ${text}`}>{labelText}</span>
      </div>
    </div>
  )
}

function TechRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-zinc-100 dark:border-zinc-800 px-3 py-2 bg-zinc-50/50 dark:bg-zinc-900/50">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  )
}
