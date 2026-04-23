'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"

const serviceStatus = [
  { name: 'Auth', status: 'actif', color: '#22c55e' },
  { name: 'Produits', status: 'actif', color: '#22c55e' },
  { name: 'Commandes', status: 'actif', color: '#22c55e' },
  { name: 'Facturation', status: 'actif', color: '#22c55e' },
  { name: 'Reporting', status: 'partiel', color: '#eab308' },
  { name: 'Notifications', status: 'actif', color: '#22c55e' },
  { name: 'Stock', status: 'actif', color: '#22c55e' },
  { name: 'Production', status: 'actif', color: '#22c55e' },
]

const modules = [
  { code: 'V9', name: 'Versions', desc: 'Branches, PR et livraisons', color: '#f97316', href: '/dashboard/versions' },
  { code: 'MS', name: 'Microservices', desc: 'Supervision et santé', color: '#14b8a6', href: '/dashboard/services' },
  { code: 'RP', name: 'Reporting', desc: 'Analyse résiliente', color: '#6366f1', href: '/dashboard/reporting' },
  { code: 'PD', name: 'Produits', desc: 'Catalogue et stock', color: '#ec4899', href: '/dashboard/products' },
  { code: 'CM', name: 'Commandes', desc: 'Flux et suivi', color: '#ef4444', href: '/dashboard/orders' },
  { code: 'FC', name: 'Facturation', desc: 'Billing et paiements', color: '#0ea5e9', href: '/dashboard/billing' },
  { code: 'PR', name: 'Production', desc: 'Suivi de production', color: '#8b5cf6', href: '/dashboard/production' },
  { code: 'NT', name: 'Notifications', desc: 'Alertes et messages', color: '#f43f5e', href: '/dashboard/notifications' },
]

const statCards = [
  { label: 'Microservices', value: '9', detail: 'auth, produits, commandes…' },
  { label: 'Commandes actives', value: '—', detail: 'données en temps réel' },
  { label: 'Factures en attente', value: '—', detail: 'module billing' },
  { label: 'Notifications envoyées', value: '—', detail: "aujourd'hui" },
]

const checklist = [
  "Vérifier l'état de Kong Gateway",
  'Consulter les commandes en attente',
  'Valider les factures du jour',
  'Vérifier les notifications non lues',
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 lg:p-10 space-y-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-8 text-white shadow-xl lg:px-8 lg:py-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[1.25fr,0.95fr]">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-sky-100/80 mb-4">
              TWM · Microservices
            </span>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl mb-3">
              Bienvenue, {session?.user?.name?.split(' ')[0] ?? 'équipe'}.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl mb-6">
              Pilotez vos services, suivez les opérations métier et supervisez l'infrastructure depuis un point d'entrée unifié.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/services"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100 transition"
              >
                Superviser les services
              </Link>
              <Link
                href="/dashboard/reporting"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition"
              >
                Voir le reporting
              </Link>
            </div>
          </div>

          {/* Infrastructure card */}
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm space-y-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">État du système</p>
            <h2 className="text-lg font-medium">Infrastructure TWM</h2>
            <p className="text-xs text-slate-400 mb-2">9 microservices · Kong Gateway · RabbitMQ</p>
            {[
              { label: 'Gateway', value: 'Kong · Actif' },
              { label: 'Message broker', value: 'RabbitMQ · En ligne' },
              { label: 'Base de données', value: 'PostgreSQL · 9 schémas' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{card.label}</p>
            <p className="text-3xl font-semibold text-zinc-950 dark:text-white mb-1">{card.value}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* Modules + sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">

        {/* Modules */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Pilotage</p>
          <h2 className="text-xl font-semibold mb-5">Modules disponibles</h2>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((mod) => (
              <Link
                key={mod.code}
                href={mod.href}
                className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-4 py-3 hover:bg-zinc-100/80 dark:border-white/10 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition"
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.code}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{mod.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{mod.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Services status */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Opérations</p>
            <h2 className="text-lg font-semibold mb-4">État des services</h2>
            <div className="space-y-2">
              {serviceStatus.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-4 py-2.5 dark:border-white/10 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: svc.color }} />
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{svc.name}</span>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: svc.status === 'actif' ? '#dcfce7' : '#fef9c3',
                      color: svc.status === 'actif' ? '#166534' : '#854d0e',
                    }}
                  >
                    {svc.status === 'actif' ? 'Actif' : 'Partiel'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Organisation</p>
            <h2 className="text-lg font-semibold mb-4">Accès rapide</h2>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/60 px-4 py-3 dark:border-white/10 dark:bg-slate-800/50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
