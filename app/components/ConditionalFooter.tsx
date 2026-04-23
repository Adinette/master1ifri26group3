// app/components/ConditionalFooter.tsx
'use client'

import { useSession } from 'next-auth/react' // ou ton hook d'auth
import Footer from './Footer'

export default function ConditionalFooter() {
  const { data: session } = useSession()

  if (session) return null

  return <Footer />
}