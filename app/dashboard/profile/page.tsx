'use client'
import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Mon profil</h1>
        <p className="text-zinc-500">Consultez vos informations personnelles.</p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar + name */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-sm text-zinc-500">{session?.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Nom complet</label>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-4 py-3 text-sm">
                {session?.user?.name || "—"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-500 mb-1">Adresse email</label>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-4 py-3 text-sm">
                {session?.user?.email || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold mb-4">Sécurité</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Mot de passe</p>
                <p className="text-xs text-zinc-500">Dernière modification inconnue</p>
              </div>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40" disabled>
                Modifier (bientôt)
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Vérification email</p>
                <p className="text-xs text-zinc-500">Non vérifié</p>
              </div>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
