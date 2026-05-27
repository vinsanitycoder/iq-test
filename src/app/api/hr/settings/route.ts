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
  return NextResponse.json({ settings: data ?? null }, {
    headers: { 'Cache-Control': 'no-store' },
  })
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
    auto_send_personality_invite,
    auto_invite_deadline_days,
  } = body

  if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
  }

  // Validate auto-invite fields if provided (omit to leave unchanged)
  let autoSend: boolean | undefined
  if (auto_send_personality_invite !== undefined) {
    if (typeof auto_send_personality_invite !== 'boolean') {
      return NextResponse.json({ error: 'auto_send_personality_invite must be a boolean.' }, { status: 400 })
    }
    autoSend = auto_send_personality_invite
  }

  let autoDays: number | undefined
  if (auto_invite_deadline_days !== undefined) {
    if (typeof auto_invite_deadline_days !== 'number'
        || !Number.isInteger(auto_invite_deadline_days)
        || auto_invite_deadline_days < 1
        || auto_invite_deadline_days > 365) {
      return NextResponse.json(
        { error: 'auto_invite_deadline_days must be an integer between 1 and 365.' },
        { status: 400 },
      )
    }
    autoDays = auto_invite_deadline_days
  }

  const admin = createAdminClient()
  const { data: existing } = await admin.from('settings').select('id').single()

  const payload: Record<string, unknown> = {
    company_name: company_name.trim().slice(0, 60),
    test_name: (test_name ?? '').trim().slice(0, 80) || 'Applicant Logical Test',
    welcome_headline: (welcome_headline ?? '').trim().slice(0, 100),
    welcome_body: (welcome_body ?? '').trim().slice(0, 500),
    completion_message: (completion_message ?? '').trim().slice(0, 500),
    confidentiality_text: (confidentiality_text ?? '').trim().slice(0, 500),
    whats_next_text: (whats_next_text ?? '').trim().slice(0, 500),
    updated_at: new Date().toISOString(),
  }
  if (autoSend !== undefined) payload.auto_send_personality_invite = autoSend
  if (autoDays !== undefined) payload.auto_invite_deadline_days = autoDays

  let error
  if (existing?.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;({ error } = await admin.from('settings' as any).update(payload).eq('id', existing.id))
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;({ error } = await admin.from('settings' as any).insert(payload))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
