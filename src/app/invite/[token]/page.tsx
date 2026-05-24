import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashInviteToken } from '@/lib/personality/invite-token'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'personality_session_token'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface InviteRow {
  id: string
  applicant_id: string
  expires_at: string
  first_accessed_at: string | null
  status: 'pending' | 'accessed' | 'revoked'
}

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Token format check: 64-char hex
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    redirect('/personality/invalid')
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
    redirect('/personality/invalid')
  }

  if (invite.status === 'revoked') {
    redirect('/personality/invalid')
  }

  // Live expiry check — never trust stored status alone
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    redirect('/personality/expired')
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

  // Set the httpOnly session cookie (raw token, scoped to apex domain in prod)
  const isProd = process.env.NODE_ENV === 'production'
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    ...(isProd ? { domain: '.fynloapps.com' } : {}),
  })

  redirect('/personality/welcome')
}
