/**
 * Personality invite creation helper.
 *
 * Centralises the invite lifecycle so both the HR-triggered POST route and
 * the auto-invite trigger (after IQ completion) share identical logic:
 *   1. Verify the applicant exists.
 *   2. Revoke any prior pending/accessed invites for this applicant.
 *   3. Generate a fresh token + hash, insert a new invite row.
 *   4. Render and send the email via Resend.
 *   5. Mark email_sent_at on success.
 *
 * Note: this is callable from any server-side context. It does NOT enforce
 * auth — the caller is responsible (HR routes call requireAdmin first; the
 * auto-invite path runs under server trust after IQ completion).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { generateInviteToken, hashInviteToken } from '@/lib/personality/invite-token'
import { getResend, getFromAddress } from '@/lib/resend'
import { render } from '@react-email/render'
import { InviteEmail } from '@/emails/InviteEmail'

export interface InviteRow {
  id: string
  applicant_id: string
  created_at: string
  expires_at: string
  first_accessed_at: string | null
  email_sent_at: string | null
  status: 'pending' | 'accessed' | 'revoked'
}

export interface CreateAndSendInviteOptions {
  /** Absolute URL of the deployment (e.g. https://cognitivetest.fynloapps.com). Used for the invite link. */
  baseUrl: string
  /** ISO timestamp when the invite expires. Must be in the future. */
  expiresAt: string
  /** Optional custom message HR wrote into the email. Max 2000 chars. */
  customMessage?: string
}

export type CreateAndSendInviteResult =
  | { ok: true; invite: InviteRow; emailSent: boolean }
  | { ok: false; error: string }

function formatDeadline(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function createAndSendInvite(
  applicantId: string,
  options: CreateAndSendInviteOptions,
): Promise<CreateAndSendInviteResult> {
  const { baseUrl, expiresAt, customMessage } = options

  if (Date.parse(expiresAt) <= Date.now()) {
    return { ok: false, error: 'expiresAt must be in the future.' }
  }
  if (typeof customMessage === 'string' && customMessage.length > 2000) {
    return { ok: false, error: 'customMessage must be 2000 characters or fewer.' }
  }

  const admin = createAdminClient()

  // Fetch applicant for the email greeting and to confirm it exists
  const { data: applicant, error: appErr } = await admin
    .from('applicants')
    .select('id, first_name, email')
    .eq('id', applicantId)
    .single()

  if (appErr || !applicant) {
    return { ok: false, error: 'Applicant not found.' }
  }

  // Revoke all prior pending + accessed invites for this applicant.
  // This ensures only one live invite per applicant at any time.
  const { error: revokeErr } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('invites' as any)
    .update({ status: 'revoked' })
    .eq('applicant_id', applicantId)
    .in('status', ['pending', 'accessed'])

  if (revokeErr) {
    return { ok: false, error: 'Failed to revoke prior invites.' }
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
    return { ok: false, error: 'Failed to create invite.' }
  }

  // Build invite URL + email HTML
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/invite/${rawToken}`
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

  let finalEmailSentAt: string | null = null
  if (emailSent) {
    finalEmailSentAt = new Date().toISOString()
    await admin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('invites' as any)
      .update({ email_sent_at: finalEmailSentAt })
      .eq('id', inserted.id)
  }

  return {
    ok: true,
    invite: { ...inserted, email_sent_at: finalEmailSentAt },
    emailSent,
  }
}
