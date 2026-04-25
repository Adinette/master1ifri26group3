export function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET

  if (secret) {
    return secret
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'sfmc-auth-service-dev-secret-change-me'
  }

  throw new Error('JWT_SECRET manquant pour le service auth')
}