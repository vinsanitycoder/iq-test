import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Supabase pause prevention — called by Vercel cron every Sunday midnight UTC
export async function GET() {
  const supabase = createAdminClient()
  await supabase.from('settings').select('id').limit(1)
  return NextResponse.json({ ok: true })
}
