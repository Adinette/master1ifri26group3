'use client'
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const publicLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/#services', label: 'Services' },
    { href: '/#contact', label: 'Contact' },
  ]

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-zinc-950/95 border-b border-blue-100/60 dark:border-zinc-800 shadow-sm backdrop-blur-md'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            {/* Nom complet sur desktop, abrégé sur tablette */}
            <div className="hidden lg:block">
              <p className="font-black text-base tracking-tight leading-tight text-zinc-900 dark:text-white">SFMC Bénin</p>
              <p className="text-xs font-medium leading-none text-zinc-500">Matériaux de construction</p>
            </div>
            <p className="hidden md:block lg:hidden font-black text-sm text-zinc-900 dark:text-white">SFMC</p>
          </Link>

          {/* Liens de navigation — gap réduit sur tablette */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 flex-1 justify-center">
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs lg:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                href="/dashboard"
                className="text-xs lg:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 whitespace-nowrap"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Actions droite */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <ThemeToggle tone="public" />
            {session ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/profile" className="flex items-center gap-1.5 lg:gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {/* Nom tronqué sur tablette */}
                  <span className="hidden lg:block text-sm font-semibold text-zinc-900 dark:text-white max-w-[100px] truncate">
                    {session?.user?.name}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs lg:text-sm font-semibold px-3 lg:px-4 py-2 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-zinc-700 transition-colors duration-200 whitespace-nowrap"
                >
                  {/* Texte court sur tablette */}
                  <span className="hidden lg:inline">Déconnexion</span>
                  <span className="lg:hidden">Déco.</span>
                </button>
              </div>
            ) : (
              <Link
                href="/front/auth/login"
                className="text-xs lg:text-sm font-bold px-4 lg:px-5 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors duration-200 whitespace-nowrap"
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile : thème + burger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle tone="public" />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg transition-colors text-zinc-900 dark:text-white"
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
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-zinc-950 py-4 space-y-1 border-t border-blue-100/40 dark:border-zinc-800">
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors">
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/front/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center mt-2"
              >
                Se connecter
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}