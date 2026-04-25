const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002'

export type UserServiceUser = {
  id: number
  email: string
  name: string
  role: string
  phone?: string | null
}

export async function findUserServiceUserByEmail(email: string) {
  if (!email) {
    return null
  }

  try {
    const response = await fetch(`${USER_SERVICE}/api/users?email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as UserServiceUser
  } catch {
    return null
  }
}

export async function authenticateUserServiceUser(email: string, password: string) {
  try {
    const response = await fetch(`${USER_SERVICE}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as UserServiceUser
  } catch {
    return null
  }
}

export async function resolveUserRoleByEmail(email: string) {
  const user = await findUserServiceUserByEmail(email)
  return user?.role ?? 'user'
}