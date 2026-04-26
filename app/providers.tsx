'use client'
import { useEffect, useRef, useState } from "react"
import { SessionProvider } from "next-auth/react"
import { signOut, useSession } from "next-auth/react"
import { ThemeProvider } from "./lib/theme"

type ProvidersProps = {
  children: React.ReactNode
  idleTimeoutSeconds: number
  idleWarningSeconds: number
}

type SessionTimeoutManagerProps = {
  idleTimeoutMs: number
  warningMs: number
}

function SessionTimeoutManager({ idleTimeoutMs, warningMs }: SessionTimeoutManagerProps) {
  const { data: session, status, update } = useSession()
  const lastActivityAtRef = useRef(0)
  const warningVisibleRef = useRef(false)
  const signOutStartedRef = useRef(false)
  const [remainingMs, setRemainingMs] = useState(idleTimeoutMs)

  useEffect(() => {
    if (status !== "authenticated") {
      warningVisibleRef.current = false
      signOutStartedRef.current = false
      return
    }

    lastActivityAtRef.current = Date.now()
    warningVisibleRef.current = false
    signOutStartedRef.current = false
  }, [session?.expires, status])

  useEffect(() => {
    if (status !== "authenticated") {
      return
    }

    const handleActivity = () => {
      if (warningVisibleRef.current) {
        return
      }

      lastActivityAtRef.current = Date.now()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleActivity()
      }
    }

    const eventOptions: AddEventListenerOptions = { passive: true }
    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, eventOptions)
    })
    window.addEventListener("focus", handleActivity)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      window.removeEventListener("focus", handleActivity)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [status])

  useEffect(() => {
    if (status !== "authenticated" || !session?.expires) {
      return
    }

    signOutStartedRef.current = false

    const tick = () => {
      const now = Date.now()
      const idleRemainingMs = idleTimeoutMs - (now - lastActivityAtRef.current)
      const sessionRemainingMs = new Date(session.expires).getTime() - now
      const effectiveRemainingMs = Math.min(idleRemainingMs, sessionRemainingMs)

      setRemainingMs(Math.max(effectiveRemainingMs, 0))

      if (effectiveRemainingMs <= 0) {
        if (signOutStartedRef.current) {
          return
        }

        signOutStartedRef.current = true
        const reason = sessionRemainingMs <= 0 ? "session-expired" : "session-idle-expired"
        void signOut({ callbackUrl: `/front/auth/login?reason=${reason}` })
        return
      }

      warningVisibleRef.current = idleRemainingMs <= warningMs
    }

    const intervalId = window.setInterval(tick, 1000)

    return () => window.clearInterval(intervalId)
  }, [idleTimeoutMs, session?.expires, status, warningMs])

  const handleStaySignedIn = async () => {
    lastActivityAtRef.current = Date.now()
    warningVisibleRef.current = false
    setRemainingMs(idleTimeoutMs)

    try {
      await update()
    } catch {
      // Ignore refresh failures and let the normal expiration flow continue.
    }
  }

  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000))
  const warningVisible = status === "authenticated" && remainingMs > 0 && remainingMs <= warningMs

  if (!warningVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-120 flex items-end justify-center bg-slate-950/45 px-4 pb-6 pt-24 backdrop-blur-sm sm:items-center sm:pb-4">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-(--surface-strong) p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950/95">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">Phase 10 · Securite</p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">Session bientot fermee</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          Aucune activite n a ete detectee. Votre session sera fermee dans environ {remainingSeconds} secondes si vous ne confirmez pas que vous etes toujours present.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              void handleStaySignedIn()
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Rester connecte
          </button>
          <button
            type="button"
            onClick={() => {
              void signOut({ callbackUrl: "/front/auth/login?reason=session-idle-expired" })
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-100 dark:hover:bg-slate-800"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Providers({ children, idleTimeoutSeconds, idleWarningSeconds }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SessionTimeoutManager
          idleTimeoutMs={idleTimeoutSeconds * 1000}
          warningMs={idleWarningSeconds * 1000}
        />
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}
