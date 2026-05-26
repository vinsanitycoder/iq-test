import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('results')
    .select(`
      id, iq_score, iq_label, percentile, created_at,
      applicants (id, first_name, last_name, email, status, role_applied_for, resume_url, interview_video_url),
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = data ?? []
  const applicantIds = results
    .map((r: any) => r.applicants?.id)
    .filter(Boolean) as string[]

  // Build personality_status map for each applicant
  const personalityStatusMap: Record<string, string> = {}

  if (applicantIds.length > 0) {
    // 1. personality_results — most authoritative (most recent wins per applicant)
    const { data: prRows } = await admin
      .from('personality_results' as any)
      .select('applicant_id, status')
      .in('applicant_id', applicantIds)
      .order('created_at', { ascending: false })
      .returns<{ applicant_id: string; status: string }[]>()

    for (const row of prRows ?? []) {
      personalityStatusMap[row.applicant_id] =
        row.status === 'incomplete' ? 'incomplete' : 'completed'
    }

    // 2. in_progress sessions (for applicants without a result yet)
    const { data: sessionRows } = await admin
      .from('personality_sessions' as any)
      .select('status, invites(applicant_id)')
      .eq('status', 'in_progress')
      .returns<{ status: string; invites: { applicant_id: string } | null }[]>()

    for (const row of sessionRows ?? []) {
      const appId = row.invites?.applicant_id
      if (appId && !personalityStatusMap[appId]) {
        personalityStatusMap[appId] = 'in_progress'
      }
    }

    // 3. active invites (for applicants without session or result)
    const { data: inviteRows } = await admin
      .from('invites' as any)
      .select('applicant_id, expires_at, status')
      .in('applicant_id', applicantIds)
      .neq('status', 'revoked')
      .returns<{ applicant_id: string; expires_at: string; status: string }[]>()

    for (const row of inviteRows ?? []) {
      if (!personalityStatusMap[row.applicant_id]) {
        if (new Date(row.expires_at) > new Date()) {
          personalityStatusMap[row.applicant_id] = 'invited'
        }
      }
    }
  }

  const enriched = results.map((r: any) => ({
    ...r,
    status: r.applicants?.status ?? 'pending_review',
    personality_status: personalityStatusMap[r.applicants?.id ?? ''] ?? 'not_invited',
  }))

  return NextResponse.json({ results: enriched }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
