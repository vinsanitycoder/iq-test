import { createAdminClient } from '@/lib/supabase/admin'
import HRNav from '@/components/hr/HRNav'
import StatusDropdown from '@/components/hr/StatusDropdown'
import DeleteButton from '@/components/hr/DeleteButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type DetailResult = {
  id: string
  raw_score: number
  weighted_score: number
  iq_score: number
  iq_label: string
  percentile: number
  status: string
  reviewed_at: string | null
  created_at: string
  applicants: {
    id: string
    first_name: string
    last_name: string
    email: string
    source: string
    created_at: string
  } | null
  test_sessions: {
    id: string
    start_time: string | null
    end_time: string | null
    time_taken_seconds: number | null
    status: string
    tab_switches: number
    created_at: string
  } | null
}

function formatTime(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const IQ_LABEL_STYLES: Record<string, string> = {
  'Superior':      'bg-purple-100 text-purple-800',
  'Above Average': 'bg-teal-100 text-teal-800',
  'High Average':  'bg-green-100 text-green-800',
  'Average':       'bg-yellow-100 text-yellow-800',
  'Low Average':   'bg-orange-100 text-orange-800',
  'Below Average': 'bg-red-100 text-red-800',
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-fynlo-subtle uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-fynlo-dark font-medium">{value}</dd>
    </div>
  )
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('results')
    .select(`
      id, raw_score, weighted_score, iq_score, iq_label, percentile,
      status, reviewed_at, created_at,
      applicants (id, first_name, last_name, email, source, created_at),
      test_sessions (id, start_time, end_time, time_taken_seconds, status, tab_switches, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const result = data as unknown as DetailResult
  const applicant = result.applicants
  const session = result.test_sessions
  const name = applicant ? `${applicant.first_name} ${applicant.last_name}` : 'Unknown'
  const labelStyle = IQ_LABEL_STYLES[result.iq_label] ?? 'bg-gray-100 text-gray-700'

  return (
    <>
      <HRNav />

      <div className="px-4 sm:px-6 py-6 max-w-screen-lg mx-auto">
        {/* Back link */}
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
            <p className="text-fynlo-subtle text-sm mt-1">{applicant?.email ?? '—'}</p>
          </div>
          <StatusDropdown resultId={result.id} currentStatus={result.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score card */}
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">
              Score
            </h2>

            <div className="flex items-center gap-5 mb-6">
              <div className="text-6xl font-black text-fynlo-teal leading-none">
                {result.iq_score}
              </div>
              <div>
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${labelStyle}`}>
                  {result.iq_label}
                </span>
                <div className="text-fynlo-subtle text-sm mt-2">
                  {ordinal(result.percentile)} percentile
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <Field label="Raw score" value={`${result.raw_score} correct`} />
              <Field label="Weighted score" value={result.weighted_score} />
            </dl>
          </div>

          {/* Session card */}
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">
              Session
            </h2>

            <dl className="grid grid-cols-1 gap-4">
              <Field label="Time taken" value={formatTime(session?.time_taken_seconds ?? null)} />
              <Field
                label="Tab switches"
                value={
                  <span className={(session?.tab_switches ?? 0) > 0 ? 'text-fynlo-terra font-bold' : ''}>
                    {session?.tab_switches ?? 0}
                    {(session?.tab_switches ?? 0) > 0 && (
                      <span className="ml-2 text-xs font-normal text-fynlo-terra">
                        (flagged)
                      </span>
                    )}
                  </span>
                }
              />
              <Field label="Started" value={formatDateTime(session?.start_time ?? null)} />
              <Field label="Submitted" value={formatDateTime(session?.end_time ?? null)} />
            </dl>
          </div>

          {/* Applicant card */}
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">
              Applicant
            </h2>

            <dl className="grid grid-cols-1 gap-4">
              <Field label="First name" value={applicant?.first_name ?? '—'} />
              <Field label="Last name" value={applicant?.last_name ?? '—'} />
              <Field label="Email" value={applicant?.email ?? '—'} />
              <Field label="Source" value={applicant?.source ?? '—'} />
              <Field label="Registered" value={applicant ? formatDate(applicant.created_at) : '—'} />
            </dl>
          </div>

          {/* Review card */}
          <div className="bg-white rounded-card shadow-card p-6">
            <h2 className="text-xs font-bold text-fynlo-subtle uppercase tracking-wide mb-5">
              Review
            </h2>

            <dl className="grid grid-cols-1 gap-4">
              <Field label="Status" value={result.status.replace(/_/g, ' ')} />
              <Field
                label="Reviewed at"
                value={result.reviewed_at ? formatDateTime(result.reviewed_at) : 'Not yet reviewed'}
              />
              <Field label="Submitted at" value={formatDateTime(result.created_at)} />
              <Field label="Result ID" value={
                <span className="font-mono text-xs text-fynlo-subtle">{result.id}</span>
              } />
            </dl>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-6">
          <DeleteButton
            applicantId={applicant?.id ?? ''}
            applicantName={name}
          />
        </div>
      </div>
    </>
  )
}
