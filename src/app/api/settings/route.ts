import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Settings } from '@/types/database'

// Public endpoint — returns only the display fields needed on applicant-facing pages.
// No sensitive data exposed.
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('company_name, company_logo_url').single()
  const settings = data as Pick<Settings, 'company_name' | 'company_logo_url'> | null

  return NextResponse.json({
    company_name: settings?.company_name ?? 'Fynlo',
    company_logo_url: settings?.company_logo_url ?? null,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
