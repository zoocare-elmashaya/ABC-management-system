import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Note: Next.js 15+ standardizes this to 'edge', but you can keep 'experimental-edge' if your Cloudflare setup specifically requires it.
export const runtime = 'edge'; 

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. BYPASS CRON ROUTE: Let the daily background task hit the API without checking for a logged-in user
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = pathname.startsWith('/login')

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/' 
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}