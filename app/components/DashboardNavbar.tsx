'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import ThemeToggle from "./ThemeToggle"

export default function DashboardNavbar() {
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-50 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm">
      <div className="flex h-14 items-center justify-between px-5 lg:px-7">

        {/* Marque (mobile uniquement, la sidebar gère le desktop) */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-800">
            <span className="text-[10px] font-bold text-white">S</span>
          </div>
          <span className="text-sm font-bold text-blue-900 dark:text-white">SFMC Bénin</span>
        </div>

        {/* Vide côté gauche sur desktop (sidebar affiche le brand) */}
        <div className="hidden lg:block" />

        {/* Profil + déconnexion */}
        <div className="flex items-center gap-3">
          <ThemeToggle tone="dashboard" />
          <Link href="/dashboard/notifications" className="relative flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 text-base hover:bg-blue-100 dark:hover:bg-zinc-700 transition" title="Notifications">
            🔔
          </Link>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                {session?.user?.name ?? 'Utilisateur'}
              </span>
              <span className="text-[10px] text-zinc-400 leading-tight">
                {session?.user?.email ?? ''}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/front/auth/login' })}
            className="rounded-lg border border-blue-100 dark:border-zinc-700 bg-blue-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-zinc-300 transition hover:bg-blue-100 dark:hover:bg-zinc-700"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
