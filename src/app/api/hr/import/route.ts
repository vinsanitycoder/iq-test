import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        row.push(field)
        field = ''
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++
        row.push(field)
        field = ''
        if (row.some(f => f.trim())) rows.push(row)
        row = []
      } else {
        field += ch
      }
    }
  }
  row.push(field)
  if (row.some(f => f.trim())) rows.push(row)

  return rows
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_\-]+/g, '_')
}

// Maps normalized column names to our canonical names
const COLUMN_ALIASES: Record<string, string> = {
  first_name: 'first_name',
  firstname: 'first_name',
  first: 'first_name',
  last_name: 'last_name',
  lastname: 'last_name',
  surname: 'last_name',
  last: 'last_name',
  email: 'email',
  email_address: 'email',
  e_mail: 'email',
  candidate_email: 'email',
  role_applied_for: 'role_applied_for',
  role: 'role_applied_for',
  position: 'role_applied_for',
  job_title: 'role_applied_for',
  resume_url: 'resume_url',
  resume: 'resume_url',
  cv_url: 'resume_url',
  cv: 'resume_url',
  interview_video_url: 'interview_video_url',
  video_url: 'interview_video_url',
  video: 'interview_video_url',
  interview_video: 'interview_video_url',
}

const REQUIRED = ['first_name', 'last_name', 'email'] as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length < 2) {
    return NextResponse.json({ error: 'The file is empty or has no data rows.' }, { status: 400 })
  }

  // Build header → column index map
  const rawHeaders = rows[0]
  const headerMap: Record<string, number> = {}
  rawHeaders.forEach((h, idx) => {
    const normalized = normalizeHeader(h)
    const canonical = COLUMN_ALIASES[normalized]
    if (canonical) headerMap[canonical] = idx
  })

  // Validate required columns present
  const missing = REQUIRED.filter(col => !(col in headerMap))
  if (missing.length > 0) {
    const readable = missing.map(m => m.replace(/_/g, ' ')).join(', ')
    return NextResponse.json(
      { error: `Missing required columns: ${readable}. Please check the file and try again.` },
      { status: 400 }
    )
  }

  const dataRows = rows.slice(1)
  const admin = createAdminClient()

  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const firstName = row[headerMap['first_name']]?.trim()
    const lastName = row[headerMap['last_name']]?.trim()
    const email = row[headerMap['email']]?.trim()

    if (!firstName || !lastName || !email) {
      errors.push(`Row ${i + 2}: missing first name, last name, or email — skipped.`)
      continue
    }

    const roleAppliedFor = headerMap['role_applied_for'] !== undefined
      ? row[headerMap['role_applied_for']]?.trim() || null
      : null
    const resumeUrl = headerMap['resume_url'] !== undefined
      ? row[headerMap['resume_url']]?.trim() || null
      : null
    const videoUrl = headerMap['interview_video_url'] !== undefined
      ? row[headerMap['interview_video_url']]?.trim() || null
      : null

    // Skip rows with invalid URLs
    for (const [field, val] of [['resume_url', resumeUrl], ['interview_video_url', videoUrl]] as const) {
      if (val && !/^https?:\/\//i.test(val)) {
        errors.push(`Row ${i + 2}: ${field} must start with http:// or https:// — value ignored.`)
      }
    }

    const insertData = {
      first_name: firstName,
      last_name: lastName,
      email,
      source: 'indeed',
      role_applied_for: roleAppliedFor ?? null,
      resume_url: (resumeUrl && /^https?:\/\//i.test(resumeUrl)) ? resumeUrl : null,
      interview_video_url: (videoUrl && /^https?:\/\//i.test(videoUrl)) ? videoUrl : null,
    }

    const { data: applicant, error: insertErr } = await admin
      .from('applicants')
      .insert(insertData)
      .select('id')
      .single()

    if (insertErr || !applicant) {
      errors.push(`Row ${i + 2}: could not insert applicant — ${insertErr?.message ?? 'unknown error'}.`)
      continue
    }

    await admin
      .from('indeed_imports')
      .insert({ applicant_id: applicant.id, source_file: file.name })

    imported++
  }

  return NextResponse.json({ imported, errors })
}
