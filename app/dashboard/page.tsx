'use client'
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {session?.user?.name} !
        </h1>
        <p className="text-zinc-500">
          Vue d&apos;ensemble de votre espace projet TWM.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-sm text-zinc-500 mb-1">Microservices</p>
          <p className="text-2xl font-bold">9</p>
          <p className="text-xs text-green-600 mt-1">Configurés</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-sm text-zinc-500 mb-1">Endpoints API</p>
          <p className="text-2xl font-bold">12+</p>
          <p className="text-xs text-zinc-400 mt-1">REST</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-sm text-zinc-500 mb-1">Base de données</p>
          <p className="text-2xl font-bold">PostgreSQL</p>
          <p className="text-xs text-green-600 mt-1">Connectée</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-sm text-zinc-500 mb-1">Auth Provider</p>
          <p className="text-2xl font-bold">2</p>
          <p className="text-xs text-zinc-400 mt-1">Credentials + Google</p>
        </div>
      </div>

      {/* Cards */}
      <h2 className="text-lg font-semibold mb-4">Accès rapide</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Link href="/dashboard/users" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Utilisateurs</h3>
          <p className="text-sm text-zinc-500">Administrez les comptes, les rôles et les coordonnées du User Service.</p>
        </Link>
        <Link href="/dashboard/products" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Produits</h3>
          <p className="text-sm text-zinc-500">Gérez le catalogue de produits — création, modification, suppression.</p>
        </Link>
        <Link href="/dashboard/stock" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Stock & Inventaire</h3>
          <p className="text-sm text-zinc-500">Suivez les niveaux de stock et enregistrez les mouvements (entrées/sorties).</p>
        </Link>
        <Link href="/dashboard/orders" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Commandes</h3>
          <p className="text-sm text-zinc-500">Créez des commandes client et suivez leur progression de pending à delivered.</p>
        </Link>
        <Link href="/dashboard/billing" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Facturation</h3>
          <p className="text-sm text-zinc-500">Créez des factures à partir des commandes et confirmez les paiements côté billing.</p>
        </Link>
        <Link href="/dashboard/production" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Production</h3>
          <p className="text-sm text-zinc-500">Planifiez des lots de fabrication et faites progresser les batches jusqu’à completed.</p>
        </Link>
        <Link href="/dashboard/notifications" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Notifications</h3>
          <p className="text-sm text-zinc-500">Consultez les messages issus des événements order.created, payment.confirmed et stock.alert.</p>
        </Link>
        <Link href="/dashboard/profile" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Mon profil</h3>
          <p className="text-sm text-zinc-500">Consultez et modifiez vos informations personnelles.</p>
        </Link>
        <Link href="/dashboard/services" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Microservices</h3>
          <p className="text-sm text-zinc-500">Gérez et surveillez les microservices de l&apos;application.</p>
        </Link>
        <Link href="/dashboard/reporting" className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">Reporting</h3>
          <p className="text-sm text-zinc-500">Consultez l&apos;agrégation Phase 7 : commandes, factures, notifications, production et stock critique.</p>
        </Link>
      </div>
    </div>
  )
}
