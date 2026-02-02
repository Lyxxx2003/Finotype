import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Use service role client to access auth.users
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Query auth.users table directly using RPC or raw query
    // We'll use a Postgres function to check the user
    let user = null
    
    // Try to fetch users and find the matching email
    // Use pagination to avoid loading all users at once
    let page = 1
    let found = false
    
    while (!found && page <= 10) { // Limit to 10 pages to avoid infinite loop
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 1000
      })
      
      if (error) {
        console.error('Error listing users:', error)
        break
      }
      
      if (!data.users || data.users.length === 0) {
        break
      }
      
      user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      
      if (user) {
        found = true
        break
      }
      
      page++
    }
    
    if (!user) {
      return NextResponse.json({
        exists: false
      })
    }

    // Check what auth providers the user has
    const identities = user.identities || []
    const providers = user.app_metadata?.providers || []
    
    // Check both identities and app_metadata for provider information
    const hasEmailProvider = identities.some(identity => identity.provider === 'email') ||
                             providers.includes('email')
    const hasGoogleProvider = identities.some(identity => identity.provider === 'google') ||
                             providers.includes('google') ||
                             user.app_metadata?.provider === 'google'

    console.log(`User check for ${email}: exists=true, hasPassword=${hasEmailProvider}, hasGoogle=${hasGoogleProvider}`)

    return NextResponse.json({
      exists: true,
      hasPassword: hasEmailProvider,
      hasGoogleAuth: hasGoogleProvider
    })
  } catch (error: any) {
    console.error('Error checking user:', error)
    return NextResponse.json(
      { error: 'Failed to check user', details: error.message },
      { status: 500 }
    )
  }
}
