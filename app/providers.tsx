'use client'
import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { signOut, useSession } from "next-auth/react"

function SessionTimeoutManager() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== "authenticated" || !session?.expires) {
      return
    }

    const expiresAt = new Date(session.expires).getTime()
    const remainingMs = expiresAt - Date.now()

    if (remainingMs <= 0) {
      void signOut({ callbackUrl: "/front/auth/login?reason=session-expired" })
      return
    }

    const timeoutId = window.setTimeout(() => {
      void signOut({ callbackUrl: "/front/auth/login?reason=session-expired" })
    }, remainingMs)

    return () => window.clearTimeout(timeoutId)
  }, [session?.expires, status])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionTimeoutManager />
      {children}
    </SessionProvider>
  )
}
