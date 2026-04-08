'use client'
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Connexion - Projet TWM</h1>
      
      {/* Bouton Connexion Classique (Credentials) */}
      <button 
        onClick={() => signIn()} // Ouvre la page par défaut de NextAuth
        className="bg-blue-600 text-white px-6 py-2 rounded mb-4"
      >
        Se connecter avec Email
      </button>

      {/* Bouton Google (OAuth2) */}
      <button 
        onClick={() => signIn('google')}
        className="bg-red-500 text-white px-6 py-2 rounded"
      >
        Se connecter avec Google
      </button>
    </div>
  )
}