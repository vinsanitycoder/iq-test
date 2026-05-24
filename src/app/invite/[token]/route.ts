import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashInviteToken } from '@/lib/personality/invite-token'

const COOKIE_NAME = 'personality_session_token'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface InviteRow {
  id: string
  applicant_id: string
  expires_at: string
  first_accessed_at: string | null
  status: 'pending' | 'accessed' | 'revoked'
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params
  const base = req.nextUrl.origin

  // Token format check: must be exactly 64 lowercase hex chars
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL('/personality/invalid', base))
  }

  const tokenHash = hashInviteToken(token)
  const admin = createAdminClient()

  const { data: invite, error } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .select('id, applicant_id, expires_at, first_accessed_at, status')
    .eq('token_hash', tokenHash)
    .maybeSingle<InviteRow>()

  if (error || !invite) {
    return NextResponse.redirect(new URL('/personality/invalid', base))
  }

  if (invite.status === 'revoked') {
    return NextResponse.redirect(new URL('/personality/invalid', base))
  }

  // Live expiry check — never trust stored status alone
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(new URL('/personality/expired', base))
  }

  // Mark first access (idempotent — only updates if not already set)
  if (!invite.first_accessed_at) {
    await admin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('invites' as any)
      .update({
        first_accessed_at: new Date().toISOString(),
        status: 'accessed',
      })
      .eq('id', invite.id)
      .is('first_accessed_at', null)
  }

  // Build redirect response and set the httpOnly cookie on it
  const isProd = process.env.NODE_ENV === 'production'
  const response = NextResponse.redirect(new URL('/personality/welcome', base))

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    ...(isProd ? { domain: '.fynloapps.com' } : {}),
  })

  return response
}
