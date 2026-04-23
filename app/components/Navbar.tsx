'use client'
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg">TWM</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            {session && (
              <Link href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth buttons desktop */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/profile" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white">
                      <span className="text-sm font-semibold">{session?.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{session?.user?.name}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{session?.user?.email}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/front/auth/login"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 px-4 py-2 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/front/auth/register"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 py-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Accueil
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/front/auth/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Connexion
                </Link>
                <Link href="/front/auth/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
