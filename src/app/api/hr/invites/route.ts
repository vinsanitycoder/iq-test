import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInviteToken, hashInviteToken } from '@/lib/personality/invite-token'
import { getResend, getFromAddress } from '@/lib/resend'
import { render } from '@react-email/render'
import { InviteEmail } from '@/emails/InviteEmail'

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

function formatDeadline(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface InviteRow {
  id: string
  applicant_id: string
  created_at: string
  expires_at: string
  first_accessed_at: string | null
  email_sent_at: string | null
  status: 'pending' | 'accessed' | 'revoked'
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
  if (Date.parse(expiresAt) <= Date.now()) {
    return NextResponse.json({ error: 'expiresAt must be in the future.' }, { status: 400, headers: NO_STORE })
  }
  // Enforce server-side length cap on the custom message (CLAUDE.md says 2000)
  if (customMessage !== undefined && typeof customMessage !== 'string') {
    return NextResponse.json({ error: 'customMessage must be a string.' }, { status: 400, headers: NO_STORE })
  }
  if (typeof customMessage === 'string' && customMessage.length > 2000) {
    return NextResponse.json({ error: 'customMessage must be 2000 characters or fewer.' }, { status: 400, headers: NO_STORE })
  }

  const admin = createAdminClient()

  // Fetch applicant for the email greeting and to confirm it exists
  const { data: applicant, error: appErr } = await admin
    .from('applicants')
    .select('id, first_name, email')
    .eq('id', applicantId)
    .single()

  if (appErr || !applicant) {
    return NextResponse.json({ error: 'Applicant not found.' }, { status: 404, headers: NO_STORE })
  }

  // Revoke all prior pending + accessed invites for this applicant.
  // This ensures the applicant can't continue a previous partial session
  // and must use the new invite link instead.
  const { error: revokeErr } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .update({ status: 'revoked' })
    .eq('applicant_id', applicantId)
    .in('status', ['pending', 'accessed'])

  if (revokeErr) {
    return NextResponse.json({ error: 'Failed to revoke prior invites.' }, { status: 500, headers: NO_STORE })
  }

  // Generate token, hash, and insert new invite
  const rawToken = generateInviteToken()
  const tokenHash = hashInviteToken(rawToken)

  const { data: inserted, error: insertErr } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .insert({
      applicant_id: applicantId,
      token_hash: tokenHash,
      hash_algorithm: 'sha256',
      expires_at: expiresAt,
      status: 'pending',
    })
    .select('id, applicant_id, created_at, expires_at, first_accessed_at, email_sent_at, status')
    .single<InviteRow>()

  if (insertErr || !inserted) {
    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500, headers: NO_STORE })
  }

  // Build the invite URL and email
  const inviteUrl = `${getAppUrl(req)}/invite/${rawToken}`
  const html = await render(
    InviteEmail({
      applicantFirstName: applicant.first_name ?? 'there',
      inviteUrl,
      deadlineLabel: formatDeadline(expiresAt),
      customMessage: customMessage?.trim() || undefined,
    })
  )

  let emailSent = false
  try {
    const resend = getResend()
    const { error: sendErr } = await resend.emails.send({
      from: getFromAddress(),
      to: applicant.email,
      subject: 'Your personality assessment invitation',
      html,
    })
    if (!sendErr) emailSent = true
  } catch {
    emailSent = false
  }

  if (emailSent) {
    await admin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('invites' as any)
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', inserted.id)
  }

  return NextResponse.json(
    {
      invite: { ...inserted, email_sent_at: emailSent ? new Date().toISOString() : null },
      emailSent,
    },
    { status: 201, headers: NO_STORE }
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
