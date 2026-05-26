'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import StatusDropdown from './StatusDropdown'
import RowDeleteButton from './RowDeleteButton'

type DashboardRow = {
  id: string
  iq_score: number
  iq_label: string
  percentile: number
  status: string
  created_at: string
  personality_status: string
  personality_type_code: string | null
  applicants: {
    id: string
    first_name: string
    last_name: string
    email: string
    role_applied_for: string | null
    resume_url: string | null
    interview_video_url: string | null
    notes: string | null
  } | null
  test_sessions: { time_taken_seconds: number | null; tab_switches: number } | null
}

const PERSONALITY_STATUS_LABELS: Record<string, string> = {
  not_invited:  'Not invited',
  invited:      'Invited',
  in_progress:  'In Progress',
  completed:    'Completed',
  incomplete:   'Incomplete',
}

const PERSONALITY_STATUS_STYLES: Record<string, string> = {
  not_invited:  'bg-gray-100 text-gray-400',
  invited:      'bg-blue-100 text-blue-700',
  in_progress:  'bg-yellow-100 text-yellow-700',
  completed:    'bg-lime-200 text-green-900',
  incomplete:   'bg-orange-100 text-orange-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending',
  reviewed:       'Reviewed',
  shortlisted:    'Shortlisted',
  rejected:       'Rejected',
}

const IQ_LABEL_STYLES: Record<string, string> = {
  'Superior':      'bg-purple-100 text-purple-800',
  'Above Average': 'bg-teal-100 text-teal-800',
  'High Average':  'bg-green-100 text-green-800',
  'Average':       'bg-yellow-100 text-yellow-800',
  'Low Average':   'bg-orange-100 text-orange-800',
  'Below Average': 'bg-red-100 text-red-800',
}

function formatTime(seconds: number | null) {
  if (seconds == null) return '—'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
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

// ── Invite modal (shown from dashboard row) ────────────────────────────────

const DEFAULT_EMAIL_BODY = `Thanks for your interest in joining us. As the next step, we'd love for you to complete a short personality assessment.

It's 100 questions and takes about 30–45 minutes. There are no right or wrong answers — just be yourself. You can pause and return on a different device if you need to.`

function InviteModal({
  applicantId,
  applicantFirstName,
  applicantEmail,
  onClose,
  onSent,
}: {
  applicantId: string
  applicantFirstName: string
  applicantEmail: string
  onClose: () => void
  onSent: () => void
}) {
  const [deadline, setDeadline] = useState(defaultDeadline())
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const deadlineLabel = deadline
    ? new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  async function handleSend() {
    if (sending) return
    setSending(true)
    setResult(null)

    const expiresAt = new Date(deadline)
    expiresAt.setHours(23, 59, 59, 999)

    const res = await fetch('/api/hr/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, expiresAt: expiresAt.toISOString(), customMessage: emailBody.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setResult({ ok: false, message: data.error ?? 'Failed to send invite.' })
    } else {
      setResult({
        ok: true,
        message: data.emailSent
          ? `Invite sent to ${applicantEmail}.`
          : `Invite created but the email failed to send. Please resend from the applicant page.`,
      })
      onSent()
    }
    setSending(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget && !sending) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-fynlo-dark">Send Personality Invite</h3>
          <button onClick={onClose} disabled={sending} className="text-fynlo-subtle hover:text-fynlo-dark transition-colors disabled:opacity-40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Sending to</div>
          <div className="text-sm font-medium text-fynlo-dark">
            {applicantFirstName} · <span className="text-fynlo-subtle font-normal">{applicantEmail}</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Deadline</label>
          <input
            type="date"
            value={deadline}
            min={minDeadline()}
            onChange={e => setDeadline(e.target.value)}
            disabled={sending}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Email message</label>
          <div className="text-xs text-fynlo-subtle mb-2">
            <span className="font-medium text-fynlo-dark">Hi {applicantFirstName},</span> is added automatically at the top. The deadline and link are added at the bottom.
          </div>
          <textarea
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
            disabled={sending}
            rows={6}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50 resize-none leading-relaxed"
          />
          <div className="text-xs text-fynlo-subtle mt-1.5 flex justify-between">
            <span>Use two line breaks to start a new paragraph.</span>
            <span className={emailBody.length > 1800 ? 'text-orange-500 font-semibold' : ''}>{emailBody.length}/2000</span>
          </div>
        </div>

        {result && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
            {result.message}
          </div>
        )}

        {!result?.ok ? (
          <div className="flex gap-3">
            <button onClick={onClose} disabled={sending} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !deadline || emailBody.trim().length === 0 || emailBody.length > 2000}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: '#BC3F1D' }}
            >
              {sending ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors">
            Close
          </button>
        )}
      </div>
    </div>
  )
}

// ── Quick-edit modal (role / resume / video from dashboard row) ────────────

function QuickEditModal({
  applicantId,
  applicantName,
  initialRole,
  initialResume,
  initialVideo,
  initialNotes,
  onClose,
  onSaved,
}: {
  applicantId: string
  applicantName: string
  initialRole: string | null
  initialResume: string | null
  initialVideo: string | null
  initialNotes: string | null
  onClose: () => void
  onSaved: () => void
}) {
  const [role, setRole] = useState(initialRole ?? '')
  const [resume, setResume] = useState(initialResume ?? '')
  const [video, setVideo] = useState(initialVideo ?? '')
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    if (resume && !/^https?:\/\//i.test(resume)) {
      setError('Resume URL must start with http:// or https://')
      return
    }
    if (video && !/^https?:\/\//i.test(video)) {
      setError('Video URL must start with http:// or https://')
      return
    }
    setSaving(true)
    const res = await fetch(`/api/hr/applicant/${applicantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role_applied_for: role.trim() || null,
        resume_url: resume.trim() || null,
        interview_video_url: video.trim() || null,
        notes: notes.trim() || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Save failed.')
    } else {
      onSaved()
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget && !saving) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-black text-fynlo-dark">Edit Applicant</h3>
          <button onClick={onClose} disabled={saving} className="text-fynlo-subtle hover:text-fynlo-dark transition-colors disabled:opacity-40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-fynlo-subtle mb-5">{applicantName}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Role applied for</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              disabled={saving}
              placeholder="e.g. Senior Accountant"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Resume URL</label>
            <input
              type="url"
              value={resume}
              onChange={e => setResume(e.target.value)}
              disabled={saving}
              placeholder="https://…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Interview video URL</label>
            <input
              type="url"
              value={video}
              onChange={e => setVideo(e.target.value)}
              disabled={saving}
              placeholder="https://…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Internal notes about this applicant…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50 resize-y"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-700">{error}</div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: '#0084AD' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DashboardTable() {
  const [results, setResults] = useState<DashboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')
  const [applyingStatus, setApplyingStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [briefDownloading, setBriefDownloading] = useState(false)
  const [briefError, setBriefError] = useState('')
  const [inviteTarget, setInviteTarget] = useState<{ id: string; firstName: string; email: string } | null>(null)
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; role: string | null; resume: string | null; video: string | null; notes: string | null } | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/hr/results', { cache: 'no-store' })
      const json = await res.json()
      setResults(json.results ?? [])
    } catch {
      // keep existing data on network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.app_metadata?.role === 'admin')
    })
  }, [])

  useEffect(() => {
    if (!selectAllRef.current) return
    const all = results.length > 0 && selected.size === results.length
    const some = selected.size > 0 && selected.size < results.length
    selectAllRef.current.checked = all
    selectAllRef.current.indeterminate = some
  }, [selected, results])

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map(r => r.id)))
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
    setBulkStatus('')
  }

  async function handleBulkStatus() {
    if (!bulkStatus || applyingStatus) return
    setApplyingStatus(true)
    try {
      const applicantIds = results
        .filter(r => selected.has(r.id) && r.applicants?.id)
        .map(r => r.applicants!.id)
      await fetch('/api/hr/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantIds, status: bulkStatus }),
      })
      clearSelection()
      await load()
    } catch {
      // silent
    } finally {
      setApplyingStatus(false)
    }
  }

  async function handleBriefDownload() {
    if (briefDownloading) return
    setBriefDownloading(true)
    setBriefError('')
    try {
      const applicantIds = results
        .filter(r => selected.has(r.id) && r.applicants?.id)
        .map(r => r.applicants!.id)
      if (applicantIds.length === 0) {
        setBriefError('No valid candidates selected.')
        return
      }
      const res = await fetch('/api/hr/applicants/batch-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantIds }),
      })
      if (!res.ok) {
        let msg = 'Could not generate the interview brief.'
        try { const j = await res.json(); if (j.error) msg = j.error } catch {}
        setBriefError(msg)
        return
      }
      const blob = await res.blob()
      const date = new Date().toISOString().split('T')[0]
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `interview-brief-${date}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Revoke after a tick so the browser has time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setBriefError('Network error — please try again.')
    } finally {
      setBriefDownloading(false)
    }
  }

  async function handleBulkDelete() {
    setDeleting(true)
    try {
      const applicantIds = results
        .filter(r => selected.has(r.id) && r.applicants?.id)
        .map(r => r.applicants!.id)
      await fetch('/api/hr/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantIds }),
      })
      clearSelection()
      await load()
    } catch {
      // silent
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const selectedCount = selected.size
  const selectedNames = results
    .filter(r => selected.has(r.id))
    .map(r => r.applicants ? `${r.applicants.first_name} ${r.applicants.last_name}` : 'Unknown')

  if (loading) {
    return <div className="py-16 text-center text-fynlo-subtle text-sm">Loading…</div>
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card px-8 py-16 text-center">
        <p className="text-fynlo-subtle text-sm">No submissions yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 bg-fynlo-dark text-white px-4 py-3 rounded-xl">
          <span className="text-sm font-semibold whitespace-nowrap">{selectedCount} selected</span>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
              disabled={applyingStatus}
              className="text-xs rounded-lg px-2.5 py-1.5 border border-white/20 bg-white/10 text-white disabled:opacity-50 cursor-pointer"
            >
              <option value="">Change status…</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <button
              onClick={handleBulkStatus}
              disabled={!bulkStatus || applyingStatus}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {applyingStatus ? 'Applying…' : 'Apply'}
            </button>
          </div>

          <button
            onClick={handleBriefDownload}
            disabled={briefDownloading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-40 whitespace-nowrap"
            title="Generate a one-page interview brief PDF for the selected candidates"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {briefDownloading ? 'Generating…' : 'Interview Brief PDF'}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Delete selected
          </button>

          <button onClick={clearSelection} className="text-white/60 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Interview brief error banner */}
      {briefError && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center justify-between">
          <span>{briefError}</span>
          <button onClick={() => setBriefError('')} className="text-red-500 hover:text-red-700 ml-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-8">
                  <input ref={selectAllRef} type="checkbox" onChange={toggleAll} className="rounded border-gray-300 text-fynlo-teal cursor-pointer accent-fynlo-teal" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide w-full">Applicant</th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">IQ</th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden sm:table-cell">Label</th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden lg:table-cell">Time</th>
                <th className="text-center px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden lg:table-cell">Tabs</th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide hidden md:table-cell">Personality</th>
                <th className="text-left px-4 py-3 font-semibold text-fynlo-subtle text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map(row => {
                const applicant = row.applicants
                const name = applicant ? `${applicant.first_name} ${applicant.last_name}` : 'Unknown'
                const email = applicant?.email ?? '—'
                const labelStyle = IQ_LABEL_STYLES[row.iq_label] ?? 'bg-gray-100 text-gray-700'
                const isSelected = selected.has(row.id)
                const canInvite = row.personality_status === 'not_invited'

                return (
                  <tr key={row.id} className={`transition-colors ${isSelected ? 'bg-teal-50' : 'hover:bg-fynlo-bg/60'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(row.id)} className="rounded border-gray-300 cursor-pointer accent-fynlo-teal" />
                    </td>
                    <td className="px-4 py-3 max-w-0 w-full">
                      <Link href={`/hr/applicant/${applicant?.id ?? row.id}`} className="group">
                        <div className="font-semibold text-fynlo-dark group-hover:text-fynlo-teal transition-colors truncate">{name}</div>
                        <div className="text-fynlo-subtle text-xs mt-0.5 truncate">{email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-fynlo-dark text-base">{row.iq_score}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${labelStyle}`}>
                        {row.iq_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-fynlo-body hidden lg:table-cell">
                      {formatTime(row.test_sessions?.time_taken_seconds ?? null)}
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {(row.test_sessions?.tab_switches ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-fynlo-terra">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                          {row.test_sessions!.tab_switches}
                        </span>
                      ) : (
                        <span className="text-xs text-fynlo-subtle">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-fynlo-subtle hidden md:table-cell">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {isAdmin && canInvite ? (
                        <button
                          onClick={() => setInviteTarget({ id: applicant!.id, firstName: applicant!.first_name, email: applicant!.email })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
                          style={{ backgroundColor: '#0084AD' }}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Invite
                        </button>
                      ) : row.personality_status === 'completed' && row.personality_type_code ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black tracking-wider bg-purple-100 text-purple-800">
                            {row.personality_type_code}
                          </span>
                        </div>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${PERSONALITY_STATUS_STYLES[row.personality_status] ?? 'bg-gray-100 text-gray-400'}`}>
                          {PERSONALITY_STATUS_LABELS[row.personality_status] ?? 'Not invited'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        applicantId={applicant?.id ?? row.id}
                        currentStatus={row.status}
                        compact
                        onUpdate={load}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditTarget({
                            id: applicant?.id ?? row.id,
                            name,
                            role: applicant?.role_applied_for ?? null,
                            resume: applicant?.resume_url ?? null,
                            video: applicant?.interview_video_url ?? null,
                            notes: applicant?.notes ?? null,
                          })}
                          title="Edit applicant details"
                          className="p-1 rounded-lg text-fynlo-subtle hover:text-fynlo-teal hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                        </button>
                        <RowDeleteButton applicantId={applicant?.id ?? ''} applicantName={name} onDelete={load} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send invite modal */}
      {inviteTarget && (
        <InviteModal
          applicantId={inviteTarget.id}
          applicantFirstName={inviteTarget.firstName}
          applicantEmail={inviteTarget.email}
          onClose={() => setInviteTarget(null)}
          onSent={() => { load(); setInviteTarget(null) }}
        />
      )}

      {/* Quick-edit modal */}
      {editTarget && (
        <QuickEditModal
          applicantId={editTarget.id}
          applicantName={editTarget.name}
          initialRole={editTarget.role}
          initialResume={editTarget.resume}
          initialVideo={editTarget.video}
          initialNotes={editTarget.notes}
          onClose={() => setEditTarget(null)}
          onSaved={() => { load(); setEditTarget(null) }}
        />
      )}

      {/* Bulk delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget && !deleting) setShowDeleteModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-black text-fynlo-dark mb-2">
              Delete {selectedCount} {selectedCount === 1 ? 'applicant' : 'applicants'}?
            </h2>
            <p className="text-sm text-fynlo-body mb-3">
              This will permanently delete the following and all their test data:
            </p>
            <ul className="text-sm font-semibold text-fynlo-dark mb-6 space-y-1 max-h-40 overflow-y-auto">
              {selectedNames.map((n, i) => <li key={i}>· {n}</li>)}
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-fynlo-body hover:bg-gray-50 transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleBulkDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Yes, delete all'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
