import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

const ALLOWED_STATUSES = ['pending_review', 'reviewed', 'shortlisted', 'rejected', 'incomplete']

// PATCH: update personality result status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400, headers: NO_STORE })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('personality_results' as any)
    .update({
      status,
      reviewed_at: ['reviewed', 'shortlisted', 'rejected'].includes(status)
        ? new Date().toISOString()
        : null,
      reviewed_by: ['reviewed', 'shortlisted', 'rejected'].includes(status)
        ? user.id
        : null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
