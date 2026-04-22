'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { releaseTracks } from "@/app/lib/release-hub"

type NavItem = {
  label: string
  href: string
  short: string
  tone: string
}

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Pilotage',
    items: [
      { label: "Vue d'ensemble", href: '/dashboard', short: 'VD', tone: 'from-sky-500 to-blue-600' },
      { label: 'Versions', href: '/dashboard/versions', short: 'V9', tone: 'from-amber-500 to-orange-500' },
      { label: 'Microservices', href: '/dashboard/services', short: 'MS', tone: 'from-emerald-500 to-teal-600' },
      { label: 'Reporting', href: '/dashboard/reporting', short: 'RP', tone: 'from-indigo-500 to-cyan-500' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Produits', href: '/dashboard/products', short: 'PD', tone: 'from-fuchsia-500 to-pink-500' },
      { label: 'Stock', href: '/dashboard/stock', short: 'ST', tone: 'from-lime-500 to-green-600' },
      { label: 'Commandes', href: '/dashboard/orders', short: 'CM', tone: 'from-orange-500 to-rose-500' },
      { label: 'Facturation', href: '/dashboard/billing', short: 'FC', tone: 'from-cyan-500 to-sky-600' },
      { label: 'Production', href: '/dashboard/production', short: 'PR', tone: 'from-violet-500 to-indigo-600' },
      { label: 'Notifications', href: '/dashboard/notifications', short: 'NT', tone: 'from-rose-500 to-red-500' },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { label: 'Utilisateurs', href: '/dashboard/users', short: 'US', tone: 'from-slate-600 to-slate-800' },
      { label: 'Mon profil', href: '/dashboard/profile', short: 'MP', tone: 'from-blue-500 to-indigo-600' },
      { label: 'Parametres', href: '/dashboard/settings', short: 'PM', tone: 'from-zinc-500 to-zinc-700' },
    ],
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const quickNav = navSections.flatMap((section) => section.items).filter((item) =>
    ['/dashboard', '/dashboard/versions', '/dashboard/services', '/dashboard/reporting', '/dashboard/orders'].includes(item.href)
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <div className="lg:hidden border-b border-white/60 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Phase 9</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Navigation rapide</p>
          </div>
          <Link href="/dashboard/versions" className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-200">
            {releaseTracks.length} versions partagees
          </Link>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-max items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
                isActive(item.href)
                  ? 'border-slate-950 bg-slate-950 text-white dark:border-sky-400 dark:bg-sky-400/20 dark:text-sky-100'
                  : 'border-zinc-200 bg-white/80 text-zinc-700 dark:border-zinc-800 dark:bg-slate-900/80 dark:text-zinc-300'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br ${item.tone} text-[10px] font-semibold tracking-[0.18em] text-white`}>
                {item.short}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 border-r border-white/70 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:flex lg:min-h-[calc(100vh-4rem)] lg:flex-col lg:justify-between">
        <div className="p-6">
          <div className="rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-950/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-sky-200/80">Tableau de bord</p>
                <h2 className="mt-2 text-xl font-semibold">TWM Delivery Hub</h2>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-center">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Phase</p>
                <p className="text-lg font-semibold">9</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              Oriente l equipe vers les bons modules, les bonnes branches et les bons points de reprise.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-3xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/90">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white">
              <span className="text-sm font-semibold">{session?.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{session?.user?.name}</p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{session?.user?.email}</p>
            </div>
          </div>

          <nav className="mt-6 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
                        isActive(item.href)
                          ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-slate-800'
                          : 'text-zinc-700 hover:bg-white hover:shadow-sm dark:text-zinc-300 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${item.tone} text-[11px] font-semibold tracking-[0.18em] text-white`}>
                        {item.short}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/70 p-5 dark:border-white/10">
          <Link href="/dashboard/versions" className="block rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/15">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">Recuperation</p>
            <p className="mt-1 font-semibold">Voir les dernieres versions partagees</p>
            <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-100/70">PR {releaseTracks[0]?.prNumber} et PR {releaseTracks[1]?.prNumber} pretes pour l equipe.</p>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
