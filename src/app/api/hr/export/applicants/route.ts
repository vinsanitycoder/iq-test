import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function escapeCsvField(value: string | null | undefined): string {
  const str = value ?? ''
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('applicants')
    .select('first_name, last_name, email, role_applied_for, resume_url, interview_video_url, notes')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []

  const headers = ['Email', 'First Name', 'Last Name', 'Role Applied For', 'Resume URL', 'Interview Video URL', 'Notes']
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      escapeCsvField(r.email),
      escapeCsvField(r.first_name),
      escapeCsvField(r.last_name),
      escapeCsvField(r.role_applied_for),
      escapeCsvField(r.resume_url),
      escapeCsvField(r.interview_video_url),
      escapeCsvField(r.notes),
    ].join(',')),
  ]

  const csv = lines.join('\r\n')
  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="applicants-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
