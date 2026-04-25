'use client'
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: scrolled ? 'rgba(248,250,252,0.97)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(37,99,235,0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#2563EB' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-base tracking-tight" style={{ color: '#0F172A', lineHeight: 1.1 }}>SFMC Bénin</p>
              <p className="text-xs font-medium" style={{ color: '#64748B', lineHeight: 1 }}>Matériaux de construction</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: '#334155' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
              >
                {link.label}
              </Link>
            ))}
            {session && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: '#334155' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: '#2563EB' }}
                  >
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{session?.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FDE68A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EFF6FF' }}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/front/auth/login"
                className="text-sm font-bold px-5 py-2 rounded-lg text-white transition-colors duration-200"
                style={{ backgroundColor: '#0F172A' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1E293B')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0F172A')}
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#0F172A' }}
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
          <div
            className="md:hidden py-4 space-y-1"
            style={{ borderTop: '1px solid rgba(37,99,235,0.15)' }}
          >
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ color: '#334155' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.color = '#2563EB' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155' }}
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#334155' }}>
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#334155' }}>
                  Mon profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ color: '#DC2626' }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/front/auth/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold text-white text-center mt-2"
                style={{ backgroundColor: '#0F172A' }}
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
