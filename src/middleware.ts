import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // ✅ Add here — before any auth checks
    const { pathname } = request.nextUrl
    if (pathname === '/login' || pathname.startsWith('/auth/')) {
        return NextResponse.next()
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    console.log('📍 Path:', request.nextUrl.pathname)
    console.log('👤 User:', user?.email ?? 'no user')

    if (!user && request.nextUrl.pathname !== '/login') {
        console.log('🚫 No user - redirecting to /login')
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_superadmin')
            .eq('email', user.email)
            .single()

        console.log('📋 Profile:', profile)
        console.log('❌ Error:', error)
        console.log('🛡️ is_superadmin:', profile?.is_superadmin)

        // Block if no profile found OR if not superadmin
        if (!profile || profile.is_superadmin !== true) {
            if (request.nextUrl.pathname !== '/login') {
                console.log('🚫 Not superadmin - redirecting to /login')
                await supabase.auth.signOut()
                return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
            }
        } else {
            console.log('✅ Superadmin confirmed - letting through')
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}