import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { searchParams, origin, pathname } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Extract locale from URL path (e.g., /en/auth/callback -> en)
  const { locale } = await params
  const detectedLocale = locale || pathname.split('/')[1] || 'en'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/${detectedLocale}/auth/auth-code-error`)
    }
    
    if (data.user) {
      console.log('Email confirmation callback - User:', data.user.id)
      console.log('User metadata:', data.user.user_metadata)
      
      // Check if profile exists, if not create it
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', data.user.id)
        .single()

      console.log('Existing profile:', profileData)

      // Determine if this is OAuth or email/password
      // OAuth providers: Google users have provider 'google' in identities
      // Email/password users have provider 'email' in identities
      const isOAuthUser = data.user.identities?.some(identity => identity.provider !== 'email') ?? false

      // Get display name from user metadata (prioritize display_name for email signups)
      const displayName = data.user.user_metadata?.display_name ||
                         data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0] || 
                         'User'
      
      console.log('Display name to use:', displayName)

      if (!profileData) {
        // Create new profile for new users
        console.log('Creating new profile with display_name:', displayName)
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          email_verified: true  // All users reaching callback have confirmed email
        })
        
        if (insertError) {
          console.error('Error creating profile:', insertError)
        } else {
          console.log('Profile created successfully')
        }
      } else {
        // Update existing profile to mark email as verified AND update display name if needed
        console.log('Updating existing profile. Current display_name:', profileData.display_name, '-> New:', displayName)
        
        // Only update display_name if it's not already set or if the new one is different
        const updateData: any = { email_verified: true }
        if (!profileData.display_name || profileData.display_name !== displayName) {
          updateData.display_name = displayName
        }
        
        const { error: updateError } = await supabase.from('profiles')
          .update(updateData)
          .eq('id', data.user.id)
        
        if (updateError) {
          console.error('Error updating profile:', updateError)
        } else {
          console.log('Profile updated successfully')
        }
      }

      // Redirect based on user type
      // OAuth users and verified email users go to /pro/game
      const redirectPath = `/${detectedLocale}/pro/game`
      
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

  // No code parameter or no user data - redirect to error
  return NextResponse.redirect(`${origin}/${detectedLocale}/auth/auth-code-error`)
}
