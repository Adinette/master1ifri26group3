import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-lg">TWM</span>
            </div>
            <p className="text-sm text-zinc-500">
              Projet Technologie Web et Mobile — SFMC Bénin
            </p>
          </div>

          {/* Liens */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens auth */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Compte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/front/auth/login" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/front/auth/register" className="text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-6 text-center">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Projet TWM — SFMC Bénin. Groupe 5.
          </p>
        </div>
      </div>
    </footer>
  )
}
