import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const NO_STORE = { 'Cache-Control': 'no-store' } as const

// Server-side length caps, matching the limits documented in CLAUDE.md
const FIELD_MAX_LENGTHS: Record<string, number> = {
  role_applied_for:    100,
  resume_url:          500,
  interview_video_url: 500,
  notes:               500,
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function requireHR() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET: full applicant record — IQ result, personality result, applicant info
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireHR()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  const { id } = await params
  const admin = createAdminClient()

  // Look up by applicant ID
  const { data: applicant, error: appError } = await admin
    .from('applicants' as any)
    .select('id, first_name, last_name, email, source, created_at, role_applied_for, resume_url, interview_video_url, notes')
    .eq('id', id)
    .maybeSingle<{
      id: string
      first_name: string
      last_name: string
      email: string
      source: string
      created_at: string
      role_applied_for: string | null
      resume_url: string | null
      interview_video_url: string | null
      notes: string | null
    }>()

  if (appError || !applicant) {
    // Not found as applicant ID — check if it's an old IQ result ID and redirect
    const { data: resultRow } = await admin
      .from('results' as any)
      .select('applicant_id')
      .eq('id', id)
      .maybeSingle<{ applicant_id: string }>()

    if (resultRow?.applicant_id) {
      return NextResponse.json(
        { redirect: `/hr/applicant/${resultRow.applicant_id}` },
        { headers: NO_STORE }
      )
    }

    return NextResponse.json({ error: 'Applicant not found.' }, { status: 404, headers: NO_STORE })
  }

  // IQ result + session
  const { data: iqResult } = await admin
    .from('results' as any)
    .select(`
      id, raw_score, weighted_score, iq_score, iq_label, percentile,
      status, reviewed_at, created_at,
      test_sessions (id, start_time, end_time, time_taken_seconds, status, tab_switches)
    `)
    .eq('applicant_id', applicant.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Personality result — via applicant_id
  const { data: personalityResult } = await admin
    .from('personality_results' as any)
    .select('id, ei_score, sn_score, tf_score, jp_score, ei_label, sn_label, tf_label, jp_label, type_code, total_answers_at_scoring, status, reviewed_at, created_at')
    .eq('applicant_id', applicant.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json(
    { applicant, iqResult: iqResult ?? null, personalityResult: personalityResult ?? null },
    { headers: NO_STORE }
  )
}

// PATCH: update HR-editable fields on applicant
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireHR()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid applicant id.' }, { status: 400, headers: NO_STORE })
  }
  const body = await req.json()

  // Only allow these fields — never accept anything else
  const allowed = ['role_applied_for', 'resume_url', 'interview_video_url', 'notes'] as const
  const updates: Record<string, string | null> = {}
  for (const field of allowed) {
    if (field in body) {
      const val = body[field]
      if (val !== null && typeof val !== 'string') {
        return NextResponse.json({ error: `Invalid value for ${field}.` }, { status: 400, headers: NO_STORE })
      }
      // Validate URLs
      if ((field === 'resume_url' || field === 'interview_video_url') && val) {
        if (!/^https?:\/\//i.test(val)) {
          return NextResponse.json({ error: `${field} must start with http:// or https://.` }, { status: 400, headers: NO_STORE })
        }
      }
      // Enforce length caps server-side (client also caps, but never trust the client)
      if (val !== null && val.length > FIELD_MAX_LENGTHS[field]) {
        return NextResponse.json(
          { error: `${field} must be ${FIELD_MAX_LENGTHS[field]} characters or fewer.` },
          { status: 400, headers: NO_STORE },
        )
      }
      updates[field] = val ?? null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400, headers: NO_STORE })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('applicants' as any)
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
