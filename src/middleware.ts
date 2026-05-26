import { NextResponse, type NextRequest } from 'next/server'

// Lightweight HR route guard — no external dependencies, Edge-safe.
// @supabase/ssr cannot run in Vercel's V8 Edge isolate (MIDDLEWARE_INVOCATION_FAILED).
// Full JWT validation happens in each /hr page and API route via createClient().
// We only need a rough "is there a Supabase session cookie?" check here.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasSession = request.cookies.getAll().some(c => c.name.includes('-auth-token'))

  // Redirect authenticated HR away from login
  if (pathname === '/hr/login') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/hr', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other /hr routes
  if (!hasSession) {
    return NextResponse.redirect(new URL('/hr/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/hr/:path*'],
}
