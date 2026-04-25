'use client'
import Link from "next/link"

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111', color: 'white' }}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: '#2563EB' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-base" style={{ color: 'white', lineHeight: 1.1 }}>SFMC Bénin</p>
                <p className="text-xs" style={{ color: '#64748B', lineHeight: 1 }}>Matériaux de construction</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
              Votre partenaire de confiance en matériaux de construction depuis 2009.
              Qualité, fiabilité et service au Bénin.
            </p>
          </div>

          {/* Col 2 — Produits */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#2563EB' }}>Produits</h3>
            <ul className="space-y-3">
              {['Ciment Portland', 'Fer Béton', 'Briques Rouges', 'Granulats'].map((item) => (
                <li key={item}>
                  <Link
                    href="/catalogue"
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Services */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#2563EB' }}>Services</h3>
            <ul className="space-y-3">
              {[
                { label: 'Livraison Express', href: '/#services' },
                { label: 'Conseil Technique', href: '/#services' },
                { label: 'Devis Personnalisé', href: '/#contact' },
                { label: 'Suivi de Commande', href: '/front/auth/login' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#2563EB' }}>Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2563EB' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm" style={{ color: '#94A3B8' }}>+229 XX XX XX XX</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2563EB' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm" style={{ color: '#94A3B8' }}>contact@sfmc-benin.bj</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2563EB' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Cotonou, Bénin</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: '#64748B' }}>
            © {new Date().getFullYear()} SFMC Bénin. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
            {['Mentions légales', 'Politique de confidentialité', 'CGV'].map((item) => (
              <Link key={item} href="#" className="text-xs transition-colors duration-200" style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
