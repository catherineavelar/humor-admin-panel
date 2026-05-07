import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    console.log('🔄 Callback hit, code:', code ? 'present' : 'missing')

    if (code) {
        const cookieStore = await cookies()
        const response = NextResponse.redirect(`${origin}/`)

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        console.log('👤 Session user:', data?.user?.email ?? 'none')
        console.log('❌ Exchange error:', error)

        return response
    }

    return NextResponse.redirect(`${origin}/`)
}