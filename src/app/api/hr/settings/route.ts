import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('settings').select('*').single()
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ settings: data ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    company_name,
    test_name,
    welcome_headline,
    welcome_body,
    completion_message,
    confidentiality_text,
    whats_next_text,
  } = body

  if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin.from('settings').select('id').single()

  const payload = {
    company_name: company_name.trim().slice(0, 60),
    test_name: (test_name ?? '').trim().slice(0, 80) || 'Applicant Logical Test',
    welcome_headline: (welcome_headline ?? '').trim().slice(0, 100),
    welcome_body: (welcome_body ?? '').trim().slice(0, 500),
    completion_message: (completion_message ?? '').trim().slice(0, 500),
    confidentiality_text: (confidentiality_text ?? '').trim().slice(0, 500),
    whats_next_text: (whats_next_text ?? '').trim().slice(0, 500),
    updated_at: new Date().toISOString(),
  }

  let error
  if (existing?.id) {
    ;({ error } = await admin.from('settings').update(payload).eq('id', existing.id))
  } else {
    ;({ error } = await admin.from('settings').insert(payload))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
