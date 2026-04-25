import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_API_PREFIXES = ['/api/auth']
const PUBLIC_API_PATHS = new Set(['/api/catalogue', '/api/health', '/api/hello'])

function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PATHS.has(pathname) || PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/api') && isPublicApiPath(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET })
  if (token) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  const loginUrl = new URL('/front/auth/login', request.url)
  loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}