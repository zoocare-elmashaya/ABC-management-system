import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
export const runtime = 'edge';
export async function middleware(request) {
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({ request })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicAsset = request.nextUrl.pathname.match(/\.(.*)$/) 
  if (!user && !isLoginPage && !isPublicAsset) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // IMPORTANT: On Cloudflare, ensure you return the redirect directly
    return NextResponse.redirect(url)
  }
  return response
}
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}