'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import HRNav from '@/components/hr/HRNav'
import DeleteButton from '@/components/hr/DeleteButton'
import DimensionBar from '@/components/hr/DimensionBar'
import InvitePanel from '@/components/hr/InvitePanel'
import { PERSONALITY_TYPES } from '@/lib/personality/types'
import type { TypeCode } from '@/lib/personality/types'

// ── Types ────────────────────────────────────────────────────────────────────

type Applicant = {
  id: string
  first_name: string
  last_name: string
  email: string
  source: string
  created_at: string
  role_applied_for: string | null
  resume_url: string | null
  interview_video_url: string | null
  notes: string | null
}

type IQResult = {
  id: string
  raw_score: number
  weighted_score: number
  iq_score: number
  iq_label: string
  percentile: number
  status: string
  reviewed_at: string | null
  created_at: string
  test_sessions: {
    time_taken_seconds: number | null
    tab_switches: number
    start_time: string | null
    end_time: string | null
  } | null
}

type PersonalityResult = {
  id: string
  ei_score: number
  sn_score: number
  tf_score: number
  jp_score: number
  ei_label: string
  sn_label: string
  tf_label: string
  jp_label: string
  type_code: string
  total_answers_at_scoring: number
  status: string
  reviewed_at: string | null
  created_at: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

// ── Inline editable field ─────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string
  value: string | null
  placeholder: string
  onSave: (val: string | null) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setDraft(value ?? '') }, [value])

  async function save() {
    setSaving(true)
    await onSave(draft.trim() || null)
    setSaving(false)
    setEditing(false)
  }

  function cancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  return (
    <div>
      <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">{label}</dt>
      {editing ? (
        <dd className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
            disabled={saving}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50"
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-fynlo-teal text-white hover:opacity-80 disabled:opacity-40"
          >
            {saving ? '…' : 'Save'}
          </button>
          <button
            onClick={cancel}
            disabled={saving}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-fynlo-body hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
        </dd>
      ) : (
        <dd
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => setEditing(true)}
        >
          <span className={`text-fynlo-dark font-medium ${!value ? 'italic text-fynlo-subtle font-normal' : ''}`}>
            {value || placeholder}
          </span>
          <svg className="w-3.5 h-3.5 text-fynlo-subtle opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
          </svg>
        </dd>
      )}
    </div>
  )
}

// ── Inline editable notes (textarea) ─────────────────────────────────────────

function EditableNotesField({
  value,
  onSave,
}: {
  value: string | null
  onSave: (val: string | null) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setDraft(value ?? '') }, [value])

  async function save() {
    setSaving(true)
    await onSave(draft.trim() || null)
    setSaving(false)
    setEditing(false)
  }

  function cancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  return (
    <div className="col-span-full">
      <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Notes</dt>
      {editing ? (
        <dd className="space-y-2">
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') cancel() }}
            disabled={saving}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fynlo-teal/40 disabled:opacity-50 resize-y"
            placeholder="Add internal notes about this applicant…"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-fynlo-teal text-white hover:opacity-80 disabled:opacity-40"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-fynlo-body hover:bg-gray-50 disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </dd>
      ) : (
        <dd
          className="group cursor-pointer"
          onClick={() => setEditing(true)}
        >
          {value ? (
            <div className="flex items-start gap-2">
              <p className="text-sm text-fynlo-dark font-medium whitespace-pre-wrap flex-1">{value}</p>
              <svg className="w-3.5 h-3.5 text-fynlo-subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm italic text-fynlo-subtle">Click to add notes…</span>
              <svg className="w-3.5 h-3.5 text-fynlo-subtle opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
              </svg>
            </div>
          )}
        </dd>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ApplicantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [iqResult, setIqResult] = useState<IQResult | null>(null)
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/hr/applicant/${id}`, { cache: 'no-store' })
    if (!res.ok) { setNotFound(true); setLoading(false); return }
    const data = await res.json()
    // Old result-ID URL — API resolved it to the correct applicant ID
    if (data.redirect) { router.replace(data.redirect); return }
    setApplicant(data.applicant)
    setIqResult(data.iqResult)
    setPersonalityResult(data.personalityResult)
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  async function patchField(field: string, value: string | null) {
    await fetch(`/api/hr/applicant/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    await load()
  }

  if (loading) {
    return (
      <>
        <HRNav />
        <div className="py-24 text-center text-fynlo-subtle text-sm">Loading…</div>
      </>
    )
  }

  if (notFound || !applicant) {
    return (
      <>
        <HRNav />
        <div className="py-24 text-center">
          <p className="text-fynlo-subtle text-sm mb-4">Applicant not found.</p>
          <Link href="/hr" className="text-sm text-fynlo-teal underline">Back to dashboard</Link>
        </div>
      </>
    )
  }

  const name = `${applicant.first_name} ${applicant.last_name}`
  const iqLabelStyle = IQ_LABEL_STYLES[iqResult?.iq_label ?? ''] ?? 'bg-gray-100 text-gray-700'
  const session = iqResult?.test_sessions ?? null

  const typeCard = personalityResult?.type_code
    ? PERSONALITY_TYPES[personalityResult.type_code as TypeCode]
    : null

  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-screen-lg mx-auto">
        {/* Back */}
        <Link
          href="/hr"
          className="inline-flex items-center gap-1.5 text-sm text-fynlo-subtle hover:text-fynlo-teal transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All applicants
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-fynlo-dark">{name}</h1>
            <p className="text-fynlo-subtle text-sm mt-1">{applicant.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* IQ Score card */}
          {iqResult ? (
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="mb-5">
                <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">IQ Score</h2>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="text-6xl font-black text-fynlo-teal leading-none">
                  {iqResult.iq_score}
                </div>
                <div>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${iqLabelStyle}`}>
                    {iqResult.iq_label}
                  </span>
                  <div className="text-fynlo-subtle text-sm mt-2">
                    {ordinal(iqResult.percentile)} percentile
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Raw score</dt>
                  <dd className="text-fynlo-dark font-medium">{iqResult.raw_score} correct</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Time taken</dt>
                  <dd className="text-fynlo-dark font-medium">{formatTime(session?.time_taken_seconds ?? null)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Tab switches</dt>
                  <dd className={`font-medium ${(session?.tab_switches ?? 0) > 0 ? 'text-fynlo-terra font-bold' : 'text-fynlo-dark'}`}>
                    {session?.tab_switches ?? 0}
                    {(session?.tab_switches ?? 0) > 0 && <span className="ml-1 text-xs font-normal"> (flagged)</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Submitted</dt>
                  <dd className="text-fynlo-dark font-medium">{formatDateTime(session?.end_time ?? null)}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="bg-white rounded-card shadow-card p-6 flex items-center justify-center">
              <p className="text-fynlo-subtle text-sm italic">No IQ test submitted yet.</p>
            </div>
          )}

          {/* Personality result card */}
          {personalityResult && personalityResult.status !== 'incomplete' && typeCard ? (
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="mb-5">
                <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide">Personality</h2>
              </div>

              {/* Type badge */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-xl font-black text-white shrink-0"
                  style={{ backgroundColor: '#0084AD' }}
                >
                  {personalityResult.type_code}
                </span>
                <div>
                  <div className="font-black text-fynlo-dark text-lg leading-tight">{typeCard.name}</div>
                  <div className="text-xs text-fynlo-subtle mt-0.5">{personalityResult.total_answers_at_scoring} questions answered</div>
                </div>
              </div>

              {/* Dimension bars */}
              <div className="space-y-3 mb-5">
                <DimensionBar leftPole="E" rightPole="I" score={personalityResult.ei_score} label={personalityResult.ei_label} />
                <DimensionBar leftPole="S" rightPole="N" score={personalityResult.sn_score} label={personalityResult.sn_label} />
                <DimensionBar leftPole="T" rightPole="F" score={personalityResult.tf_score} label={personalityResult.tf_label} />
                <DimensionBar leftPole="J" rightPole="P" score={personalityResult.jp_score} label={personalityResult.jp_label} />
              </div>

              {/* Description */}
              <p className="text-sm text-fynlo-body leading-relaxed mb-4">{typeCard.description}</p>

              {/* Strengths */}
              <div className="mb-3">
                <div className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-2">Strengths</div>
                <ul className="space-y-1">
                  {typeCard.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-fynlo-body">
                      <span className="shrink-0 text-fynlo-teal font-bold">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Watch-outs */}
              <div>
                <div className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-2">Watch-outs</div>
                <ul className="space-y-1">
                  {typeCard.watchOuts.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-fynlo-body">
                      <span className="shrink-0 text-fynlo-terra font-bold">·</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : personalityResult?.status === 'incomplete' ? (
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-4">Personality</h2>
              <p className="text-sm text-fynlo-body">
                Assessment incomplete — only {personalityResult.total_answers_at_scoring} of 100 questions answered (minimum 60 required).
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-card shadow-card p-6 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-fynlo-subtle text-sm italic">No personality assessment yet.</p>
              <p className="text-xs text-fynlo-subtle">Send an invite from the dashboard to get started.</p>
            </div>
          )}

          {/* Applicant info */}
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">Applicant</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Name</dt>
                <dd className="text-fynlo-dark font-medium">{name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Email</dt>
                <dd className="text-fynlo-dark font-medium">{applicant.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Source</dt>
                <dd className="text-fynlo-dark font-medium">{applicant.source}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">Registered</dt>
                <dd className="text-fynlo-dark font-medium">{formatDate(applicant.created_at)}</dd>
              </div>
              <EditableField
                label="Role applied for"
                value={applicant.role_applied_for}
                placeholder="Click to add…"
                onSave={val => patchField('role_applied_for', val)}
              />
              <EditableField
                label="Resume URL"
                value={applicant.resume_url}
                placeholder="Click to add (https://…)"
                onSave={val => patchField('resume_url', val)}
              />
              <EditableField
                label="Interview video URL"
                value={applicant.interview_video_url}
                placeholder="Click to add (https://…)"
                onSave={val => patchField('interview_video_url', val)}
              />
              <EditableNotesField
                value={applicant.notes}
                onSave={val => patchField('notes', val)}
              />
            </dl>
          </div>

        </div>

        {/* Invite history */}
        <div className="mt-4">
          <InvitePanel
            applicantId={applicant.id}
            applicantFirstName={applicant.first_name}
            applicantEmail={applicant.email}
          />
        </div>

        {/* Danger zone */}
        <div className="mt-4">
          <DeleteButton
            applicantId={applicant.id}
            applicantName={name}
          />
        </div>
      </div>
    </>
  )
}
