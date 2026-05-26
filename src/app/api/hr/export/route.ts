import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ExportRow = {
  iq_score: number
  iq_label: string
  percentile: number
  raw_score: number
  weighted_score: number
  created_at: string
  applicants: {
    id: string
    first_name: string
    last_name: string
    email: string
    status: string | null
    role_applied_for: string | null
    resume_url: string | null
    interview_video_url: string | null
    notes: string | null
  } | null
  test_sessions: { time_taken_seconds: number | null; tab_switches: number } | null
}

function escapeCSV(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  return `"${str.replace(/"/g, '""')}"`
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Optional filter: ?applicantIds=uuid1,uuid2,uuid3 — used by "Export selected" buttons
  const filterIdsRaw = req.nextUrl.searchParams.get('applicantIds')
  const filterIds = filterIdsRaw
    ? filterIdsRaw.split(',').map(s => s.trim()).filter(s => UUID_RE.test(s))
    : null

  const admin = createAdminClient()
  let query = admin
    .from('results')
    .select(`
      iq_score, iq_label, percentile, raw_score, weighted_score, created_at,
      applicants (id, first_name, last_name, email, status, role_applied_for, resume_url, interview_video_url, notes),
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .order('created_at', { ascending: false })

  if (filterIds && filterIds.length > 0) {
    query = query.in('applicant_id', filterIds)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ── Personality results (most recent per applicant) — for type_code column
  const applicantIds = ((data as unknown as ExportRow[]) ?? [])
    .map(r => r.applicants?.id)
    .filter(Boolean) as string[]

  const personalityTypeByApplicant: Record<string, string> = {}
  if (applicantIds.length > 0) {
    const { data: prRows } = await admin
      .from('personality_results' as never)
      .select('applicant_id, type_code, created_at')
      .in('applicant_id', applicantIds)
      .order('created_at', { ascending: false })
      .returns<{ applicant_id: string; type_code: string; created_at: string }[]>()

    for (const row of prRows ?? []) {
      // most recent wins (array already sorted desc)
      if (!personalityTypeByApplicant[row.applicant_id]) {
        personalityTypeByApplicant[row.applicant_id] = row.type_code
      }
    }
  }

  const header = [
    'First Name', 'Last Name', 'Email',
    'Role Applied For', 'Resume URL', 'Interview Video URL', 'Notes',
    'IQ Score', 'IQ Label', 'Percentile',
    'Raw Score', 'Weighted Score',
    'Time Taken (seconds)', 'Tab Switches',
    'Personality Type',
    'Applicant Status', 'Date Completed',
  ]

  const rows = (data as unknown as ExportRow[]).map(row => {
    const a = row.applicants
    const s = row.test_sessions
    const dateCompleted = row.created_at
      ? new Date(row.created_at).toISOString().split('T')[0]
      : ''

    return [
      escapeCSV(a?.first_name),
      escapeCSV(a?.last_name),
      escapeCSV(a?.email),
      escapeCSV(a?.role_applied_for),
      escapeCSV(a?.resume_url),
      escapeCSV(a?.interview_video_url),
      escapeCSV(a?.notes),
      escapeCSV(row.iq_score),
      escapeCSV(row.iq_label),
      escapeCSV(row.percentile),
      escapeCSV(row.raw_score),
      escapeCSV(row.weighted_score),
      escapeCSV(s?.time_taken_seconds),
      escapeCSV(s?.tab_switches ?? 0),
      escapeCSV(personalityTypeByApplicant[a?.id ?? ''] ?? ''),
      escapeCSV(a?.status ?? 'pending_review'),
      escapeCSV(dateCompleted),
    ].join(',')
  })

  const csv = [header.map(escapeCSV).join(','), ...rows].join('\n')
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="applicants-${date}.csv"`,
    },
  })
}
