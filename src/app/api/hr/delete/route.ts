import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  // Verify HR session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { applicantId } = body as { applicantId: string }

  if (!applicantId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Deleting the applicant cascades to test_sessions, answers, results, indeed_imports
  const admin = createAdminClient()
  const { error } = await admin
    .from('applicants')
    .delete()
    .eq('id', applicantId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
