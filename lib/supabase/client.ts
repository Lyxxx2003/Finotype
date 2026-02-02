import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Disable PKCE flow in development to prevent OTP expiration issues
        // PKCE requires the same browser/device, which causes issues with email links
        flowType: process.env.NODE_ENV === 'development' ? 'implicit' : 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  )
}
