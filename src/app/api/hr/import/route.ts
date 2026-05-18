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

// Maps normalized Indeed column names to our canonical names
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

    const { data: applicant, error: insertErr } = await admin
      .from('applicants')
      .insert({ first_name: firstName, last_name: lastName, email, source: 'indeed' })
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
