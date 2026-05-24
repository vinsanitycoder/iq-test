import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashInviteToken } from './invite-token'

export const PERSONALITY_COOKIE = 'personality_session_token'

export interface InviteRow {
  id: string
  applicant_id: string
  expires_at: string
  status: 'pending' | 'accessed' | 'revoked'
}

export interface SessionRow {
  id: string
  invite_id: string
  start_time: string | null
  end_time: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'expired'
  tab_switches: number
}

export interface PersonalityAuth {
  invite: InviteRow
  session: SessionRow | null
}

/**
 * Reads and validates the personality_session_token cookie.
 * Checks token format, SHA-256 hash match, not revoked, not expired (live check).
 * Returns { invite, session } or null if invalid.
 * Used in every personality API route AND server page — never rely on middleware alone.
 */
export async function validatePersonalityCookie(): Promise<PersonalityAuth | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PERSONALITY_COOKIE)?.value

  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null

  const tokenHash = hashInviteToken(token)
  const admin = createAdminClient()

  const { data: invite } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .select('id, applicant_id, expires_at, status')
    .eq('token_hash', tokenHash)
    .maybeSingle<InviteRow>()

  if (!invite) return null
  if (invite.status === 'revoked') return null
  // Live expiry check — never trust stored status alone
  if (new Date(invite.expires_at).getTime() < Date.now()) return null

  const { data: session } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('personality_sessions' as any)
    .select('id, invite_id, start_time, end_time, status, tab_switches')
    .eq('invite_id', invite.id)
    .maybeSingle<SessionRow>()

  return { invite, session: session ?? null }
}
