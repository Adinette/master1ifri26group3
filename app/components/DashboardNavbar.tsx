'use client'

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="flex h-16 items-center justify-end px-6">
        {/* Profil + Déconnexion */}
        <div className="flex items-center gap-3">
          {/* Avatar + infos */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {session?.user?.name ?? 'Utilisateur'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {session?.user?.email ?? ''}
              </span>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={() => signOut({ callbackUrl: '/front/auth/login' })}
            className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Déconnexion
          </button>
        </div>

      </div>
    </header>
  )
}