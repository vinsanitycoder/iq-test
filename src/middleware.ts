import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // Auth check failed — treat as unauthenticated and continue
  }

  // Protect all /hr routes except the login page
  if (
    request.nextUrl.pathname.startsWith('/hr') &&
    !request.nextUrl.pathname.startsWith('/hr/login') &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/hr/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated HR away from login
  if (request.nextUrl.pathname === '/hr/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/hr'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  // Only run middleware on /hr routes — that's the only thing it protects.
  // Personality/invite routes have their own cookie validation per API route.
  matcher: ['/hr/:path*'],
}
