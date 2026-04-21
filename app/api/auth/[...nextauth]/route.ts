import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/app/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.users.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) return null

        return {
          id: String(user.id),
          name: user.name,
          email: user.email
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Création automatique du compte pour les connexions Google
      if (account?.provider === "google") {
        if (!user.email) {
          return false
        }

        const existingUser = await prisma.users.findUnique({
          where: { email: user.email }
        })
        if (!existingUser) {
          await prisma.users.create({
            data: {
              name: user.name ?? "Utilisateur Google",
              email: user.email,
              password: "",
              provider: "google",
              provider_id: account.providerAccountId,
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
          },
        }
      }

      return session
    }
  },
  pages: {
    signIn: "/front/auth/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
