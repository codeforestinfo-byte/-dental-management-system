import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dentaflow-super-secret-key-that-is-at-least-256-bits-long-for-hs256'
)

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ['/appointments', '/patients', '/dentists', '/treatments', '/billing', '/reports', '/users', '/audit', '/help'],
  RECEPTIONIST: ['/appointments', '/patients', '/dentists', '/treatments', '/billing', '/help'],
  DENTIST: ['/appointments', '/help'],
}

const PUBLIC_ROUTES = ['/login']

function stripRolePrefix(role: string): string {
  return role.startsWith('ROLE_') ? role.substring(5) : role
}

async function verifyToken(token: string): Promise<{ username: string; roles: string[] } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const rawRoles = (payload.roles as string[]) || []
    return {
      username: payload.sub as string,
      roles: rawRoles.map(stripRolePrefix),
    }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('access_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await verifyToken(token)

  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('access_token')
    return response
  }

  if (pathname === '/') {
    return NextResponse.next()
  }

  const hasAccess = Object.entries(ROLE_ROUTES).some(([role, routes]) => {
    if (user.roles.includes(role)) {
      return routes.some((route) => pathname.startsWith(route))
    }
    return false
  })

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
