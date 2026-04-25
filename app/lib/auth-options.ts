import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/app/lib/prisma"
import { resolveAuthSessionConfig } from "@/app/lib/auth-session-config"
import {
  createRootAuthUser,
  findRootAuthUserByEmail,
  updateRootAuthUserByEmail,
} from "@/app/lib/root-auth-user-sync"
import {
  authenticateUserServiceUser,
  resolveUserRoleByEmail,
} from "@/app/lib/user-service-auth"

const { sessionMaxAgeSeconds } = resolveAuthSessionConfig()

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: sessionMaxAgeSeconds,
  },
  jwt: {
    maxAge: sessionMaxAgeSeconds,
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

        const normalizedEmail = credentials.email.trim()

        const user = await prisma.users.findUnique({
          where: { email: normalizedEmail }
        })

        if (user?.password) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (isPasswordValid) {
            const role = await resolveUserRoleByEmail(user.email)

            return {
              id: String(user.id),
              name: user.name,
              email: user.email,
              role,
            }
          }
        }

        const serviceUser = await authenticateUserServiceUser(normalizedEmail, credentials.password)

        if (!serviceUser) {
          return null
        }

        try {
          const existingRootUser = await findRootAuthUserByEmail(serviceUser.email)

          if (existingRootUser) {
            const syncedRootUser = await updateRootAuthUserByEmail(serviceUser.email, {
              name: serviceUser.name,
              password: credentials.password,
            })

            return {
              id: String(syncedRootUser?.id ?? existingRootUser.id),
              name: serviceUser.name,
              email: serviceUser.email,
              role: serviceUser.role,
            }
          }

          const createdRootUser = await createRootAuthUser({
            name: serviceUser.name,
            email: serviceUser.email,
            password: credentials.password,
          })

          return {
            id: String(createdRootUser.id),
            name: serviceUser.name,
            email: serviceUser.email,
            role: serviceUser.role,
          }
        } catch {
          return {
            id: String(serviceUser.id),
            name: serviceUser.name,
            email: serviceUser.email,
            role: serviceUser.role,
          }
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Creation automatique du compte pour les connexions Google.
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
        token.role = user.role ?? (user.email ? await resolveUserRoleByEmail(user.email) : 'user')
      }

      if (!token.role && token.email) {
        token.role = await resolveUserRoleByEmail(token.email)
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
            role: token.role ?? 'user',
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