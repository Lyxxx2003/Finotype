import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Check if profile exists, if not create it
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Determine if this is OAuth or email/password
      // OAuth providers: Google users have provider 'google' in identities
      // Email/password users have provider 'email' in identities
      const isOAuthUser = data.user.identities?.some(identity => identity.provider !== 'email') ?? false

      // Get display name from user metadata (Google provides 'full_name', email users provide 'display_name')
      const displayName = data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.display_name ||
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0] || 
                         'User'

      if (!profileData) {
        // Create new profile for new users
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          email_verified: true  // All users reaching callback have confirmed email
        })
        
        if (insertError) {
          console.error('Error creating profile:', insertError)
        }
      } else {
        // Update existing profile to mark email as verified AND set display name
        const { error: updateError } = await supabase.from('profiles')
          .update({ 
            email_verified: true,
            display_name: displayName
          })
          .eq('id', data.user.id)
        
        if (updateError) {
          console.error('Error updating profile:', updateError)
        }
      }

      // Redirect based on user type
      // OAuth users and verified email users go to /pro/game
      const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
      const redirectPath = `/${locale}/pro/game`
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Only redirect to error if there's an actual error, not for successful email confirmations
  const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
  return NextResponse.redirect(`${origin}/${locale}/login`)
}
