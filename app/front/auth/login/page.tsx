'use client'
import { signIn } from "next-auth/react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginPageContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get("registered") === "true"
  const sessionReason = searchParams.get("reason")
  const sessionMessage = sessionReason === "session-idle-expired"
    ? "Votre session a ete fermee apres une periode d inactivite. Connectez-vous a nouveau."
    : sessionReason === "session-expired"
      ? "Votre session a expire. Connectez-vous a nouveau."
      : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg" style={{ border: '1px solid rgba(37,99,235,0.15)' }}>
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion - SFMC Benin</h1>

        {justRegistered && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm text-center">
            Compte créé avec succès ! Connectez-vous.
          </div>
        )}

        {sessionMessage && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm text-center">
            {sessionMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-zinc-300 rounded-lg px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-zinc-300 rounded-lg px-4 py-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: '#2563EB' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563EB')}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-zinc-500">ou</span>
          </div>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Se connecter avec Google
        </button>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Pas de compte ?{' '}
          <Link href="/front/auth/register" className="hover:underline font-medium" style={{ color: '#2563EB' }}>
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}

function LoginPageFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg" style={{ border: '1px solid rgba(37,99,235,0.15)' }}>
        <h1 className="text-2xl font-bold mb-2 text-center">Connexion - SFMC Benin</h1>
        <p className="text-sm text-center text-zinc-500">Chargement...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}