'use client'
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardSidebar from "../components/DashboardSidebar"
import DashboardNavbar from "../components/DashboardNavbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/front/auth/login")
    }
  }, [router, status])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (status !== "authenticated") {
    return null
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
        <DashboardNavbar />
        <div className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-12 top-0 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
            <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-400/10" />
            <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-400/10" />
          </div>
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  )
}
