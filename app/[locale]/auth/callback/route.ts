import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Get locale from next param or default to 'en'
  const next = searchParams.get('next') ?? '/en/pro/game'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Create or update profile to mark as verified
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profileData) {
        // Create new profile
        const displayName = data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           data.user.email?.split('@')[0] || 
                           'User'
        
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          email_verified: true
        })
      } else {
        // Mark existing profile as verified
        await supabase.from('profiles').update({
          email_verified: true
        }).eq('id', data.user.id)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Extract locale from next param or default to 'en'
  const locale = next?.split('/')[1] || 'en'
  return NextResponse.redirect(`${origin}/${locale}/auth/auth-code-error`)
}
