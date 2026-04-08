import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // Redirige ici si non connecté
  },
})

// Définis ici les routes à protéger
export const config = { 
  matcher: ["/dashboard/:path*", "/api/protected/:path*"] 
}