'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

type NavItem = {
  label: string
  href: string
  icon: string
  tone: string
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Accueil',
    items: [
      { label: "Tableau de bord", href: '/dashboard', icon: '🏠', tone: 'from-sky-500 to-blue-600' },
    ],
  },
  {
    title: 'Mon espace',
    items: [
      { label: 'Mes commandes', href: '/dashboard/orders', icon: '📦', tone: 'from-orange-400 to-rose-500' },
      { label: 'Mes factures', href: '/dashboard/billing', icon: '🧾', tone: 'from-cyan-500 to-sky-600' },
      { label: 'Notifications', href: '/dashboard/notifications', icon: '🔔', tone: 'from-rose-400 to-red-500' },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Produits', href: '/dashboard/products', icon: '🛒', tone: 'from-fuchsia-500 to-pink-500' },
      { label: 'Stock disponible', href: '/dashboard/stock', icon: '🏪', tone: 'from-lime-500 to-green-600' },
    ],
  },
  {
    title: 'Suivi',
    items: [
      { label: 'Production', href: '/dashboard/production', icon: '🏭', tone: 'from-violet-500 to-indigo-600' },
      { label: 'Rapports', href: '/dashboard/reporting', icon: '📊', tone: 'from-indigo-500 to-cyan-500' },
    ],
  },
  {
    title: 'Compte',
    items: [
      { label: 'Mon profil', href: '/dashboard/profile', icon: '👤', tone: 'from-blue-500 to-indigo-600' },
      { label: 'Paramètres', href: '/dashboard/settings', icon: '⚙️', tone: 'from-zinc-500 to-zinc-700' },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const mobileQuickNav = navSections.flatMap((s) => s.items).filter((item) =>
    ['/dashboard', '/dashboard/orders', '/dashboard/products', '/dashboard/notifications', '/dashboard/billing'].includes(item.href)
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden border-b border-blue-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-800 shadow-md">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 leading-none">SFMC Bénin</p>
              <p className="text-[10px] text-blue-500 leading-none mt-0.5">Portail client</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mobileQuickNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-max items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-blue-100 bg-white text-zinc-600 hover:border-blue-300'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-blue-50 bg-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between shadow-sm">
        <div className="p-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 mb-8 mt-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 shadow-lg">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div>
              <p className="text-base font-bold text-blue-900 leading-none">SFMC Bénin</p>
              <p className="text-xs text-blue-400 leading-none mt-1">Portail client</p>
            </div>
          </Link>

          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-sm font-medium ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-zinc-600 hover:bg-blue-50 hover:text-blue-800'
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-blue-50 p-5">
          {session && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {session.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-blue-900">{session.user?.name ?? 'Utilisateur'}</p>
                <p className="truncate text-xs text-blue-400">{session.user?.email ?? ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <span>🚪</span>
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}
