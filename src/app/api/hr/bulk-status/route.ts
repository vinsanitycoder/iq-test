import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const VALID = ['pending_review', 'reviewed', 'shortlisted', 'rejected']

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resultIds, status } = await request.json()
  if (!Array.isArray(resultIds) || resultIds.length === 0 || !VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('results')
    .update({ status, reviewed_at: new Date().toISOString() })
    .in('id', resultIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
