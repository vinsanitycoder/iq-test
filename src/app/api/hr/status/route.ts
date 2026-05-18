import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ResultStatus } from '@/types/database'

export async function PATCH(request: Request) {
  // Verify HR session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { resultId, status } = body as { resultId: string; status: string }

  const validStatuses: ResultStatus[] = ['pending_review', 'reviewed', 'shortlisted', 'rejected']
  if (!resultId || !validStatuses.includes(status as ResultStatus)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('results')
    .update({
      status: status as ResultStatus,
      reviewed_at: status !== 'pending_review' ? new Date().toISOString() : null,
    })
    .eq('id', resultId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
