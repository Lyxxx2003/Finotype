import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  // Try to get locale from referer or default to 'en'
  const referer = req.headers.get('referer')
  const locale = referer ? referer.split('/').find(seg => ['en', 'zh', 'es', 'fr', 'de', 'ja'].includes(seg)) || 'en' : 'en'

  revalidatePath('/', 'layout')
  redirect(`/${locale}/login`)
}
