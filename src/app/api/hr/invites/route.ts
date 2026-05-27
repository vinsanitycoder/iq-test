import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAndSendInvite } from '@/lib/personality/send-invite'

const NO_STORE = { 'Cache-Control': 'no-store' } as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  return user
}

function getAppUrl(req: NextRequest): string {
  // Derive base URL from the request itself so invite links always point
  // to the server that sent them — no env var needed, staging-safe.
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('host') ?? req.nextUrl.host
  return `${proto}://${host}`
}

// POST: create a new invite, revoke prior pending invites, send the email
export async function POST(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  let body: { applicantId?: string; expiresAt?: string; customMessage?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: NO_STORE })
  }

  const { applicantId, expiresAt, customMessage } = body
  if (!applicantId || typeof applicantId !== 'string' || !UUID_RE.test(applicantId)) {
    return NextResponse.json({ error: 'applicantId must be a valid UUID.' }, { status: 400, headers: NO_STORE })
  }
  if (!expiresAt || typeof expiresAt !== 'string' || Number.isNaN(Date.parse(expiresAt))) {
    return NextResponse.json({ error: 'expiresAt must be a valid ISO date.' }, { status: 400, headers: NO_STORE })
  }
  if (customMessage !== undefined && typeof customMessage !== 'string') {
    return NextResponse.json({ error: 'customMessage must be a string.' }, { status: 400, headers: NO_STORE })
  }

  const result = await createAndSendInvite(applicantId, {
    baseUrl: getAppUrl(req),
    expiresAt,
    customMessage,
  })

  if (!result.ok) {
    // Map the helper's error strings to appropriate HTTP statuses
    const status = result.error === 'Applicant not found.' ? 404
      : result.error.startsWith('expiresAt') || result.error.startsWith('customMessage') ? 400
      : 500
    return NextResponse.json({ error: result.error }, { status, headers: NO_STORE })
  }

  return NextResponse.json(
    { invite: result.invite, emailSent: result.emailSent },
    { status: 201, headers: NO_STORE },
  )
}

// GET: list all invites for an applicant
export async function GET(req: NextRequest) {
  const caller = await requireAdmin()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })

  const applicantId = req.nextUrl.searchParams.get('applicantId')
  if (!applicantId) {
    return NextResponse.json({ error: 'applicantId query param is required.' }, { status: 400, headers: NO_STORE })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .select('id, applicant_id, created_at, expires_at, first_accessed_at, email_sent_at, status')
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to list invites.' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ invites: data ?? [] }, { headers: NO_STORE })
}
