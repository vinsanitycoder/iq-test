import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type ExportRow = {
  iq_score: number
  iq_label: string
  percentile: number
  raw_score: number
  weighted_score: number
  status: string
  created_at: string
  applicants: { first_name: string; last_name: string; email: string } | null
  test_sessions: { time_taken_seconds: number | null; tab_switches: number } | null
}

function escapeCSV(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  return `"${str.replace(/"/g, '""')}"`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('results')
    .select(`
      iq_score, iq_label, percentile, raw_score, weighted_score, status, created_at,
      applicants (first_name, last_name, email),
      test_sessions (time_taken_seconds, tab_switches)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const header = [
    'First Name', 'Last Name', 'Email',
    'IQ Score', 'IQ Label', 'Percentile',
    'Raw Score', 'Weighted Score',
    'Time Taken (seconds)', 'Tab Switches',
    'Status', 'Date Completed',
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
      escapeCSV(row.iq_score),
      escapeCSV(row.iq_label),
      escapeCSV(row.percentile),
      escapeCSV(row.raw_score),
      escapeCSV(row.weighted_score),
      escapeCSV(s?.time_taken_seconds),
      escapeCSV(s?.tab_switches ?? 0),
      escapeCSV(row.status),
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
