'use client'

import { useCallback, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type InviteRow = {
  id: string
  created_at: string
  expires_at: string
  first_accessed_at: string | null
  email_sent_at: string | null
  status: 'pending' | 'accessed' | 'revoked'
}

function computeDisplayStatus(invite: InviteRow): 'pending' | 'accessed' | 'revoked' | 'expired' {
  if (invite.status === 'revoked') return 'revoked'
  if (new Date(invite.expires_at) < new Date()) return 'expired'
  return invite.status
}

const STATUS_LABELS: Record<string, string> = {
  pending:  'Pending',
  accessed: 'Accessed',
  revoked:  'Revoked',
  expired:  'Expired',
}

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  accessed: 'bg-teal-100 text-teal-700',
  revoked:  'bg-gray-100 text-gray-500',
  expired:  'bg-gray-100 text-gray-500',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function defaultDeadline(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

function minDeadline(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

type Props = {
  applicantId: string
  applicantFirstName: string
  applicantEmail: string
}

export default function InvitePanel({ applicantId, applicantFirstName, applicantEmail }: Props) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [invites, setInvites] = useState<InviteRow[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [deadline, setDeadline] = useState(defaultDeadline())
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)

  // Revoke state
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Check admin status via browser Supabase client
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.app_metadata?.role === 'admin')
    })
  }, [])

  const loadInvites = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr/invites?applicantId=${applicantId}`, { cache: 'no-store' })
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setInvites(data.invites ?? [])
    } finally {
      setLoading(false)
    }
  }, [applicantId])

  useEffect(() => {
    if (isAdmin) loadInvites()
    else if (isAdmin === false) setLoading(false)
  }, [isAdmin, loadInvites])

  async function handleSend() {
    if (sending) return
    setSending(true)
    setSendResult(null)

    const expiresAt = new Date(deadline)
    expiresAt.setHours(23, 59, 59, 999)

    const res = await fetch('/api/hr/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, expiresAt: expiresAt.toISOString() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setSendResult({ ok: false, message: data.error ?? 'Failed to send invite.' })
    } else {
      setSendResult({
        ok: true,
        message: data.emailSent
          ? `Invite sent to ${applicantEmail}.`
          : `Invite created but the email failed to send. Please resend manually.`,
      })
      await loadInvites()
    }
    setSending(false)
  }

  function openModal() {
    setDeadline(defaultDeadline())
    setSendResult(null)
    setShowModal(true)
  }

  function closeModal() {
    if (sending) return
    setShowModal(false)
    setSendResult(null)
  }

  async function handleRevoke(inviteId: string) {
    if (revokingId) return
    setRevokingId(inviteId)
    const res = await fetch(`/api/hr/invites/${inviteId}/revoke`, { method: 'PATCH' })
    if (res.ok) await loadInvites()
    setRevokingId(null)
  }

  // Non-admin: hide entirely
  if (isAdmin === false) return null

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <>
      <div className="bg-white rounded-card shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">Invite History</h2>
          {isAdmin && (
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#0084AD' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Send Invite
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-fynlo-subtle text-sm py-4 text-center">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="text-fynlo-subtle text-sm italic">No invites sent yet.</p>
        ) : (
          <div className="space-y-3">
            {invites.map(invite => {
              const displayStatus = computeDisplayStatus(invite)
              const canRevoke = displayStatus === 'pending'
              const isRevoking = revokingId === invite.id

              return (
                <div key={invite.id} className="flex flex-wrap items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}>
                        {STATUS_LABELS[displayStatus]}
                      </span>
                      {invite.email_sent_at ? (
                        <span className="text-xs text-fynlo-subtle">Email sent {formatDateTime(invite.email_sent_at)}</span>
                      ) : (
                        <span className="text-xs text-fynlo-terra font-semibold">Email not confirmed sent</span>
                      )}
                    </div>
                    <div className="text-xs text-fynlo-subtle">
                      Created {formatDate(invite.created_at)} · Deadline {formatDate(invite.expires_at)}
                    </div>
                    {invite.first_accessed_at && (
                      <div className="text-xs text-fynlo-subtle">
                        First opened {formatDateTime(invite.first_accessed_at)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAdmin && (
                      <button
                        onClick={openModal}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-fynlo-body hover:bg-gray-50 transition-colors"
                      >
                        Resend
                      </button>
                    )}
                    {isAdmin && canRevoke && (
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        disabled={isRevoking}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        {isRevoking ? 'Revoking…' : 'Revoke'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Send Invite Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-fynlo-dark">Send Personality Invite</h3>
              <button
                onClick={closeModal}
                disabled={sending}
                className="text-fynlo-subtle hover:text-fynlo-dark transition-colors disabled:opacity-40"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Recipient */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Sending to</div>
              <div className="text-sm font-medium text-fynlo-dark">
                {applicantFirstName} · <span className="text-fynlo-subtle font-normal">{applicantEmail}</span>
              </div>
            </div>

            {/* Deadline picker */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                min={minDeadline()}
                onChange={e => setDeadline(e.target.value)}
                disabled={sending}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
              />
            </div>

            {/* Email preview */}
            <div className="mb-5 bg-fynlo-bg rounded-xl p-4 text-sm text-fynlo-body space-y-2">
              <div className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-2">Email preview</div>
              <p><strong>Hi {applicantFirstName},</strong></p>
              <p>Thanks for your interest in joining the team. As the next step, we&apos;d love for you to complete a short personality assessment.</p>
              <p>It&apos;s 100 questions and takes about 30–45 minutes. There are no right or wrong answers — just be yourself.</p>
              <p>Please complete it by <strong>{deadlineLabel}</strong>.</p>
            </div>

            {/* Result message */}
            {sendResult && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${sendResult.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
                {sendResult.message}
              </div>
            )}

            {/* Actions */}
            {!sendResult?.ok && (
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !deadline}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: '#BC3F1D' }}
                >
                  {sending ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            )}

            {sendResult?.ok && (
              <button
                onClick={closeModal}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
