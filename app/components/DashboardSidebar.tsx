'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

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
      { label: 'Clients', href: '/dashboard/clients', icon: '🤝', tone: 'from-teal-500 to-cyan-600' },
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
    title: 'Système',
    items: [
      { label: 'Microservices', href: '/dashboard/services', icon: '🛰️', tone: 'from-emerald-500 to-teal-600' },
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
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const allItems = navSections.flatMap((s) => s.items)

  return (
    <>
      {/* ── MOBILE top bar (< 768px) ── */}
      <div className="hidden md:flex lg:hidden flex-col w-16 min-h-screen bg-white dark:bg-zinc-950 border-r border-blue-50 dark:border-zinc-800 fixed left-0 top-0 z-30 shadow-sm py-4 items-center gap-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl from-blue-600 to-blue-800 shadow-md">
              <span className="text-[8px] font-extrabold tracking-tight text-white">SFMC</span>
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 dark:text-white leading-none">SFMC Bénin</p>
              <p className="text-[10px] text-blue-500 dark:text-zinc-500 leading-none mt-0.5">Portail client</p>
            </div>
          </div>
          {/* Burger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-zinc-300"
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="pb-2 space-y-1">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <span>🚪</span> Se déconnecter
            </button>
          </div>
        )}
      </div>

      {/* ── TABLET sidebar icon-only (768px – 1024px) ── */}
      <aside className="hidden md:flex lg:hidden flex-col w-16 min-h-screen bg-white dark:bg-zinc-950 border-r border-blue-50 dark:border-zinc-800 fixed left-0 top-0 z-30 shadow-sm py-4 items-center gap-2">
        {/* Brand icon */}
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl from-blue-600 to-blue-800 shadow-lg mb-4">
          <span className="text-sm font-bold text-white">S</span>
        </Link>

        {/* Nav icons */}
        <nav className="flex flex-col gap-1 flex-1 w-full px-2">
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-lg transition-all ${
                isActive(item.href)
                  ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                  : 'hover:bg-blue-50/50 dark:hover:bg-zinc-800'
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {session && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" title={session.user?.name ?? 'Utilisateur'}>
              {session.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Se déconnecter"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 dark:border-zinc-800 text-red-400 hover:bg-red-50 dark:hover:bg-zinc-900 transition-colors text-base"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* ── DESKTOP sidebar full (≥ 1024px) ── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-zinc-950 border-r border-blue-50 dark:border-zinc-800 fixed left-0 top-0 z-30 shadow-sm">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 px-2 mb-8 text-blue-900 dark:text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div>
              <span className="text-[0.7rem] font-semibold text-blue-400 dark:text-blue-300 tracking-wider">SFMC Bénin</span>
              <p className="text-xs text-blue-400 dark:text-zinc-500 leading-none mt-1">Portail client</p>
            </div>
          </Link>

          <nav className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-sm font-medium ${
                        isActive(item.href)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold shadow-sm shadow-blue-100/50 dark:shadow-none'
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-blue-50/50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300'
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
        <div className="border-t border-blue-50 dark:border-zinc-800 p-5">
          {session && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-zinc-900/20 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {session.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-blue-900 dark:text-zinc-400">{session.user?.name ?? 'Utilisateur'}</p>
                <p className="truncate text-xs text-blue-400 dark:text-zinc-500">{session.user?.email ?? ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 dark:border-zinc-800 px-4 py-2.5 text-sm font-medium text-red-500 dark:text-zinc-400 transition-colors hover:bg-red-50 dark:hover:bg-zinc-900"
          >
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}