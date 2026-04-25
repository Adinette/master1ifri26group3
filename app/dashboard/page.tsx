'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"

const quickActions = [
  {
    icon: '📦',
    label: 'Passer une commande',
    desc: 'Commandez vos produits rapidement',
    href: '/dashboard/orders',
    color: 'from-orange-400 to-rose-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    text: 'text-orange-700',
  },
  {
    icon: '🛒',
    label: 'Parcourir le catalogue',
    desc: 'Découvrez tous nos produits',
    href: '/dashboard/products',
    color: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-100',
    text: 'text-fuchsia-700',
  },
  {
    icon: '🧾',
    label: 'Mes factures',
    desc: 'Consultez et téléchargez vos factures',
    href: '/dashboard/billing',
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    text: 'text-cyan-700',
  },
  {
    icon: '🔔',
    label: 'Notifications',
    desc: 'Vos alertes et messages en attente',
    href: '/dashboard/notifications',
    color: 'from-rose-400 to-red-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-700',
  },
  {
    icon: '🏪',
    label: 'Stock disponible',
    desc: 'Vérifiez les disponibilités produits',
    href: '/dashboard/stock',
    color: 'from-lime-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-700',
  },
  {
    icon: '📊',
    label: 'Mes rapports',
    desc: 'Historique et statistiques de vos achats',
    href: '/dashboard/reporting',
    color: 'from-indigo-500 to-cyan-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-700',
  },
]

const highlights = [
  { icon: '🇧🇯', title: 'Présence au Bénin', desc: 'Couverture nationale avec livraison dans toutes les régions du Bénin.' },
  { icon: '⚡', title: 'Traitement rapide', desc: 'Vos commandes sont traitées et expédiées dans les meilleurs délais.' },
  { icon: '🔒', title: 'Espace sécurisé', desc: 'Toutes vos données et transactions sont protégées.' },
  { icon: '📞', title: 'Support client', desc: 'Notre équipe est disponible pour vous accompagner.' },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] ?? 'client'

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-6xl mx-auto">

      {/* Hero de bienvenue */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-blue-800 to-blue-900 px-6 py-8 text-white shadow-xl lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
        </div>

        {/* Motif déco léger */}
        <div className="pointer-events-none absolute right-8 top-6 opacity-10 hidden lg:block">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <circle cx="90" cy="90" r="80" stroke="white" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="55" stroke="white" strokeWidth="1.5" />
            <circle cx="90" cy="90" r="30" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider text-blue-100 mb-5">
            🇧🇯 SFMC Bénin — Portail client
          </span>
          <h1 className="text-2xl font-bold lg:text-3xl mb-2">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-blue-100 text-sm lg:text-base max-w-lg mb-7 leading-relaxed">
            Bienvenue sur votre espace personnel. Gérez vos commandes, consultez vos factures et suivez vos livraisons en toute simplicité.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 shadow-md hover:bg-blue-50 transition"
            >
              📦 Passer une commande
            </Link>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              🛒 Voir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Accès rapides */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-900">Accès rapide</h2>
          <p className="text-sm text-zinc-500">Tout ce dont vous avez besoin, en un clic.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group flex items-start gap-4 rounded-2xl border ${action.border} ${action.bg} p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${action.color} shadow-md text-2xl`}>
                {action.icon}
              </div>
              <div>
                <p className={`font-semibold text-sm ${action.text} mb-0.5`}>{action.label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pourquoi SFMC Bénin */}
      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-900">Pourquoi choisir SFMC Bénin ?</h2>
          <p className="text-sm text-blue-600 mt-1">Votre satisfaction est notre priorité.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-xl bg-white border border-blue-100 p-4 shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-semibold text-blue-900 text-sm mb-1">{item.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pied de section info compte */}
      <section className="rounded-2xl border border-zinc-100 bg-white p-6 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-md">
            {session?.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{session?.user?.name ?? 'Utilisateur'}</p>
            <p className="text-xs text-zinc-400">{session?.user?.email ?? ''}</p>
          </div>
        </div>
        <Link
          href="/dashboard/profile"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
        >
          Mon profil →
        </Link>
      </section>

    </div>
  )
}
